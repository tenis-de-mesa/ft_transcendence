import { useContext, useEffect } from "react";
import { useFetcher } from "react-router-dom";
import { FiX } from "react-icons/fi";
import { ChatContext } from "../../contexts";
import { User } from "../../types";
import { Button, Card, Overlay, Typography } from "../../components";

type ChatKickMemberCardProps = {
  user: User;
};

export default function ChatKickMemberCard({ user }: ChatKickMemberCardProps) {
  const { setShowCard } = useContext(ChatContext);
  const { Form } = useFetcher();

  const handleClose = () => setShowCard(null);

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
            Kick {user?.nickname} from channel
          </Typography>
          <Button
            variant="info"
            size="sm"
            IconOnly={<FiX />}
            onClick={handleClose}
          ></Button>
        </Card.Title>
        <Card.Body>
          <Typography className="text-left" variant="md">
            Are you sure you want to kick {user?.nickname} from this channel?
            They can join again through the channel list.
          </Typography>
        </Card.Body>
        <Card.Footer className="flex justify-end items-center gap-3">
          <div onClick={handleClose}>
            <Typography
              variant="md"
              className="cursor-pointer select-none hover:decoration-solid hover:underline"
            >
              Cancel
            </Typography>
          </div>
          <Form action="kick" method="POST" onSubmit={handleClose}>
            <input type="hidden" name="userId" value={user?.id} />
            <Button variant="error">
              <Typography variant="md" customWeight="bold">
                Kick {user?.nickname}
              </Typography>
            </Button>
          </Form>
        </Card.Footer>
      </Card>
    </>
  );
}
