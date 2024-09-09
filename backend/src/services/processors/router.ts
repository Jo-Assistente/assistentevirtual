import fs from "fs";
import { Request, Response, Router } from "express";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { ChatOpenAI } from "@langchain/openai";
import * as dotenv from "dotenv";
import { saveEmbeddings, similarChunks } from "./vectorStore.js";

dotenv.config();

export const router = Router();



let contadorDeChamadas = 0;

let totalInteractions = 0;
let resolvedInteractions = 0;
let totalTimeSpent = 0;

router.post("/", async (request: Request, response: Response) => {
  const { chats } = request.body;

  if (!chats) {
    return response.status(400).send("O parâmetro 'chats' é necessário.");
  }

  const startTime = Date.now();

  const promptLLM = async (
    userQuery: string,
    chunks: string
  ): Promise<string> => {
    try {
      const model = new ChatOpenAI({
        openAIApiKey: process.env.OPENAI_API_KEY as string,
        modelName: "gpt-4o-2024-05-13",
      });

      const promptTemplate = ChatPromptTemplate.fromTemplate(
        `Quero que você atue como uma assistente da empresa Fundação José Silveira, ou FJS.
        Você é a Jô, a assistente virtual que veio para facilitar informações para os colaboradores.
        Um exemplo de informação que você pode dar é acerca dos ramais da Fundação, sobre a história ou
        sobre as principais sedes da empresa.

        Pergunta do Usuário: {query}

        As descrições sobre alguns setores da FJS: {chunks}. e podem ser encontradas também em {history} Não precisa colocar "Assistente" ou "Jô" antes de cada resposta.
        Se limite a responder com base nessas informações fornecidas. Não traga outras informações na sua resposta. Se o usuário perguntar coisas que fujam do escopo de contexto, assunto ou informações contidos nos documentos, você diz "Não sou treinada pra responder esse tipo de pergunta. No que mais posso ajudar?"
        Não responda em mais do que 150 palavras.`
      );

      const formattedPrompt = await promptTemplate.format({
        query: userQuery,
        chunks: chunks,
        history: history,
      });

      const result = await model.invoke(formattedPrompt);
      return result.content.toString();
    } catch (error) {
      console.error("Erro no promptLLM:", error.message);
      throw error;
    }
  };

  const history: string[] = [];

  const chatUser = async (userQuery: string): Promise<string> => {
    try {
      history.push(userQuery);

      const chunks = await similarChunks(userQuery);
      console.log("Chunks encontrados:", chunks);

      // Salvar os embeddings no banco de dados
      await saveEmbeddings([chunks]);

      const response = await promptLLM(userQuery, chunks);

      history.push(response);

      logUserInteraction(userQuery, response);
      return response;
    } catch (error) {
      console.error("Erro no chatUser:", error.message);
      throw error;
    }
  };

  const logUserInteraction = (userQuery: string, botResponse: string) => {
    const logFilePath = path.join(__dirname, "./logs/consultas.log");
    const logEntry = `${new Date().toISOString()} - Pergunta do Usuário: ${userQuery}\nResposta do Bot: ${botResponse}\n\n`;

    fs.appendFile(logFilePath, logEntry, (err: any) => {
      if (err) {
        console.error("Erro ao gravar no arquivo de log:", err);
      }
    });
  };

  try {
    const userResponse = await chatUser(chats);

    const endTime = Date.now();
    const elapsedTime = endTime - startTime;

    totalInteractions++;
    totalTimeSpent += elapsedTime;

    if (userResponse) {
      resolvedInteractions++;
    }

    logMetrics();

    response.json({ output: userResponse });
  } catch (error) {
    console.log(history);
    console.error("Erro ao processar a consulta:", error.message);
    response.status(500).send("Erro ao processar a consulta.");
  }

  function logMetrics() {
    console.log(`Total Interactions: ${totalInteractions}`);
    console.log(`Resolved Interactions: ${resolvedInteractions}`);
    console.log(`Total Time Spent: ${totalTimeSpent} ms`);
  }
});
