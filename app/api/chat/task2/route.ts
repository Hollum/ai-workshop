import { graph2 } from "@/oppgaver/task2_format/graph2";
import { graph3 } from "@/oppgaver/task3_rag/graph3";
import { graph4 } from "@/oppgaver/task4_agent/ro_ned/faen_så_fast/graph4";
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

    const graph = await graph2();

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
