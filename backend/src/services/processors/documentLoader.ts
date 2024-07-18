import { PDFLoader } from 'langchain/document_loaders/fs/pdf';
import { DirectoryLoader } from 'langchain/document_loaders/fs/directory';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import { TextLoader } from 'langchain/document_loaders/fs/text';
import * as dotenv from 'dotenv';
import { client, embeddings} from '../processors/vectorStore.js';
import { OpenAIEmbeddings } from '@langchain/openai';

dotenv.config();

interface IDocument {
  pageContent: string | string[];
}

export const loadAndNormalizeDocuments = async (): Promise<string[]> => {
  const loader = new DirectoryLoader('./documents', {
    '.pdf': (path: string) => new PDFLoader(path),
    '.txt': (path: string) => new TextLoader(path),
  });

  console.log('Loading docs...');
  const docs: IDocument[] = await loader.load();
  console.log('Docs loaded:', JSON.stringify(docs, null, 2));

  const normalizedDocs = docs
    .map((doc: IDocument) => {
      if (typeof doc.pageContent === 'string') {
        return doc.pageContent;
      } else if (Array.isArray(doc.pageContent)) {
        return doc.pageContent.join('\n');
      }
      return '';
    })
    .filter((doc) => doc !== '');

  console.log('Normalized docs:', JSON.stringify(normalizedDocs, null, 2));

  const textSplitter = new RecursiveCharacterTextSplitter({
    separators: ['\n', '.', '!', '?', ';', ' ', ''],
    chunkSize: 500,
    chunkOverlap: 70,
    lengthFunction: (str: string) => str.length,
  });

  const combinedText = normalizedDocs.join('\n');
  const documents = await textSplitter.splitText(combinedText);
  console.log('Text chunks:', JSON.stringify(documents, null, 2));


  const indexDocuments = async (documents: string[]) => {
    for (const doc of documents) {
      const embeddingObject = await embeddings.embedDocuments([doc]);
      // convertendo o objeto de embedding para um array
      const embeddingArray = Object.values(embeddingObject);
  
      // convertendo o array para uma string no formato correto para PostgreSQL
      const embeddingArrayString = `[${embeddingArray.join(',')}]`;
      await client.query('INSERT INTO documents (content, embedding) VALUES ($1, $2)', [doc, embeddingArrayString]);
    }
  };
  console.log('Documents indexed.');
  return documents;
};
