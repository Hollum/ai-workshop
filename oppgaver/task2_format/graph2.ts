import { debugGraph } from "@/utils/debugGraph";
import { removeLastMessage, replaceLastMessage } from "@/utils/mappers";
import { BaseMessage, HumanMessage } from "@langchain/core/messages";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { RunnableSequence } from "@langchain/core/runnables";
import { Annotation, END, messagesStateReducer, START, StateGraph } from "@langchain/langgraph";
import { ChatOpenAI } from "@langchain/openai";
import { condenseQuestionPrompt } from "../kokebok/prompts/prompts";

const graphName = "Task 2";
export const graph2 = async () => {
  const mainModel = new ChatOpenAI({ model: "gpt-4o-mini", temperature: 0.7 });
  // Extended state with tool flags
  const GraphState = Annotation.Root({
    messages: Annotation<BaseMessage[]>({
      reducer: messagesStateReducer,
      default: () => [],
    }),
    formattedQuestion: Annotation<string>,
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

  async function generateAnswer(
    state: typeof GraphState.State,
  ): Promise<Partial<typeof GraphState.State>> {
    const replacedLastMessage = replaceLastMessage({
      chatHistory: state.messages,
      newMessage: new HumanMessage(state.formattedQuestion),
    });

    const message = await mainModel.invoke(replacedLastMessage);

    debugGraph({
      debugName: graphName,
      description: "Generated answer",
      value: message,
    });

    return {
      messages: [message], //Reducer appends the message to the messages array
    };
  }

  const workflow = new StateGraph(GraphState)
    .addNode("formatQuestion", formatQuestion)
    .addNode("generate", generateAnswer);

  workflow.addEdge(START, "formatQuestion");
  workflow.addEdge("formatQuestion", "generate");
  workflow.addEdge("generate", END);

  // Return the compiled graph
  return workflow.compile();
};
