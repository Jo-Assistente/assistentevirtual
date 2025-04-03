import { ChromaClient, OpenAIEmbeddingFunction } from "chromadb";

import * as dotenv from "dotenv";

dotenv.config();

export const similarChunks = async (userQuery: string): Promise<string> => {
  const client = new ChromaClient({
    path: "http://chromadb:8000",
  });
  const collection = await client.getOrCreateCollection({
    name: "jo-call-center-sprint",
    embeddingFunction: new OpenAIEmbeddingFunction({
      openai_api_key: process.env.OPENAI_API_KEY as string,
    }),
  });

  console.log(`Querying for: ${userQuery}`);
  const results = await collection.query({
    queryTexts: [userQuery],
    nResults: 10,
  });

  console.log("Query results:", JSON.stringify(results, null, 2));
  if (results.documents[0].length === 0) {
    return "No relevant documents found.";
  }

  return results.documents[0].join("\n");
  
};
