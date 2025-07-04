export interface User {
  _id: string;
  name: string;
  email: string;
  token: string;
  avatarUrl?: string;
  online?: boolean;
}

export interface AuthPayload {
  name?: string;
  email: string;
  password: string;
}

export interface Reaction {
  _id: string;
  message: string;
  user: User;
  emoji: string;
  createdAt: string;
  updatedAt: string;
}

export interface Message {
  _id: string;
  content: string;
  sender: User;
  chat: string;
  type: string;
  createdAt: string;
  updatedAt: string;
  reactions?: Reaction[];
  readBy?: string[]; // Array of user IDs who have read the message
  isRead?: boolean; // For frontend convenience
}
