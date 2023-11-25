import { useContext } from "react";
import { useFetcher } from "react-router-dom";
import { FiX } from "react-icons/fi";
import { ChatContext } from "../../contexts";
import { Button, Card, Typography } from "../../components";
import { User } from "../../types";

type ChatBanMemberCardProps = {
  user: User;
};

export default function ChatBanMemberCard({ user }: ChatBanMemberCardProps) {
  const { closeCard, currentChat } = useContext(ChatContext);
  // TODO: Retrieve errors
  const { Form } = useFetcher();

  return (
    <>
      <Card
        id="ban-member-card"
        className="absolute transform -translate-x-1/2 -translate-y-1/2 top-1/3 left-1/2 z-[1001] max-w-[27rem] dark:bg-gray-900"
      >
        <Card.Title
          hr={false}
          className="flex justify-between items-center gap-3"
        >
          <Typography className="text-left" variant="h6" customWeight="bold">
            Ban {user?.nickname} from channel
          </Typography>
          <Button
            variant="info"
            size="sm"
            IconOnly={<FiX />}
            onClick={closeCard}
          ></Button>
        </Card.Title>
        <Card.Body className="space-y-4">
          <Typography className="text-left" variant="md">
            Are you sure you want to ban {user?.nickname} from this channel?
            Banned users cannot join the channel again, unless they get
            unbanned.
          </Typography>
        </Card.Body>
        <Card.Footer className="flex justify-end items-center gap-3">
          <div onClick={closeCard}>
            <Typography
              variant="md"
              className="cursor-pointer select-none hover:decoration-solid hover:underline"
            >
              Cancel
            </Typography>
          </div>
          <Form
            action={`${currentChat?.id}/ban`}
            method="POST"
            onSubmit={closeCard}
          >
            <input type="hidden" name="banUserId" value={user?.id} />
            <Button variant="error">
              <Typography variant="md" customWeight="bold">
                Ban {user?.nickname}
              </Typography>
            </Button>
          </Form>
        </Card.Footer>
      </Card>
    </>
  );
}
