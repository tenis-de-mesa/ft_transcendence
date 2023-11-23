export type UserStatus = {
  id: number;
  status: "online" | "offline" | "in_game";
};

export type User = {
  userId: number;
  id: number;
  tfaEnabled: boolean;
  login?: string;
  email?: string;
  status: string;
  nickname?: string;
  avatarUrl: string;
  blockedBy: number[];
  blockedUsers: number[];
  friends: User[];
  deletedAt?: Date;
};

export type Message = {
  id: number;
  content: string;
  chat?: Chat;
  sender?: User;
};

export type ChatMember = {
  user: User;
  userId: number;
  chat: Chat;
  chatId: number;
  role: "owner" | "admin" | "member";
  status: "active" | "banned" | "muted";
};

export type Chat = {
  id: number;
  name: string;
  users: ChatMember[];
  messages: Message[];
  newMessage: string;
  access: "public" | "protected" | "private";
  type: "direct" | "channel";
  createdBy: User;
};

export type NewChatMessage = {
  chatId: number;
  message: string;
};
