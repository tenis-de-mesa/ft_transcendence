import { useLoaderData } from "react-router-dom";
import { User } from "../types/types";
import { Avatar } from "../components/Avatar";

export default function Friends() {
  const friends = useLoaderData() as User[];

  return (
    // Map friends and show each user in a card
    <section>
      {friends.map((friend) => (
        <div key={friend.id}>
          <div className="flex items-center">
            <Avatar
              seed={friend.login}
              src={friend.avatarUrl}
              className="inline mr-2"
              size="sm"
            />
            <div>
              <h4 className="text-lg font-bold">{friend.nickname}</h4>
              <p className="text-gray-600">{friend.login}</p>
            </div>
          </div>
        </div>
      ))}
    </section>
  );
}
