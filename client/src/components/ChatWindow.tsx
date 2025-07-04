import { Box, Typography } from "@mui/material";
import MessageList from "./MessageList";
import MessageInput from "./MessageInput";
import ChatHeader from "./ChatHeader";
import WelcomeScreen from "./WelcomeScreen";
import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import API from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { getSocket } from "../socket/socket";
import type { User, Message, Reaction } from "../types/auth";
import TypingIndicator from "./TypingIndicator";
import { useOnlineUsers } from "../context/OnlineUsersContext";
import { useNotifications } from "../context/NotificationContext";

interface Chat {
  _id: string;
  chatName?: string;
  participants: User[];
}

const ChatWindow = ({ chat }: { chat: Chat | null }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isNewMessage, setIsNewMessage] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const { user } = useAuth();
  const { markChatAsRead } = useNotifications();

  // Handle reaction updates
  const handleReactionUpdate = (messageId: string, reactions: Reaction[]) => {
    setMessages((prev) =>
      prev.map((msg) =>
        msg._id === messageId ? { ...msg, reactions } : msg
      )
    );
  };

  // Robustly find the other user
  const otherUser = useMemo(() => {
    if (!chat || !user) return null;
    return chat.participants.find((p) => String(p._id) !== String(user._id));
  }, [chat, user]);

  // Get online users from context
  const onlineUsers = useOnlineUsers();
  const isOtherUserOnline = otherUser
    ? onlineUsers.includes(String(otherUser._id))
    : false;
  console.log("🔌 ChatWindow: Online users from context:", onlineUsers);
  console.log("🔌 ChatWindow: Other user:", otherUser);
  console.log("🔌 ChatWindow: isOtherUserOnline:", isOtherUserOnline);
  const currentChatRef = useRef<Chat | null>(null);
  useEffect(() => {
    currentChatRef.current = chat;
  }, [chat]);

  // Ref for message list container
  const messageListRef = useRef<HTMLDivElement>(null);

  // Reset messages and pagination when chat changes
  useEffect(() => {
    if (chat) {
      setMessages([]);
      setPage(1);
      setHasMore(true);
      setIsNewMessage(false);
    }
  }, [chat]);

  // Fetch all messages at once (now paginated)
  const fetchMessages = useCallback(async () => {
    if (!chat || !user?.token) return;
    setLoading(true);
    setError(null);
    setIsNewMessage(false); // Not a new real-time message
    try {
      const { data } = await API.get(`/messages/${chat._id}?page=1&limit=20`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setMessages(data.messages);
      setHasMore(data.hasMore);
      setPage(1);
    } catch (err) {
      setError("Failed to fetch messages");
    } finally {
      setLoading(false);
    }
  }, [chat, user]);

  // Load messages when chat changes
  useEffect(() => {
    if (chat) {
      fetchMessages();
      // Mark chat as read when opened
      markChatAsRead(chat._id);
    }
  }, [chat, fetchMessages, markChatAsRead]);

  // Load more messages (pagination)
  const loadMoreMessages = async () => {
    if (!chat || !user?.token || loadingMore || !hasMore) return;
    setLoadingMore(true);
    const prevScrollHeight = messageListRef.current?.scrollHeight || 0;
    try {
      const { data } = await API.get(
        `/messages/${chat._id}?page=${page + 1}&limit=20`,
        {
          headers: { Authorization: `Bearer ${user.token}` },
        }
      );
      if (data.messages.length === 0) {
        setHasMore(false);
      } else {
        setMessages((prev) => [...data.messages, ...prev]);
        setPage((p) => p + 1);
        setTimeout(() => {
          if (messageListRef.current) {
            messageListRef.current.scrollTop =
              messageListRef.current.scrollHeight - prevScrollHeight;
          }
        }, 0);
      }
    } catch (err) {
      // Optionally handle error
    } finally {
      setLoadingMore(false);
    }
  };

  // Scroll handler for infinite scroll
  const handleScroll = () => {
    const container = messageListRef.current;
    if (!container || loadingMore || !hasMore) return;
    if (container.scrollTop === 0) {
      loadMoreMessages();
    }
  };

  useEffect(() => {
    if (!chat) return;

    const socket = getSocket();
    if (!socket) {
      console.error("🔌 Socket not available in ChatWindow");
      return;
    }

    console.log("🔌 Joining chat room:", chat._id);
    socket.emit("join-chat", chat._id);

    const handleMessageReceived = (msg: Message) => {
      console.log("🔌 Message received via socket:", msg);
      console.log("🔌 Current chat ID:", currentChatRef.current?._id);
      console.log("🔌 Message chat ID:", msg.chat);
      console.log(msg.chat, currentChatRef.current?._id);

      if (msg.chat_id === currentChatRef.current?._id) {
        console.log("🔌 Adding message to current chat");
        setIsNewMessage(true); // This is a new real-time message
        // Ensure the message has an empty reactions array
        const messageWithReactions = { ...msg, reactions: msg.reactions || [] };
        setMessages((prev) => [...prev, messageWithReactions]);
      } else {
        console.log("🔌 Message not for current chat, ignoring");
      }
    };

    const handleTyping = () => {
      console.log("🔌 Typing indicator received");
      setIsTyping(true);
    };

    const handleStopTyping = () => {
      console.log("🔌 Stop typing indicator received");
      setIsTyping(false);
    };

    socket.on("message-received", handleMessageReceived);
    socket.on("typing", handleTyping);
    socket.on("stop-typing", handleStopTyping);
    socket.on("reaction-added", (data: { messageId: string; reaction: Reaction }) => {
      console.log("🔌 Reaction added:", data);
      handleReactionUpdate(data.messageId, [
        ...(messages.find(m => m._id === data.messageId)?.reactions || []),
        data.reaction
      ]);
    });
    socket.on("reaction-removed", (data: { messageId: string; userId: string }) => {
      console.log("🔌 Reaction removed:", data);
      const message = messages.find(m => m._id === data.messageId);
      if (message) {
        const updatedReactions = message.reactions?.filter(r => r.user._id !== data.userId) || [];
        handleReactionUpdate(data.messageId, updatedReactions);
      }
    });

    return () => {
      console.log("🔌 Cleaning up socket listeners for chat:", chat._id);
      socket.off("message-received", handleMessageReceived);
      socket.off("typing", handleTyping);
      socket.off("stop-typing", handleStopTyping);
      socket.off("reaction-added");
      socket.off("reaction-removed");
    };
  }, [chat]);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100vh" }}>
      {!chat ? (
        <WelcomeScreen />
      ) : (
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            height: "100%",
            minHeight: 0,
          }}
        >
          {/* Chat Header - Fixed at top */}
          <ChatHeader otherUser={otherUser || null} isOtherUserOnline={isOtherUserOnline} />

          {/* Message List - Flexible */}
          <Box
            ref={messageListRef}
            onScroll={handleScroll}
            sx={{
              flex: 1,
              minHeight: 0,
              maxHeight: "65vh",
              display: "flex",
              flexDirection: "column",
              overflowY: "auto",
            }}
          >
            {loadingMore && (
              <Box
                sx={{
                  width: "100%",
                  display: "flex",
                  justifyContent: "center",
                  py: 1,
                }}
              >
                <Typography variant="body2" color="text.secondary">
                  Loading more...
                </Typography>
              </Box>
            )}
            <MessageList
              messages={messages}
              chatId={chat._id}
              loading={loading}
              isNewMessage={isNewMessage}
              onReactionUpdate={handleReactionUpdate}
            />
          </Box>

          <TypingIndicator show={isTyping} />

          {/* Message Input - Fixed at bottom */}
          <Box sx={{ pt: 1, display: "flex", alignItems: "center" }}>
            <MessageInput
              chatId={chat._id}
              onNewMessage={(msg: Message) => {
                const messageWithReactions = { ...msg, reactions: [] };
                setMessages((prev) => [...prev, messageWithReactions]);
              }}
            />
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default ChatWindow;
