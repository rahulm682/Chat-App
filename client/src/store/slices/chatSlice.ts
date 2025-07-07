import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

interface ChatState {
  selectedChatId: string | null;
}

const initialState: ChatState = {
  selectedChatId: null,
};

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    setSelectedChatId(state, action: PayloadAction<string | null>) {
      state.selectedChatId = action.payload;
    },
  },
});

export const { setSelectedChatId } = chatSlice.actions;
export default chatSlice.reducer; 