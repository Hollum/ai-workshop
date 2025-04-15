import { debugGraph } from "@/utils/debugGraph";
import { BaseMessage } from "@langchain/core/messages";
import { Annotation, END, messagesStateReducer, START, StateGraph } from "@langchain/langgraph";
import { ChatOpenAI } from "@langchain/openai";

const graphName = "Task 1";
export const graph1 = async () => {
  const mainModel = new ChatOpenAI({ model: "gpt-4o-mini", temperature: 0.7 });
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
    //TODO: Fix me

    //Du kan bruke denne funksjonen til å debugge når du løser oppgaven
    debugGraph({
      debugName: graphName,
      description: "Generating answer",
      value: { ["ditt objekt"]: "TODO: Implement the logic for generating the answer" },
      color: "red",
    });
    return {};
  }

  const workflow = new StateGraph(GraphState);

  //TODO: Fix me
  workflow.addEdge(START, END);
  return workflow.compile();
};
