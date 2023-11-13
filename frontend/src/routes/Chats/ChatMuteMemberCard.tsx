import { useContext, useEffect, useState } from "react";
import { Button, Card, Overlay, Typography } from "../../components";
import { FiX } from "react-icons/fi";
import { ChatContext } from "../../contexts";

type ChatMuteMemberCardProps = {
  nickname?: string;
};

export default function ChatMuteMemberCard({
  nickname = "Fizzbuzz",
}: ChatMuteMemberCardProps) {
  const { setShowCard } = useContext(ChatContext);
  const [selectedTime, setSelectedTime] = useState(60000);

  const getTimeBoxStyle = (time: number) => {
    return `bg-gray-700 px-2 py-1 rounded select-none
    ${selectedTime === time ? "bg-info-700" : "bg-gray-700"}`;
  };

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      const target = e.target as Element;

      if (!target.closest("#mute-member-card")) {
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
        id="mute-member-card"
        className="absolute transform -translate-x-1/2 -translate-y-1/2 top-1/3 left-1/2 z-[1001] max-w-[27rem] dark:bg-gray-900"
      >
        <Card.Title
          hr={false}
          className="flex justify-between items-center gap-3"
        >
          <Typography className="text-left" variant="h6" customWeight="bold">
            Mute {nickname}
          </Typography>
          <Button
            variant="info"
            size="sm"
            IconOnly={<FiX />}
            onClick={() => setShowCard(null)}
          ></Button>
        </Card.Title>
        <Card.Body className="space-y-4">
          <Typography className="text-left" variant="md">
            Muted members are not able to send messages in the channel for a
            certain period of time. However, they can still read messages.
          </Typography>
          <div className="text-white space-y-1">
            <Typography
              variant="xs"
              customColor="text-gray-400"
              className="text-left select-none"
            >
              MUTE DURATION
            </Typography>
            <ul className="flex justify-between">
              <li
                className={getTimeBoxStyle(60000)}
                onClick={() => setSelectedTime(60000)}
              >
                <Typography variant="xs">60 SECONDS</Typography>
              </li>
              <li
                className={getTimeBoxStyle(300000)}
                onClick={() => setSelectedTime(300000)}
              >
                <Typography variant="xs">5 MINS</Typography>
              </li>
              <li
                className={getTimeBoxStyle(600000)}
                onClick={() => setSelectedTime(600000)}
              >
                <Typography variant="xs">10 MINS</Typography>
              </li>
              <li
                className={getTimeBoxStyle(3600000)}
                onClick={() => setSelectedTime(3600000)}
              >
                <Typography variant="xs">1 HOUR</Typography>
              </li>
              <li
                className={getTimeBoxStyle(86400000)}
                onClick={() => setSelectedTime(86400000)}
              >
                <Typography variant="xs">1 DAY</Typography>
              </li>
              <li
                className={getTimeBoxStyle(604800000)}
                onClick={() => setSelectedTime(604800000)}
              >
                <Typography variant="xs">1 WEEK</Typography>
              </li>
            </ul>
          </div>
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
            // TODO: Mute user action
            onClick={() => {}}
          >
            <Typography variant="md" customWeight="bold">
              Mute {nickname}
            </Typography>
          </Button>
        </Card.Footer>
      </Card>
    </>
  );
}
