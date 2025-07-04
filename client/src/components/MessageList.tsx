import React from "react";
import { Box, Typography } from "@mui/material";
import { useEffect, useRef } from "react";
import MessageItem from "./MessageItem";
import DateSeparator from "./DateSeparator";
import UnreadMessageHighlight from "./UnreadMessageHighlight";
import type { Message, Reaction } from "../types/auth";
import { useAuth } from "../context/AuthContext";
import { useNotifications } from "../context/NotificationContext";
import { isSameDay } from "../utils/timestamp";

interface MessageListProps {
  messages: Message[];
  chatId: string;
  loading: boolean;
  isNewMessage?: boolean; // Flag to indicate if this is a new real-time message
  containerRef?: React.Ref<HTMLDivElement>;
  onReactionUpdate: (messageId: string, reactions: Reaction[]) => void;
  [key: string]: any; // for extra props like data-message-list-container
}

const MessageList = ({
  messages,
  chatId,
  loading,
  isNewMessage = false,
  containerRef,
  onReactionUpdate,
  ...rest
}: MessageListProps) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const previousMessageCount = useRef(messages.length);
  const isInitialLoad = useRef(true);
  const { user } = useAuth();
  const { unreadMessages } = useNotifications();

  // Scroll to bottom on initial load and for new real-time messages
  useEffect(() => {
    if (isInitialLoad.current && messages.length > 0 && !loading) {
      // Initial load - scroll to bottom to show latest messages
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      isInitialLoad.current = false;
    } else if (isNewMessage && messages.length > previousMessageCount.current) {
      // New real-time message - scroll to bottom
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
    previousMessageCount.current = messages.length;
  }, [messages, isNewMessage, loading]);

  // Reset initial load flag when chat changes
  useEffect(() => {
    isInitialLoad.current = true;
  }, [chatId]);

  return (
    <Box
      ref={containerRef}
      {...rest}
      sx={{
        p: 2,
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Loading indicator */}
      {loading && (
        <Box sx={{ display: "flex", justifyContent: "center", p: 2 }}>
          <Typography variant="body2" color="text.secondary">
            Loading messages...
          </Typography>
        </Box>
      )}

      {/* Messages */}
      {messages.map((msg, index) => {
        const showDateSeparator = index === 0 || 
          !isSameDay(msg.createdAt, messages[index - 1].createdAt);
        
        const isUnread = unreadMessages[chatId]?.some(
          unreadMsg => unreadMsg.messageId === msg._id
        ) || false;
        
        return (
          <React.Fragment key={msg._id}>
            {showDateSeparator && <DateSeparator date={msg.createdAt} />}
            <UnreadMessageHighlight messageId={msg._id} isUnread={isUnread}>
              <MessageItem
                message={msg}
                isOwnMessage={msg.sender._id === user?._id}
                onReactionUpdate={onReactionUpdate}
              />
            </UnreadMessageHighlight>
          </React.Fragment>
        );
      })}

      {/* Invisible div to scroll to bottom */}
      <div ref={messagesEndRef} />
    </Box>
  );
};

export default MessageList;
