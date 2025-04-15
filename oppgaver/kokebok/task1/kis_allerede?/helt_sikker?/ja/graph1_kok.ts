import { CHADGPT_TEMPLATE } from "@/oppgaver/kokebok/prompts/prompts";
import { BaseMessage, SystemMessage } from "@langchain/core/messages";
import { ChatPromptTemplate, MessagesPlaceholder } from "@langchain/core/prompts";
import { Annotation, END, messagesStateReducer, START, StateGraph } from "@langchain/langgraph";
import { ChatOpenAI } from "@langchain/openai";

const graphName = "Task 1";
export const kokebokGraph1 = async () => {
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
    const prompt = ChatPromptTemplate.fromMessages([
      new SystemMessage(CHADGPT_TEMPLATE),
      new MessagesPlaceholder("messages"),
    ]);

    const message = await prompt.pipe(mainModel).invoke({
      messages: state.messages,
    });

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
