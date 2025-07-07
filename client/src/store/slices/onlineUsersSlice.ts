import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

interface OnlineUsersState {
  onlineUsers: string[];
}

const initialState: OnlineUsersState = {
  onlineUsers: [],
};

const onlineUsersSlice = createSlice({
  name: 'onlineUsers',
  initialState,
  reducers: {
    setOnlineUsers(state, action: PayloadAction<string[]>) {
      state.onlineUsers = action.payload;
    },
  },
});

export const { setOnlineUsers } = onlineUsersSlice.actions;
export default onlineUsersSlice.reducer; 