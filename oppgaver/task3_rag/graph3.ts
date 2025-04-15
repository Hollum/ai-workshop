import { Document } from "@langchain/core/documents";
import { BaseMessage } from "@langchain/core/messages";
import { Annotation, END, messagesStateReducer, START, StateGraph } from "@langchain/langgraph";
import { ChatOpenAI } from "@langchain/openai";


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
    //TODO: Fix me
    return {};
  }

  async function retrieve(
    state: typeof GraphState.State,
  ): Promise<Partial<typeof GraphState.State>> {
    //TODO: Fix me
    return {};
  }

  async function generateAnswer(
    state: typeof GraphState.State,
  ): Promise<Partial<typeof GraphState.State>> {
    //TODO: Fix me
    return {};
  }

  //TODO: Fix me
  const workflow = new StateGraph(GraphState);
  workflow.addEdge(START, END);
  return workflow.compile();
};
