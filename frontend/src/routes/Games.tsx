import { useContext, useEffect, useState } from "react";
import { Button, Card } from "../components";
import { Typography } from "../components/Typography";
import { AuthContext } from "../contexts";
import { useWebSocket } from "../hooks";

import { ColumnDef, createColumnHelper } from "@tanstack/react-table";
import { useLoaderData } from "react-router-dom";

// const columnHelper = createColumnHelper<User>();


const Games = () => {
  const { currentUser } = useContext(AuthContext);
  const [invites, setInvites] = useState([]);
  const [gameHistory, setGameHistory] = useState([])
  const socket = useWebSocket();

  useEffect(() => {
    const getInvites = () => {
      socket.emit("findMyInvites", currentUser.id, (invitesList) => {
        setInvites(invitesList);
      });
    };

    socket.on("newGameInvite", getInvites);
    getInvites();
  }, [socket, currentUser.id]);

  const acceptGameInvite = function (invite) {
    socket.emit("acceptInvitePlayerToGame", invite.id);
  };

  // const columns = useMemo<ColumnDef<User>[]>(
  //   () => [
  //     columnHelper.accessor("id", {
  //       header: "Name",
  //       cell: (info) => (
  //         <Link to={`/profile/${info.row.original.id}`}>
  //           <UserWithStatus user={info.row.original} />
  //         </Link>
  //       ),
  //     }),
  //     columnHelper.accessor("id", {
  //       header: "Actions",
  //       cell: (info) => {
  //         return (
  //           <div className="flex space-x-1">
  //             <ChatButton user={info.row.original} />
  //           </div>
  //         );
  //       },
  //     }),
  //   ],
  //   [],
  // );

  useEffect(() => {
    socket.emit('myGameHistory', null, (response) => {
      setGameHistory(response)
    })
  }, [socket, gameHistory])

  return (
    <div>
      <Typography variant="h4" className="mb-10">
        Games
      </Typography>

      <Card className="max-w-xl">
        <Card.Title position="center">
          <Typography variant="h6">Game Invites</Typography>
        </Card.Title>
        <Card.Body className="!px-10" position="left">
          <ul>
            {invites.map((invite) => {
              return (
                <li key={invite.id} className="text-white mb-2">
                  <div className="flex items-center gap-2">
                    {invite.nickname}
                    <Button
                      variant="info"
                      onClick={() => acceptGameInvite(invite)}
                    >
                      Aceitar
                    </Button>
                  </div>
                </li>
              );
            })}
          </ul>
        </Card.Body>
      </Card>
    </div>
  );
};

export default Games;
