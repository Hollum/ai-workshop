import { Document } from "@langchain/core/documents";
import { AIMessage, BaseMessage } from "@langchain/core/messages";
import { Annotation, END, messagesStateReducer, START, StateGraph } from "@langchain/langgraph";
import { ChatOpenAI } from "@langchain/openai";

const graphName = "Graph 4";
export const graph4 = async () => {
  const mainModel = new ChatOpenAI({ model: "gpt-4o-mini", temperature: 0.7 });
  // Extended state with tool flags
  const GraphState = Annotation.Root({
    messages: Annotation<BaseMessage[]>({
      reducer: messagesStateReducer,
      default: () => [],
    }),
    documents: Annotation<Document[]>,
    agentResponse: Annotation<AIMessage>,
  });

  const llmModel = new ChatOpenAI({ model: "gpt-4o", temperature: 0.2 });

  const callModel = async (state: typeof GraphState.State) => {
    //TODO: Fix me
    return {};
  };

  const executeTool = async (state: typeof GraphState.State) => {
    //TODO: Fix me
    return {};
  };

  //TODO: Fix me
  const workflow = new StateGraph(GraphState);
  workflow.addEdge(START, END);

  // Return the compiled graph
  return workflow.compile();
};
