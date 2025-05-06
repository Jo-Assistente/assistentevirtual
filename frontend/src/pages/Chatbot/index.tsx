import { useState, useEffect, useRef } from "react";
import ChatForm from "../../components/Form/index.tsx";
import { sendMessage } from "../../components/App/apiFunctions.ts";

import Swal from "sweetalert2";

import "./chatbot.css";
import React from "react";
import { Link } from "react-router-dom";

const logoChat = require("../../public/logo-chat.svg").default;

const logoFjs = require("../../public/logo.svg").default;
const bannerFjs = require("../../public/banner-fjs.svg").default;
const iconUser = require("../../public/generic-user.svg").default;
import { ArrowLeft, DotsThreeVertical, GearFine } from "@phosphor-icons/react";
import { ChatEntry } from "../../types/types.ts";

const Chatbot = () => {
  const [chatLog, setChatLog] = useState<ChatEntry[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const chatLogRef = useRef<HTMLDivElement>(null);

  const handleSubmit = async (userMessage: string) => {
    setChatLog((prevChatLog: ChatEntry[]) => [
      ...prevChatLog,
      {
        type: "user",
        message: userMessage,
      },
      {
        type: "bot",
        message: "...",
      },
    ]);

    setIsProcessing(true);
    const botResponse = await sendMessage(userMessage);
    setIsProcessing(false);

    const words = botResponse.split(" ");

    for (let i = 0; i < words.length; i++) {
      setTimeout(() => {
        setChatLog((prevChatLog: ChatEntry[]) => [
          ...prevChatLog.slice(0, -1),
          {
            type: "bot",
            message: words.slice(0, i + 1).join(" "),
          },
        ]);
      }, (i + 1) * 150);
    }
  };

  /*   const handleAlert = () => {
    Swal.fire({
      title: "Olá, obrigada por testar!",
      text: "Esta é uma versão de demonstração da Jô. Em breve teremos mais funcionalidades.",
      icon: "info",
      showCancelButton: false,
      showDenyButton:true,
      confirmButtonColor: "#6A1B44",
      confirmButtonText: "Voltar ao chat",
      denyButtonColor: "gray",
      denyButtonText: "Sugestões? Fale conosco!",
    }).then((result) => {
      if (result.isDenied) {
        window.open(process.env.REACT_APP_FORMS, '_blank');
      } 
    })
  } */

  /* const warningAlert = () => {
    Swal.fire({
      icon: "error",
      title: "Oops...",
      text: "A Jô está em manutenção. Para mais informações, entre em contato com o time de suporte.",
      footer:
        '<a href="https://zimbra.fjs.org.br/" target="_blank" style="color: #1a0dab; text-decoration: underline;">Enviar e-mail para setor de inovação</a>',
      allowOutsideClick: false,
      allowEscapeKey: false,
      showConfirmButton: false,
    });
  }; */

  useEffect(() => {
    /*warningAlert(); */
  }, []);

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
                  <p className="text-[1.2rem] leading-[2.5rem]">
                    {entry.message}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <ChatForm onSubmit={handleSubmit} />
      </section>
    </div>
  );
};

export default Chatbot;
