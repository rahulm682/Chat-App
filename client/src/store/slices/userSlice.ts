import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '..';

const initialState = {
  user: null,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser(state, action: PayloadAction<any>) {    
      state.user = action.payload;
    },
    logout(state) {
      state.user = null;
    },
  },
});

export const { setUser, logout } = userSlice.actions;
export const selectCurrentUser = (state: RootState) => state.user.user;
export default userSlice.reducer; 