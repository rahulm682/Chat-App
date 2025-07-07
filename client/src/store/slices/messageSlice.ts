import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

const initialState = {
  draft: '',
};

const messageSlice = createSlice({
  name: 'message',
  initialState,
  reducers: {
    setDraft(state, action: PayloadAction<string>) {
      state.draft = action.payload;
    },
  },
});

export const { setDraft } = messageSlice.actions;
export default messageSlice.reducer; 