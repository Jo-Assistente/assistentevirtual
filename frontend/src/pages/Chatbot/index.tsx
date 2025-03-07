import { useEffect, useRef, useState } from "react";
import React from "react";
import { Link } from "react-router-dom";
import Swal from "sweetalert2";

import { sendMessage } from "../../components/App/apiFunctions.ts";
import ChatForm from "../../components/Form/index.tsx";

import "./chatbot.css";

const logoChat = require("../../public/logo-chat.svg").default;
const logoFjs = require("../../public/logo.svg").default;
const bannerFjs = require("../../public/banner-fjs.svg").default;
const iconUser = require("../../public/generic-user.svg").default;
import { ArrowLeft, DotsThreeVertical, GearFine } from "@phosphor-icons/react";
import { ChatEntry } from "../../types/types.ts";

export function Chatbot() {
  const [chatLog, setChatLog] = useState<ChatEntry[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const chatLogRef = useRef<HTMLDivElement>(null);

  // Função para formatar a resposta do bot com quebras de linha, negrito e tópicos
  const formatBotResponse = (text: string) => {
    // Adiciona quebras de linha
    text = text.replace(/\n/g, "<br>");

    // Marca texto entre ** para negrito
    text = text.replace(/\*\*(.*?)\*\*/g, "<b>$1</b>");

    // Formata tópicos numerados
    text = text.replace(/(\d+\.)\s+/g, "<br><b>$1</b> "); // Ex: 1. -> <b>1.</b>

    // Adiciona espaçamento entre cada item de lista (caso necessário)
    text = text.replace(/- /g, "<br><b>-</b> ");

    return text;
  };

  const handleSubmit = async (userMessage: string) => {
    setChatLog((prevChatLog: ChatEntry[]) => [
      ...prevChatLog,
      { type: "user", message: userMessage },
      { type: "bot", message: "..." },
    ]);

    setIsProcessing(true);
    const botResponse = await sendMessage(userMessage);
    setIsProcessing(false);

    const formattedResponse = formatBotResponse(botResponse);

    setChatLog((prevChatLog: ChatEntry[]) => [
      ...prevChatLog.slice(0, -1),
      { type: "bot", message: formattedResponse },
    ]);
  };

  useEffect(() => {
    if (chatLogRef.current) {
      chatLogRef.current.scrollTop = chatLogRef.current.scrollHeight;
    }
  }, [chatLog]);

  return (
    <div className="main-chat">
      <aside className="aside-header">
        <img src={logoFjs} alt="Logo" className="img-logo" />
        <button>
          <a href="/">Limpar Chat </a>
        </button>
        <section className="banner-aside">
          <img src={bannerFjs} alt="Banner-Fjs" />
        </section>

        <div className="footer-aside">
          <aside>
            <img className="w-[50px]" src={iconUser} alt="user" />
            <section>
              <p>Usuário</p>
              <p>FJS</p>
            </section>
            <div className="icon-engine">
              <GearFine size={40} color="white" />
            </div>
          </aside>
        </div>
      </aside>

      <section className="chat-box">
        <div className="chat-log" ref={chatLogRef}>
          <div className="flex justify-between items-center max-w-full p-4 pt-10 px-12">
            <a href="/">
              <ArrowLeft size={50} />
            </a>
            <button>
              <DotsThreeVertical size={50} color="black" />
            </button>
          </div>

          {chatLog.map((entry, index) => (
            <div
              key={index}
              className={`flex pl-6 items-start ${
                entry.type === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <img
                className="w-[110px] h-auto"
                src={entry.type === "user" ? iconUser : logoChat}
                alt={entry.type === "user" ? "Foto do Usuário" : "Foto do Bot"}
              />
              <div
                className={`flex w-[60%] max-w-[75%] mx-16 my-10 p-3 rounded-lg shadow-lg ${
                  entry.type === "user"
                    ? "bg-main-white text-black"
                    : "bg-color-fjs text-main-white ml-[0rem] mt-[4rem]"
                }`}
              >
                <div className="p-5 font-inter text-justify">
                  <p
                    className="text-[1.2rem] leading-[2.5rem]"
                    dangerouslySetInnerHTML={{
                      __html: entry.message,
                    }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        <ChatForm onSubmit={handleSubmit} />
      </section>
    </div>
  );
}

export default Chatbot;
