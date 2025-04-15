import { answerPrompt } from "@/oppgaver/kokebok/prompts/prompts";
import { debugGraph } from "@/utils/debugGraph";
import { combineDocumentsFn, formatChatHistory } from "@/utils/mappers";
import { Document } from "@langchain/core/documents";
import { BaseMessage } from "@langchain/core/messages";
import { Annotation, END, messagesStateReducer, START, StateGraph } from "@langchain/langgraph";
import { ChatOpenAI } from "@langchain/openai";
import { FETCH_RELEVANT_DOCUMENTS_TOOL, searchTool } from "./tools_kok";

const graphName = "Graph 4";

export const kokebokGraph4 = async () => {
  const mainModel = new ChatOpenAI({ model: "gpt-4o-mini", temperature: 0.7 });
  // Extended state with tool flags
  const GraphState = Annotation.Root({
    messages: Annotation<BaseMessage[]>({
      reducer: messagesStateReducer,
      default: () => [],
    }),
    documents: Annotation<Document[]>,
  });

  const llmModel = new ChatOpenAI({ model: "gpt-4o", temperature: 0.2 });

  const callModel = async (state: typeof GraphState.State) => {
    const llmWithTools = llmModel.bindTools([searchTool()]);

    const result = await llmWithTools.invoke(state.messages);

    const toolCalledFromAgent = result.tool_calls?.find(
      (toolCall) => toolCall.name === FETCH_RELEVANT_DOCUMENTS_TOOL,
    );

    if (toolCalledFromAgent) {
      const result = await searchTool().invoke({ query: toolCalledFromAgent.args.query });

      debugGraph({
        debugName: graphName,
        description: "Documents",
        value: result,
      });

      const answer = await answerPrompt.pipe(mainModel).invoke({
        context: combineDocumentsFn(result),
        chat_history: formatChatHistory({
          chatHistory: state.messages,
          removeLastMessage: true,
        }),
        question: state.messages[state.messages.length - 1].content,
      });

      debugGraph({
        debugName: graphName,
        description: "Answer with documents",
        value: {
          context: combineDocumentsFn(result),
          answer,
          documents: result.length,
        },
      });

      return {
        messages: [answer],
      };
    }

    //Hvis ingen tools ble kalt, så returner vi det som ble returnert fra LLM
    return {
      messages: [result],
    };
  };

  const workflow = new StateGraph(GraphState).addNode("callModel", callModel);

  workflow.addEdge(START, "callModel");
  workflow.addEdge("callModel", END);

  // Return the compiled graph
  return workflow.compile();
};
