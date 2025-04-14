import { answerPrompt } from "@/oppgaver/kokebok/prompts/prompts";
import { debugGraph } from "@/utils/debugGraph";
import { formatChatHistory } from "@/utils/mappers";
import { Document } from "@langchain/core/documents";
import { AIMessage, BaseMessage } from "@langchain/core/messages";
import { Annotation, END, messagesStateReducer, START, StateGraph } from "@langchain/langgraph";
import { ChatOpenAI } from "@langchain/openai";
import { FETCH_RELEVANT_DOCUMENTS_TOOL, searchTool } from "./tools";

const combineDocumentsFn = (docs: Document[]) => {
  const serializedDocs = docs.map((doc) => doc.pageContent);
  return serializedDocs.join("\n\n");
};

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
    const llmWithTools = llmModel.bindTools([searchTool()]);

    const result = await llmWithTools.invoke(state.messages);

    return {
      agentResponse: result,
    };
  };

  const executeTool = async (state: typeof GraphState.State) => {
    debugGraph({
      debugName: graphName,
      description: "Tool calls in last message",
      value: state.agentResponse.tool_calls,
      color: "red",
    });

    const toolCalledFromAgent = state.agentResponse.tool_calls?.find(
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
        }),
        question: state.agentResponse.content,
      });

      debugGraph({
        debugName: graphName,
        description: "Answer with documents",
        value: answer,
      });

      //Bruker respons fra agent LLM som baserer seg på dokumenter som ble hentet
      return {
        messages: [answer],
      };
    }

    return {
      messages: [new AIMessage("No tools called - ikkje peiling")],
    };
  };

  const workflow = new StateGraph(GraphState)
    .addNode("callModel", callModel)
    .addNode("executeTool", executeTool);

  workflow.addEdge(START, "callModel");
  workflow.addEdge("callModel", "executeTool");
  workflow.addEdge("executeTool", END);

  // Return the compiled graph
  return workflow.compile();
};
