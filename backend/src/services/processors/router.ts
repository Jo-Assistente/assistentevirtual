import fs from "fs";
import { Request, Response, Router } from "express";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { ChatOpenAI } from "@langchain/openai";
import * as dotenv from "dotenv";
import { similarChunks } from "./vectorStore.js";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

let totalInteractions = 0;
let resolvedInteractions = 0;
let totalTimeSpent = 0;

export const router = Router();

// Resolve the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

router.post("/", async (request: Request, response: Response) => {
  const { chats } = request.body;

  if (!chats) {
    return response.status(400).send("O parâmetro 'chats' é necessário.");
  }

  const startTime = performance.now();

  const promptLLM = async (
    userQuery: string,
    chunks: string
  ): Promise<string> => {
    const model = new ChatOpenAI({
      openAIApiKey: process.env.OPENAI_API_KEY as string,
      modelName: "gpt-4o-2024-05-13",
    });

    const promptTemplate = ChatPromptTemplate.fromTemplate(
      `Você é a Jô, a assistente virtual da Fundação José Silveira (FJS), responsável por fornecer informações de forma clara e bem estruturada.
    
    📌 **Regras para respostas:**  
    - Utilize **tópicos numerados com emojis** (1️⃣, 2️⃣, 3️⃣...) para organização.  
    - **Cada tópico deve estar em uma nova linha**, garantindo espaçamento adequado.  
    - **Evite o uso de asteriscos (*)**. Apenas utilize **negrito** quando necessário.  
    - **Não compacte informações em um único bloco**, sempre **separando os itens com uma linha em branco**.  
    - **Não ultrapasse 200 palavras**.  
    - **Não inicie as respostas com "Assistente" ou "Jô".**  
    
    ---
    
    ❓ **Pergunta do Usuário:**  
    {query}
    
    🔹 **Base de conhecimento disponível:** {chunks} {history}`
    );
    
    

    

    const formattedPrompt = await promptTemplate.format({
      query: userQuery,
      chunks: chunks,
      history: history,
    });

    const result = await model.invoke(formattedPrompt);
    return result.content.toString();
  };

  const history: string[] = [];

  const chatUser = async (userQuery: string): Promise<string> => {
    history.push(userQuery);

    const chunks = await similarChunks(userQuery);
    const response = await promptLLM(userQuery, chunks);

    history.push(response);

    logUserInteraction(userQuery, response);
    console.log(userQuery);

    console.log(response);
    console.log(history);

    return response;
  };

  const logUserInteraction = (userQuery: string, botResponse: string) => {
    const logFilePath = path.join(__dirname, "./logs/consultas.log");
    const logEntry = `${new Date().toISOString()} - Pergunta do Usuário: ${userQuery}\nResposta do Bot: ${botResponse}\n\n`;

    fs.appendFile(logFilePath, logEntry, (err) => {
      if (err) {
        console.error("Erro ao gravar no arquivo de log:", err);
      }
    });
  };

  try {
    const userResponse = await chatUser(chats);

    const endTime = performance.now();
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
