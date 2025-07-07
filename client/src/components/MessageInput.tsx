import { Box, TextField, IconButton } from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import { useState } from "react";
import { useRef } from "react";
import { getSocket } from "../socket/socket";
import type { Message } from "../types/auth";
import { useSendMessageMutation } from '../store/services/chatApi';
import { useAppSelector } from '../store/hooks';
import { selectCurrentUser } from '../store/slices/userSlice';

const MessageInput = ({
  chatId,
  onNewMessage,
}: {
  chatId: string;
  onNewMessage: (msg: Message) => void;
}) => {
  const [text, setText] = useState("");
  const socket = getSocket();
  const typingTimeout = useRef<number | null>(null);
  const [sendMessage] = useSendMessageMutation();
  const user = useAppSelector(selectCurrentUser);

  const handleSend = async () => {
    if (!text.trim()) return;
    
    try {
      await sendMessage({ chatId, content: text });
      setText("");
    } catch (error) {
    }
  };

  const handleChange = (e: any) => {
    setText(e.target.value);

    // Only emit socket events if socket is available
    if (socket) {
      socket.emit("typing", chatId);

      if (typingTimeout.current) clearTimeout(typingTimeout.current);

      typingTimeout.current = setTimeout(() => {
        if (socket) {
          socket.emit("stop-typing", chatId);
        }
      }, 1500);

      if (e.target.value.trim() !== "") {
        socket.emit("typing", chatId);
      } else {
        socket.emit("stop-typing", chatId);
      }
    }
  };

  return (
    <Box sx={{ p: 2, borderTop: "1px solid", borderColor: "divider", display: "flex", width: "100%", bgcolor: "background.paper" }}>
      <TextField
        fullWidth
        value={text}
        onChange={handleChange}
        onKeyDown={(e) => e.key === "Enter" && handleSend()}
        placeholder="Type a message..."
      />
      <IconButton onClick={handleSend}>
        <SendIcon />
      </IconButton>
    </Box>
  );
};

export default MessageInput;
