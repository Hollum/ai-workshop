import { prisma } from "@/lib/prisma";
import { debugGraph } from "@/utils/debugGraph";
import { formatChatHistory, removeLastMessage } from "@/utils/mappers";
import { PrismaVectorStore } from "@langchain/community/vectorstores/prisma";
import { Document } from "@langchain/core/documents";
import { BaseMessage } from "@langchain/core/messages";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { RunnableSequence } from "@langchain/core/runnables";
import { Annotation, END, messagesStateReducer, START, StateGraph } from "@langchain/langgraph";
import { ChatOpenAI, OpenAIEmbeddings } from "@langchain/openai";
import { Document as DocumentDb, Prisma } from "@prisma/client";
import { answerPrompt, condenseQuestionPrompt } from "../kokebok/prompts/prompts";

const combineDocumentsFn = (docs: Document[]) => {
  const serializedDocs = docs.map((doc) => doc.pageContent);
  return serializedDocs.join("\n\n");
};
const graphName = "Graph 3";
export const graph3 = async () => {
  const mainModel = new ChatOpenAI({ model: "gpt-4o-mini", temperature: 0.7 });
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
      chat_history: removeLastMessage(state.messages),
      question: state.messages[state.messages.length - 1].content,
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

    const TOTAL_DOCS_TO_RETRIEVE = 5;
    const documents = await vectorStore.similaritySearch(
      state.formattedQuestion,
      TOTAL_DOCS_TO_RETRIEVE,
    );

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
      chat_history: formatChatHistory({
        chatHistory: state.messages,
        removeLastMessage: true,
      }),
      context: combineDocumentsFn(state.documents),
      question: state.formattedQuestion,
    });

    //Bare brukt til logging - se kommentar nedenfor
    const formatedPrompt = await answerPrompt.format({
      chat_history: formatChatHistory({
        chatHistory: state.messages,
        removeLastMessage: true,
      }),
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
