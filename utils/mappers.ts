import { AIMessage, BaseMessage, ChatMessage, HumanMessage } from "@langchain/core/messages";
import { Message as VercelChatMessage } from "ai";
import { Document } from "@langchain/core/documents";
export const convertVercelMessageToLangChainMessage = (message: VercelChatMessage) => {
  if (message.role === "user") {
    return new HumanMessage(message.content);
  } else if (message.role === "assistant") {
    return new AIMessage(message.content);
  } else {
    return new ChatMessage(message.content, message.role);
  }
};

export const convertLangChainMessageToVercelMessage = (message: BaseMessage) => {
  if (message.getType() === "human") {
    return { content: message.content, role: "user" };
  } else if (message.getType() === "ai") {
    return {
      content: message.content,
      role: "assistant",
      tool_calls: (message as AIMessage).tool_calls,
    };
  } else {
    return { content: message.content, role: message.getType() };
  }
};

export const formatChatHistory = ({
  chatHistory,
  removeLastMessage,
}: {
  chatHistory: BaseMessage[];
  removeLastMessage?: boolean;
}) => {
  if (removeLastMessage) {
    chatHistory = chatHistory.slice(0, -1);
  }
  const formattedDialogueTurns = chatHistory.map((message) => {
    return `${message.getType()}: ${message.content}`;
  });
  return formattedDialogueTurns.join("\n");
};

export const replaceLastMessage = ({
  chatHistory,
  newMessage,
}: {
  chatHistory: BaseMessage[];
  newMessage: BaseMessage;
}) => {
  return [...chatHistory.slice(0, -1), newMessage];
};

export const removeLastMessage = (chatHistory: BaseMessage[]) => {
  return chatHistory.slice(0, -1);
};

export const combineDocumentsFn = (docs: Document[]) => {
  const serializedDocs = docs.map((doc) => doc.pageContent);
  return serializedDocs.join("\n\n");
};
