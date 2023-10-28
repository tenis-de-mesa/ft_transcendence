export type UserStatus = {
  id: number;
  status: string;
};

export type FriendRequest = {
  sender: User;
  receiver: User;
};

export type User = {
  id: number;
  login: string;
  status: string;
  nickname: string;
  avatarUrl: string;
  blockedBy: number[];
  blockedUsers: number[];
  friends: User[];
  chats: Chat[];
  friendRequestsSent: FriendRequest[];
};

export type Message = {
  id: number;
  content: string;
  chat?: Chat;
  sender?: User;
};

export type Chat = {
  id: number;
  name: string;
  users: User[];
  messages: Message[];
  newMessage: string;
  type: string;
};

export type NewChatMessage = {
  chatId: number;
  message: string;
};
