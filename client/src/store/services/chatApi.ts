import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { RootState } from '../index';

// Types for API responses
export interface ApiUser {
  _id: string;
  name: string;
  email: string;
  avatarUrl?: string;
}

export interface ApiReaction {
  _id: string;
  message: string;
  user: ApiUser;
  emoji: string;
  createdAt: string;
  updatedAt: string;
}

export interface ApiMessage {
  _id: string;
  sender: ApiUser;
  content: string;
  chat: string;
  type: string;
  createdAt: string;
  updatedAt: string;
  reactions: ApiReaction[];
  readBy: string[];
}

export interface GetMessagesResponse {
  messages: ApiMessage[];
  hasMore: boolean;
  page: number;
  total: number;
}

export const chatApi = createApi({
  reducerPath: 'chatApi',
  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
    prepareHeaders: (headers, { getState }) => {
      const user = (getState() as RootState).user.user;
      const token = user?.token;
      if (token) headers.set('authorization', `Bearer ${token}`);
      return headers;
    },
  }),
  tagTypes: ['Chats', 'Messages'] as const,
  endpoints: (builder) => ({
    getChats: builder.query<any[], void>({
      query: () => '/chats',
      providesTags: [{ type: 'Chats', id: 'LIST' }],
    }),
    getMessages: builder.query<GetMessagesResponse, { chatId: string; page?: number; limit?: number }>({
      query: ({ chatId, page = 1, limit = 15 }) => `/messages/${chatId}?page=${page}&limit=${limit}`,
      providesTags: (result, error, { chatId }) => 
        result 
          ? [
              ...result.messages.map(({ _id }) => ({ type: 'Messages' as const, id: _id })),
              { type: 'Messages' as const, id: `Chat-${chatId}` }
            ]
          : [{ type: 'Messages' as const, id: `Chat-${chatId}` }],
    }),
    markMessagesAsRead: builder.mutation<any, { chatId: string }>({
      query: ({ chatId }) => ({
        url: '/messages/mark-read',
        method: 'POST',
        body: { chatId },
      }),
      invalidatesTags: (result, error, { chatId }) => [
        { type: 'Chats' as const, id: 'LIST' },
        { type: 'Messages' as const, id: `Chat-${chatId}` }
      ],
    }),
    sendMessage: builder.mutation<any, { chatId: string, content: string }>({
      query: ({ chatId, content }) => ({
        url: '/messages',
        method: 'POST',
        body: { chatId, content },
      }),
      invalidatesTags: (result, error, { chatId }) => [
        { type: 'Chats' as const, id: 'LIST' },
        { type: 'Messages' as const, id: `Chat-${chatId}` }
      ],
    }),
    invalidateChatList: builder.mutation<void, void>({
      queryFn: () => ({ data: undefined }),
      invalidatesTags: [{ type: 'Chats' as const, id: 'LIST' }],
    }),
    addReaction: builder.mutation<any, { messageId: string, emoji: string, chatId: string }>({
      query: ({ messageId, emoji }) => ({
        url: '/reactions',
        method: 'POST',
        body: { messageId, emoji },
      }),
      invalidatesTags: (result, error, { chatId }) => [
        { type: 'Messages', id: `Chat-${chatId}` }
      ],
    }),
    removeReaction: builder.mutation<any, { messageId: string, chatId: string }>({
      query: ({ messageId }) => ({
        url: `/reactions/${messageId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, { chatId }) => [
        { type: 'Messages', id: `Chat-${chatId}` }
      ],
    }),
    login: builder.mutation<any, { email: string, password: string }>({
      query: (body) => ({
        url: '/users/login',
        method: 'POST',
        body,
      }),
    }),
    register: builder.mutation<any, { name: string, email: string, password: string }>({
      query: (body) => ({
        url: '/users/register',
        method: 'POST',
        body,
      }),
    }),
    searchUsers: builder.query<any[], string>({
      query: (search) => `/users?search=${encodeURIComponent(search)}`,
    }),
    createChat: builder.mutation<any, { userId: string }>({
      query: ({ userId }) => ({
        url: '/chats',
        method: 'POST',
        body: { userId },
      }),
    }),
  }),
});

export const {
  useGetChatsQuery,
  useGetMessagesQuery,
  useMarkMessagesAsReadMutation,
  useSendMessageMutation,
  useInvalidateChatListMutation,
  useAddReactionMutation,
  useRemoveReactionMutation,
  useLoginMutation,
  useRegisterMutation,
  useSearchUsersQuery,
  useCreateChatMutation,
} = chatApi; 