import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { NextRequest, NextResponse } from "next/server";

import { SupabaseVectorStore } from "@langchain/community/vectorstores/supabase";
import { OpenAIEmbeddings } from "@langchain/openai";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const text = body.text;

  try {
    const client = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_PRIVATE_KEY!);

    //Hint: Prøv å markere linjene nedenfor og trykk -> cmd + shift + i for å legge til i chatten i Ask modus. Spørr f.eks "what does the "markdown" in the snippet do?" Sammen med spørsmålet prøv å @ docsene til langchain for å hente relevante svar fra dokumentasjonen.
    const splitter = RecursiveCharacterTextSplitter.fromLanguage("markdown", {
      chunkSize: 256,
      chunkOverlap: 20,
    });

    const splitDocuments = await splitter.createDocuments([text]);

    const vectorstore = await SupabaseVectorStore.fromDocuments(
      splitDocuments,
      new OpenAIEmbeddings(),
      {
        client,
        tableName: "documents",
        queryName: "match_documents",
      },
    );

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
