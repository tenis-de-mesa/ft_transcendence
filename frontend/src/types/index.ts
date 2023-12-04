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
  winCount: number;
  loseCount: number;
  totalMatchPoints: number;
};

export type Message = {
  id: number;
  content: string;
  chat?: Chat;
  sender?: User;
};

export type ChatMemberRole = "owner" | "admin" | "member";

export type ChatMemberStatus = "active" | "muted" | "banned";

export type ChatMember = {
  user: User;
  userId: number;
  chat: Chat;
  chatId: number;
  role: ChatMemberRole;
  status: ChatMemberStatus;
};

export type ChatAccess = "public" | "protected" | "private";

export type ChatType = "direct" | "channel";

export type Chat = {
  id: number;
  name: string;
  users: ChatMember[];
  messages: Message[];
  newMessage: string;
  access: ChatAccess;
  type: ChatType;
  owner: User;
};

export type NewChatMessage = {
  chatId: number;
  message: string;
};

export type Game = {
  id: number;
  status: "start" | "finish";
  playerOne: User;
  playerTwo: User;
  playerOneScore: number;
  playerTwoScore: number;
  playerOneMatchPoints: number;
  playerTwoMatchPoints: number;
  winner: User;
  loser: User;
  createdAt: Date;
};
