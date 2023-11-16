import React, { createContext, useContext, useEffect, useState } from "react";
import { Chat } from "../types";
import { AuthContext } from ".";

type ChatMemberRole = "owner" | "admin" | "member";
type ChatMemberStatus = "active" | "muted" | "banned";

type ChatContextType = {
  currentChat: Chat;
  setCurrentChat: React.Dispatch<React.SetStateAction<Chat>>;
  showCard: JSX.Element;
  setShowCard: React.Dispatch<React.SetStateAction<JSX.Element>>;
  userRole: ChatMemberRole;
  userStatus: ChatMemberStatus;
  closeCard: () => void;
};

export const ChatContext = createContext({} as ChatContextType);

export const ChatContextProvider = ({ children }) => {
  const { currentUser } = useContext(AuthContext);
  const [currentChat, setCurrentChat] = useState<Chat>(null);
  const [userRole, setUserRole] = useState<ChatMemberRole>(null);
  const [userStatus, setUserStatus] = useState<ChatMemberStatus>(null);
  const [showCard, setShowCard] = useState<JSX.Element>(null);

  const closeCard = () => setShowCard(null);

  useEffect(() => {
    const currentMember = currentChat?.users.find(
      (user) => user.userId === currentUser.id
    );

    setUserRole(currentMember?.role);
    setUserStatus(currentMember?.status);
  }, [currentChat, currentUser.id]);

  return (
    <ChatContext.Provider
      value={{
        currentChat,
        setCurrentChat,
        showCard,
        setShowCard,
        userRole,
        userStatus,
        closeCard,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export default ChatContext;
