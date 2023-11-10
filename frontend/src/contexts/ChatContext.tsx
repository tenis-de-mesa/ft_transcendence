import { createContext, useState } from "react";
import { Chat } from "../types";

type ChatContextType = {
  currentChat: Chat;
  setCurrentChat: React.Dispatch<React.SetStateAction<Chat>>;
};

export const ChatContext = createContext({} as ChatContextType);

export const ChatContextProvider = ({ children }) => {
  const [currentChat, setCurrentChat] = useState(null);

  return (
    <ChatContext.Provider
      value={{
        currentChat,
        setCurrentChat,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export default ChatContext;
