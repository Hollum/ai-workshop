import { graph1 } from "@/oppgaver/task1_chat/graph1";
import {
  convertLangChainMessageToVercelMessage,
  convertVercelMessageToLangChainMessage,
} from "@/utils/mappers";
import { Message as VercelChatMessage } from "ai";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    /**
     * We represent intermediate steps as system messages for display purposes,
     * but don't want them in the chat history.
     */
    const messages = (body.messages ?? [])
      .filter(
        (message: VercelChatMessage) => message.role === "user" || message.role === "assistant",
      )
      .map(convertVercelMessageToLangChainMessage);

    const graph = await graph1();

    const result = await graph.invoke({
      messages,
    });

    return NextResponse.json(
      {
        messages: result.messages.map(convertLangChainMessageToVercelMessage),
      },
      { status: 200 },
    );
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: e.status ?? 500 });
  }
}
