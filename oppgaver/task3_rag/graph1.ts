import { prisma } from "@/lib/prisma";
import { debugGraph } from "@/utils/debugGraph";
import { PrismaVectorStore } from "@langchain/community/vectorstores/prisma";
import { Document } from "@langchain/core/documents";
import { BaseMessage } from "@langchain/core/messages";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { PromptTemplate } from "@langchain/core/prompts";
import { RunnableSequence } from "@langchain/core/runnables";
import { Annotation, END, messagesStateReducer, START, StateGraph } from "@langchain/langgraph";
import { ChatOpenAI, OpenAIEmbeddings } from "@langchain/openai";
import { Document as DocumentDb, Prisma } from "@prisma/client";
interface Graph1Props {
  mainModel: ChatOpenAI;
}

const formatChatHistory = (chatHistory: BaseMessage[]) => {
  const formattedDialogueTurns = chatHistory.map((message) => {
    return `${message.getType()}: ${message.content}`;
  });
  return formattedDialogueTurns.join("\n");
};

const CONDENSE_QUESTION_TEMPLATE = `Given the following conversation and a follow up question, rephrase the follow up question to be a standalone question, in its original language.

<chat_history>
  {chat_history}
</chat_history>

Follow Up Input: {question}
Standalone question:`;

const ANSWER_TEMPLATE = `
You're a helpful assistant answering questions about the context provided.

Answer the question based only on the following context and chat history:
<context>
  {context}
</context>

<chat_history>
  {chat_history}
</chat_history>

Question: {question}

If the question is not related to the context, just say "Sorry mac, spørsmålet ditt er ikke relevant konteksten som er gitt".
`;
const answerPrompt = PromptTemplate.fromTemplate(ANSWER_TEMPLATE);

const condenseQuestionPrompt = PromptTemplate.fromTemplate(CONDENSE_QUESTION_TEMPLATE);

const combineDocumentsFn = (docs: Document[]) => {
  const serializedDocs = docs.map((doc) => doc.pageContent);
  return serializedDocs.join("\n\n");
};
const graphName = "Graph 3";
export const graph3 = async ({ mainModel }: Graph1Props) => {
  // Extended state with tool flags
  const GraphState = Annotation.Root({
    messages: Annotation<BaseMessage[]>({
      reducer: messagesStateReducer,
      default: () => [],
    }),
    formattedQuestion: Annotation<string>,
    response: Annotation<string>,
    documents: Annotation<Document[]>,
  });

  async function formatQuestion(
    state: typeof GraphState.State,
  ): Promise<Partial<typeof GraphState.State>> {
    const model = new ChatOpenAI({
      model: "gpt-4o-mini",
      temperature: 0.2,
    });

    const standaloneQuestionChain = RunnableSequence.from([
      condenseQuestionPrompt,
      model,
      new StringOutputParser(),
    ]);

    const question = await standaloneQuestionChain.invoke({
      chat_history: state.messages,
      question: state.formattedQuestion,
    });

    debugGraph({
      debugName: graphName,
      description: "Formatted question",
      value: question,
    });

    return {
      formattedQuestion: question,
    };
  }

  async function retrieve(
    state: typeof GraphState.State,
  ): Promise<Partial<typeof GraphState.State>> {
    const vectorStore = PrismaVectorStore.withModel<DocumentDb>(prisma).create(
      new OpenAIEmbeddings(),
      {
        prisma: Prisma,
        tableName: "Document",
        vectorColumnName: "vector",
        columns: {
          id: PrismaVectorStore.IdColumn,
          content: PrismaVectorStore.ContentColumn,
        },
      },
    );

    const lastMessage = state.messages[state.messages.length - 1].content.toString();

    const TOTAL_DOCS_TO_RETRIEVE = 3;
    const documents = await vectorStore.similaritySearch(lastMessage, TOTAL_DOCS_TO_RETRIEVE);

    debugGraph({
      debugName: graphName,
      description: "Retrieved documents",
      value: documents,
    });

    return {
      documents,
    };
  }

  async function generateAnswer(
    state: typeof GraphState.State,
  ): Promise<Partial<typeof GraphState.State>> {
    const answer = await answerPrompt.pipe(mainModel).invoke({
      chat_history: formatChatHistory(state.messages),
      context: combineDocumentsFn(state.documents),
      question: state.formattedQuestion,
    });

    const formatedPrompt = await answerPrompt.format({
      chat_history: formatChatHistory(state.messages),
      context: combineDocumentsFn(state.documents),
      question: state.formattedQuestion,
    });

    //Hjelpe funksjon for å se hva som blir sendt til LLM
    debugGraph({
      debugName: graphName,
      description: "Formated prompt",
      value: formatedPrompt,
      color: "yellow",
    });

    debugGraph({
      debugName: graphName,
      description: "Generated answer",
      value: answer.content,
      color: "green",
    });

    return {
      messages: [answer],
    };
  }

  const workflow = new StateGraph(GraphState)
    .addNode("formatQuestion", formatQuestion)
    .addNode("retrieve", retrieve)
    .addNode("generate", generateAnswer);

  workflow.addEdge(START, "formatQuestion");
  workflow.addEdge("formatQuestion", "retrieve");
  workflow.addEdge("retrieve", "generate");
  workflow.addEdge("generate", END);

  // Return the compiled graph
  return workflow.compile();
};
