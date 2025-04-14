import { PrismaVectorStore } from "@langchain/community/vectorstores/prisma";
import { OpenAIEmbeddings } from "@langchain/openai";
import { Document, Prisma, PrismaClient } from "@prisma/client";

export const prisma = new PrismaClient();

export const vectorStore = PrismaVectorStore.withModel<Document>(prisma).create(
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
