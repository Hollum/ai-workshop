import { BaseMessage } from "@langchain/core/messages";
import { Annotation, END, messagesStateReducer, START, StateGraph } from "@langchain/langgraph";
import { ChatOpenAI } from "@langchain/openai";
import { graph4 } from "./task4_agent/ro_ned/faen_så_fast/graph4";

export const MainStateAnnotation = Annotation.Root({
  messages: Annotation<BaseMessage[]>({
    reducer: messagesStateReducer,
    default: () => [],
  }),
  response: Annotation<string>,
});

export const mainGraph = async function () {
  const mainModel = new ChatOpenAI({ model: "gpt-4o-mini", temperature: 0.7 });

  const currentTask = async (state: typeof MainStateAnnotation.State) => {
    const graph = await graph4({ mainModel }); //TODO: ENDRE DETTE TIL Å BLI DEN OPPGAVEN DU ER PÅ
    const ragOutput = await graph.invoke({
      messages: state.messages,
    });

    return {
      messages: ragOutput.messages,
      response: ragOutput.response,
    };
  };

  // Build the main graph
  const builder = new StateGraph(MainStateAnnotation)
    .addNode("currentTask", currentTask)
    .addEdge(START, "currentTask")
    .addEdge("currentTask", END);

  // Compile with a checkpointer if needed
  const app = builder.compile();

  return app;
};
