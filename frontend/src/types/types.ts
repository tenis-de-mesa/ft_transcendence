export type UserStatus = {
  id: number;
  status: string;
};

export type User = {
  userId: number;
  id: number;
  tfaEnabled: boolean;
  login?: string;
  status: string;
  nickname?: string;
  avatarUrl: string;
  blockedBy: number[];
  blockedUsers: number[];
  friends: User[];
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
  access: "public" | "protected" | "private";
  type: "direct" | "channel";
  createdByUser: number;
};

export type NewChatMessage = {
  chatId: number;
  message: string;
};
