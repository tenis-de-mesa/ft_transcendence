import { useContext } from "react";
import { ChatContext } from "../contexts";

export const Overlay = () => {
  const { closeCard } = useContext(ChatContext);

  return (
    <div
      className="fixed inset-0 z-[1000] backdrop-blur-sm bg-gray-900/50"
      onClick={closeCard}
    />
  );
};
