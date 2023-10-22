export type UserStatus = {
  id: number;
  status: string;
};

export type BlockList = {
  userId: number;
  userBlockedId: number;
  createdAt: Date;
};

export type User = {
  id: number;
  login: string;
  status: string;
  nickname: string;
  avatarUrl: string;
  userBlocker: BlockList[];
  userBlocked: BlockList[];
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
