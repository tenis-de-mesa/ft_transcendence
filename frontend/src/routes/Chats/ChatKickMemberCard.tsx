import { useContext, useEffect } from "react";
import { Button, Card, Overlay, Typography } from "../../components";
import { FiX } from "react-icons/fi";
import { ChatContext } from "../../contexts";

type ChatKickMemberCardProps = {
  nickname?: string;
};

export default function ChatKickMemberCard({
  nickname = "Fizzbuzz",
}: ChatKickMemberCardProps) {
  const { setShowCard } = useContext(ChatContext);

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      const target = e.target as Element;

      if (!target.closest("#kick-member-card")) {
        setShowCard(null);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [setShowCard]);

  return (
    <>
      <Overlay />

      <Card
        id="kick-member-card"
        className="absolute transform -translate-x-1/2 -translate-y-1/2 top-1/3 left-1/2 z-[1001] max-w-[27rem] dark:bg-gray-900"
      >
        <Card.Title
          hr={false}
          className="flex justify-between items-center gap-3"
        >
          <Typography className="text-left" variant="h6" customWeight="bold">
            Kick {nickname} from channel
          </Typography>
          <Button
            variant="info"
            size="sm"
            IconOnly={<FiX />}
            onClick={() => setShowCard(null)}
          ></Button>
        </Card.Title>
        <Card.Body>
          <Typography className="text-left" variant="md">
            Are you sure you want to kick {nickname} from this channel? They can
            join again through the channel list.
          </Typography>
        </Card.Body>
        <Card.Footer className="flex justify-end items-center gap-3">
          <div onClick={() => setShowCard(null)}>
            <Typography
              variant="md"
              className="cursor-pointer select-none hover:decoration-solid hover:underline"
            >
              Cancel
            </Typography>
          </div>
          <Button
            variant="error"
            // TODO: Kick user action
            onClick={() => {}}
          >
            <Typography variant="md" customWeight="bold">
              Kick {nickname}
            </Typography>
          </Button>
        </Card.Footer>
      </Card>
    </>
  );
}
