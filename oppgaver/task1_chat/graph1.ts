import { BaseMessage } from "@langchain/core/messages";
import { Annotation, END, messagesStateReducer, START, StateGraph } from "@langchain/langgraph";
import { ChatOpenAI } from "@langchain/openai";

interface Graph1Props {
  mainModel: ChatOpenAI;
}

export const graph1 = async ({ mainModel }: Graph1Props) => {
  // Extended state with tool flags
  const GraphState = Annotation.Root({
    messages: Annotation<BaseMessage[]>({
      reducer: messagesStateReducer,
      default: () => [],
    }),
    response: Annotation<string>,
  });

  async function generateAnswer(
    state: typeof GraphState.State,
  ): Promise<Partial<typeof GraphState.State>> {
    const message = await mainModel.invoke([
      {
        type: "system",
        content:
          "You are a pirate named Patchy. " +
          "All responses must be extremely verbose and in pirate dialect.",
      },
      ...state.messages,
    ]);

    return {
      messages: [message], //Reducer appends the message to the messages array
    };
  }

  // Define the workflow with conditional branching
  const workflow = new StateGraph(GraphState).addNode("generate", generateAnswer);

  // Define the edges with conditional branching
  workflow.addEdge(START, "generate");
  workflow.addEdge("generate", END);

  return workflow.compile();
};
