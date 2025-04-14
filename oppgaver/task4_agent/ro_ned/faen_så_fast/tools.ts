import { prisma } from "@/lib/prisma";
import { PrismaVectorStore } from "@langchain/community/vectorstores/prisma";
import { DynamicStructuredTool, tool } from "@langchain/core/tools";
import { OpenAIEmbeddings } from "@langchain/openai";
import { Document as DocumentDb, Prisma } from "@prisma/client";
import { z } from "zod";

export const FETCH_RELEVANT_DOCUMENTS_TOOL = "fetch_relevant_documents";
export const schemaFetchRelevantDocumentsTool = z.object({
  documents: z.array(z.string()).describe("The documents to fetch relevant documents for."),
});

export type FetchRelevantDocumentsToolInput = z.infer<typeof schemaFetchRelevantDocumentsTool>;

export const schemaRetrieveFileTool = z.object({
  query: z.string().describe("A single sentence that clearly encapsulates the user's intent"),
});

export type RetrieveFileToolInput = z.infer<typeof schemaRetrieveFileTool>;

export const searchTool = (): DynamicStructuredTool<typeof schemaRetrieveFileTool> => {
  const description = ` 
    Searches and returns information about Junior Consulting (JrC). 
 
    Junior Consulting (JrC) is Norway’s largest student consulting firm, composed of ambitious and academically accomplished NTNU students working part-time to deliver professional solutions. The company offers a wide range of services—from strategic analysis and business development to design, user experience, and technology—combining interdisciplinary expertise with flexibility and a robust alumni network.
  `;

  return tool(
    async ({ query }: RetrieveFileToolInput) => {
      const vectorStore = PrismaVectorStore.withModel<DocumentDb>(prisma).create(
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

      const result = await vectorStore.similaritySearch(query, 5);

      return result;
    },
    {
      name: "fetch_relevant_documents",
      description: description,
      schema: schemaRetrieveFileTool,
    },
  );
};
