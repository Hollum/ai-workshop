import { BaseMessage } from "@langchain/core/messages";
import { Annotation, END, messagesStateReducer, START, StateGraph } from "@langchain/langgraph";

export const graph1 = async () => {
  // Extended state with tool flags
  const GraphState = Annotation.Root({
    messages: Annotation<BaseMessage[]>({
      reducer: messagesStateReducer,
      default: () => [],
    }),
  });

  async function generateAnswer(
    state: typeof GraphState.State,
  ): Promise<Partial<typeof GraphState.State>> {
    return {
      messages: state.messages,
    };
  }

  // Define the workflow with conditional branching
  const workflow = new StateGraph(GraphState).addNode("generate", generateAnswer);

  // Define the edges with conditional branching
  workflow.addEdge(START, "generate");
  workflow.addEdge("generate", END);

  return workflow.compile();
};
