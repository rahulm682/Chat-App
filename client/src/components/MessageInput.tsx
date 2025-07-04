import { Box, TextField, IconButton } from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import { useState } from "react";
import API from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { useRef } from "react";
import { getSocket } from "../socket/socket";
import type { Message } from "../types/auth";

const MessageInput = ({
  chatId,
  onNewMessage,
}: {
  chatId: string;
  onNewMessage: (msg: Message) => void;
}) => {
  const [text, setText] = useState("");
  const { user } = useAuth();
  const socket = getSocket();
  const typingTimeout = useRef<number | null>(null);

  const sendMessage = async () => {
    if (!text.trim()) return;
    const { data } = await API.post(
      "/messages",
      { content: text, chatId },
      {
        headers: { Authorization: `Bearer ${user?.token}` },
      }
    );

    setText("");
    console.log("Message sent:", data);
  };

  const handleChange = (e: any) => {
    setText(e.target.value);

    socket.emit("typing", chatId);

    if (typingTimeout.current) clearTimeout(typingTimeout.current);

    typingTimeout.current = setTimeout(() => {
      socket.emit("stop-typing", chatId);
    }, 1500);

    if (e.target.value.trim() !== "") {
      socket.emit("typing", chatId);
    } else {
      socket.emit("stop-typing", chatId);
    }
  };

  return (
    <Box sx={{ p: 2, borderTop: "1px solid", borderColor: "divider", display: "flex", width: "100%", bgcolor: "background.paper" }}>
      <TextField
        fullWidth
        value={text}
        onChange={handleChange}
        onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        placeholder="Type a message..."
      />
      <IconButton onClick={sendMessage}>
        <SendIcon />
      </IconButton>
    </Box>
  );
};

export default MessageInput;
