export type UserStatus = {
  id: number;
  status: string;
};

export type User = {
  id: number;
  login: string;
  status: string;
  nickname: string;
  avatarUrl: string;
  blockedBy: number[];
  blockedUsers: number[];
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
};

export type NewChatMessage = {
  chatId: number;
  message: string;
};
