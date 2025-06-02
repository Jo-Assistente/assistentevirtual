import { PDFLoader } from "langchain/document_loaders/fs/pdf";
import { DirectoryLoader } from "langchain/document_loaders/fs/directory";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
/* import { DirectoryLoader } from "@langchain/community/document_loaders/fs/pdf" */
import { TextLoader } from "langchain/document_loaders/fs/text";
import { OpenAIEmbeddings } from "@langchain/openai";

import * as dotenv from "dotenv";

dotenv.config();

import { Chroma } from "@langchain/community/vectorstores/chroma";

interface IDocument {
  pageContent: string | string[];
}

export const loadAndNormalizeDocuments = async (): Promise<string[]> => {
  const loader = new DirectoryLoader("./documents", {
    ".pdf": (path: string) => new PDFLoader(path),
    ".txt": (path: string) => new TextLoader(path),
  });

  console.log("Loading docs...");
  const docs: IDocument[] = await loader.load();
  console.log("Docs loaded:", JSON.stringify(docs, null, 2));

  const normalizedDocs = docs
    .map((doc: IDocument) => {
      if (typeof doc.pageContent === "string") {
        return doc.pageContent;
      } else if (Array.isArray(doc.pageContent)) {
        return doc.pageContent.join("\n");
      }
      return "";
    })
    .filter((doc) => doc !== "");

  console.log("Normalized docs:", JSON.stringify(normalizedDocs, null, 2));

  const textSplitter = new RecursiveCharacterTextSplitter({
    separators: ["\n", ".", "!", "?", ";", " ", ""],
    chunkSize: 500,
    chunkOverlap: 70,
    lengthFunction: (str: string) => str.length,
  });

  const combinedText = normalizedDocs.join("\n");
  const documents = await textSplitter.splitText(combinedText);
  console.log("Text chunks:", JSON.stringify(documents, null, 2));

  const documentsForChroma = documents.map((doc: string) => ({
    content: doc,
    pageContent: doc,
    metadata: {},
  }));

  console.log(
    "Documents for Chroma:",
    JSON.stringify(documentsForChroma, null, 2)
  );

  const vectorStores = await Chroma.fromDocuments(
    documentsForChroma,
    new OpenAIEmbeddings(),
    {
      collectionName: "jo-2.0-mvp",
      url: "http://chromadb:8000",
    }
  );

  console.log("Vector store creat and documents indexed.");
  return documents;
};
