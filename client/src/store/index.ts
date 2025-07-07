import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import { chatApi } from './services/chatApi';
import userReducer from './slices/userSlice';
import chatReducer from './slices/chatSlice';
import messageReducer from './slices/messageSlice';
import onlineUsersReducer from './slices/onlineUsersSlice';

export const store = configureStore({
  reducer: {
    user: userReducer,
    chat: chatReducer,
    message: messageReducer,
    onlineUsers: onlineUsersReducer,
    [chatApi.reducerPath]: chatApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(chatApi.middleware),
});

setupListeners(store.dispatch);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch; 