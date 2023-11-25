import { FiPlus } from "react-icons/fi";
import { Button } from "../../components";

import NewChannelCard from "./NewChannelCard";
import { useContext } from "react";
import { ChatContext } from "../../contexts";

export default function NewChannelButton() {
  const { setShowCard } = useContext(ChatContext);

  return (
    <>
      <Button
        className="flex items-center justify-center w-full"
        LeadingIcon={<FiPlus />}
        variant="info"
        onClick={() => setShowCard(<NewChannelCard />)}
      >
        New channel
      </Button>
    </>
  );
}
