import { useState } from "react";
import { FiPlus } from "react-icons/fi";
import { Button } from "../../components";
import NewChannelCard from "./NewChannelCard";

export default function NewChannelButton() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button
        className="flex items-center justify-center w-full"
        LeadingIcon={<FiPlus />}
        variant="info"
        onClick={() => setIsOpen(!isOpen)}
      >
        New channel
      </Button>

      {isOpen && <NewChannelCard onClose={() => setIsOpen(false)} />}
    </>
  );
}
