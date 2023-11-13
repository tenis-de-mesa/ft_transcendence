import React, { createContext, useEffect, useState } from "react";
import { Chat } from "../types";
import { makeRequest } from "../api";

type ChatContextType = {
  currentChat: Chat;
  setCurrentChat: React.Dispatch<React.SetStateAction<Chat>>;
  userRole: "owner" | "admin" | "member";
  showCard: JSX.Element;
  setShowCard: React.Dispatch<React.SetStateAction<JSX.Element>>;
};

export const ChatContext = createContext({} as ChatContextType);

export const ChatContextProvider = ({ children }) => {
  const [currentChat, setCurrentChat] = useState<Chat>(null);
  const [userRole, setUserRole] = useState<"owner" | "admin" | "member">(null);
  const [showCard, setShowCard] = useState<JSX.Element>(null);

  useEffect(() => {
    const fetchUserRole = async (chatId: number) => {
      const { data, error } = await makeRequest<{
        role: "owner" | "admin" | "member";
      }>(`/chats/${chatId}/role`, {
        method: "GET",
      });

      if (error) {
        return console.error("Error fetching channel role: ", error);
      }

      setUserRole(data.role);
    };

    if (currentChat) {
      fetchUserRole(currentChat.id);
    }
  }, [currentChat]);

  return (
    <ChatContext.Provider
      value={{
        currentChat,
        setCurrentChat,
        userRole,
        showCard,
        setShowCard,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export default ChatContext;
