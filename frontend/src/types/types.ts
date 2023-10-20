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
};

export type NewChatMessage = {
  chatId: number;
  message: string;
};
