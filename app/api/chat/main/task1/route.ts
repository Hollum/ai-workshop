import { Message } from "ai";
import { NextRequest, NextResponse } from "next/server";

import { mainGraph } from "@/oppgaver/graph";
import { convertLangChainMessageToVercelMessage } from "../../agents/route";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const messages = body.messages ?? ([] as Message[]);

    const graph = await mainGraph();

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
