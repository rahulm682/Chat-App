import { Box, Typography } from "@mui/material";
import MessageList from "./MessageList";
import MessageInput from "./MessageInput";
import ChatHeader from "./ChatHeader";
import WelcomeScreen from "./WelcomeScreen";
import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { getSocket } from "../socket/socket";
import type { User, Message, Reaction } from "../types/auth";
import TypingIndicator from "./TypingIndicator";
import { useOnlineUsers } from "../context/OnlineUsersContext";
import {
  useGetMessagesQuery,
  useMarkMessagesAsReadMutation,
  type ApiMessage,
} from "../store/services/chatApi";
import { useAppSelector } from "../store/hooks";
import { selectCurrentUser } from "../store/slices/userSlice";

interface Chat {
  _id: string;
  chatName?: string;
  participants: User[];
}

const ChatWindow = ({ chat }: { chat: Chat | null }) => {
  const selectedChatId = useAppSelector((state) => state.chat.selectedChatId);
  const user = useAppSelector(selectCurrentUser);
  const [messages, setMessages] = useState<ApiMessage[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [isNewMessage, setIsNewMessage] = useState(false);

  const { data, refetch, isFetching } = useGetMessagesQuery(
    { chatId: selectedChatId ?? "", page, limit: 15 },
    { skip: !selectedChatId }
  );
  const [markMessagesAsRead] = useMarkMessagesAsReadMutation();

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
  
  const currentChatRef = useRef<Chat | null>(null);
  useEffect(() => {
    currentChatRef.current = chat;
  }, [chat]);

  // Ref for message list container
  const messageListRef = useRef<HTMLDivElement>(null);

  // Mark messages as read when chat changes
  useEffect(() => {
    if (selectedChatId && user?.token) {
      markMessagesAsRead({ chatId: selectedChatId })
        .unwrap()
        .then(() => {
        })
        .catch((error) => {
        });
    }
  }, [selectedChatId, user, markMessagesAsRead]);

  // Load messages when chat or page changes
  useEffect(() => {
    if (data && page === 1) {
      setMessages(data.messages);
      setHasMore(data.hasMore);
    } else if (data && page > 1) {
      setMessages((prev) => {
        // Create a map of existing messages for quick lookup
        const existingMessages = new Map(prev.map(msg => [msg._id, msg]));
        
        // Add new messages from the server, avoiding duplicates
        const newMessages = data.messages.filter(msg => !existingMessages.has(msg._id));
        
        // For pagination, older messages should be added to the beginning
        // since we're scrolling up to see older messages
        const result = [...newMessages, ...prev];
        return result;
      });
      setHasMore(data.hasMore);
    }
  }, [data, page]);

  // Reset messages when chat changes
  useEffect(() => {
    setPage(1);
    setMessages([]);
    setHasMore(true);
    setIsNewMessage(false);
  }, [selectedChatId]);

  // Infinite scroll handler
  const handleScroll = useCallback(() => {
    const container = messageListRef.current;
    if (!container || loadingMore || !hasMore || isFetching) return;
    if (container.scrollTop === 0) {
      setLoadingMore(true);
      setPage((prev) => prev + 1);
      setTimeout(() => setLoadingMore(false), 500); // Simulate loading
    }
  }, [loadingMore, hasMore, isFetching]);

  // Add this function inside ChatWindow
  const handleReactionUpdate = useCallback((messageId: string, reactions: Reaction[]) => {
    setMessages((prevMessages) =>
      prevMessages.map((msg) =>
        msg._id === messageId ? { ...msg, reactions } : msg
      )
    );
  }, []);

  // Expose a refetchMessages function for children
  const refetchMessages = useCallback(() => {
    if (refetch) refetch();
  }, [refetch]);

  useEffect(() => {
    if (!chat) return;

    const socket = getSocket();
    if (!socket) {
      return;
    }

    socket.emit("join-chat", chat._id);
    
    // Notify server that user is actively viewing this chat
    socket.emit("user-viewing-chat", { chatId: chat._id, userId: user?._id });

    const handleMessageReceived = (msg: ApiMessage) => {
      if (msg.chat._id === currentChatRef.current?._id) {
        // Add the new message directly to the state instead of refetching
        setMessages((prev) => {
          // Check if message already exists to avoid duplicates
          const messageExists = prev.some(existingMsg => existingMsg._id === msg._id);
          if (messageExists) {
            return prev;
          }
          
          // Add new message to the end (since it's the newest)
          return [...prev, msg];
        });
        setIsNewMessage(true);
        
        // If the message is from another user and we're actively viewing this chat,
        // mark it as read immediately
        if (msg.sender._id !== user?._id) {
          markMessagesAsRead({ chatId: msg.chat._id });
        }
      }
    };

    const handleTyping = () => {
      setIsTyping(true);
    };

    const handleStopTyping = () => {
      setIsTyping(false);
    };

    socket.on("message-received", handleMessageReceived);
    socket.on("typing", handleTyping);
    socket.on("stop-typing", handleStopTyping);
    socket.on(
      "reaction-added",
      (data: { messageId: string; reaction: Reaction }) => {
        refetchMessages();
      }
    );
    socket.on(
      "reaction-removed",
      (data: { messageId: string; userId: string }) => {
        refetchMessages();
      }
    );

    return () => {
      socket.off("message-received", handleMessageReceived);
      socket.off("typing", handleTyping);
      socket.off("stop-typing", handleStopTyping);
      socket.off("reaction-added");
      socket.off("reaction-removed");
    };
  }, [chat, user, markMessagesAsRead, refetchMessages]);

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
          <ChatHeader
            otherUser={otherUser || null}
            isOtherUserOnline={isOtherUserOnline}
          />

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
              ref={messageListRef}
              messages={messages}
              chatId={chat._id}
              loading={isFetching && page === 1}
              isNewMessage={isNewMessage}
              onReactionUpdate={handleReactionUpdate}
              refetchMessages={refetchMessages}
            />
          </Box>

          <TypingIndicator show={isTyping} />

          {/* Message Input - Fixed at bottom */}
          <Box sx={{ pt: 1, display: "flex", alignItems: "center" }}>
            <MessageInput
              chatId={chat._id}
              onNewMessage={(msg: Message) => {
                // const messageWithReactions = { ...msg, reactions: [] };
                // setMessages((prev) => [...prev, messageWithReactions]);
              }}
            />
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default ChatWindow;
