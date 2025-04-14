import { prisma } from "@/lib/prisma";
import { PrismaVectorStore } from "@langchain/community/vectorstores/prisma";
import { OpenAIEmbeddings } from "@langchain/openai";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { Document, Prisma } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const text = body.text;

  try {
    const splitter = RecursiveCharacterTextSplitter.fromLanguage("markdown", {
      chunkSize: 256,
      chunkOverlap: 20,
    });

    const splitDocuments = await splitter.createDocuments([text]);

    const vectorStore = PrismaVectorStore.withModel<Document>(prisma).create(
      new OpenAIEmbeddings(),
      {
        prisma: Prisma,
        tableName: "Document",
        vectorColumnName: "vector",
        columns: {
          id: PrismaVectorStore.IdColumn,
          content: PrismaVectorStore.ContentColumn,
        },
      },
    );

    await vectorStore.addModels(
      await prisma.$transaction(
        splitDocuments.map((content) =>
          prisma.document.create({
            data: { content: content.pageContent, metadata: content.metadata },
          }),
        ),
      ),
    );

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
