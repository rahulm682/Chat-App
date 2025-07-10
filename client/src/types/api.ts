
export interface IBaseUser {
    _id: string;
    name: string;
    email: string;
    token?: string;
    avatarUrl?: string;
    online?: boolean;
    createdAt?: string;
    updatedAt?: string;
}

export interface IMessage {
    _id: string;
    content: string;
    sender: IBaseUser;
    chat: IChat;
    type: string;
    createdAt: string;
    updatedAt: string;
    reactions?: IReaction[];
    readBy?: string[]; // Array of user IDs who have read the message
  }

export interface IChat {
    _id: string;
    isGroup: boolean;
    participants: IBaseUser[];
    groupAdmin?: IBaseUser;
    chatName?: string;
    latestMessage?: IMessage;
    createdAt?: string;
    updatedAt?: string;
}

export interface IReaction {
    _id: string;
    message: string;
    user: IBaseUser;
    emoji: string;
    createdAt?: string;
    updatedAt?: string;
}

// export interface Message {
//     _id: string;
//     content: string;
//     sender: Pick<BaseUser, "_id" | "name">;
//     chat: string;
//     type: string;
//     createdAt?: string;
//     updatedAt?: string;
// }
