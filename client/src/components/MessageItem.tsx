import React from "react";
import { Box, Typography, Avatar, Tooltip } from "@mui/material";
import MessageReactions from "./MessageReactions";
import MessageStatus from "./MessageStatus";
import type { Message, Reaction } from "../types/auth";
import { formatTimestamp, formatTimeOnly } from "../utils/timestamp";

interface MessageItemProps {
  message: Message;
  isOwnMessage: boolean;
  onReactionUpdate: (messageId: string, reactions: Reaction[]) => void;
}

const MessageItem: React.FC<MessageItemProps> = ({ message, isOwnMessage, onReactionUpdate }) => {
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: isOwnMessage ? "flex-end" : "flex-start",
        mb: 2,
        gap: 1,
      }}
    >
      {!isOwnMessage && (
        <Avatar
          src={message.sender.avatarUrl}
          alt={message.sender.name}
          sx={{ width: 32, height: 32, flexShrink: 0 }}
        >
          {message.sender.name?.charAt(0)?.toUpperCase()}
        </Avatar>
      )}

      <Box
        sx={{
          maxWidth: "70%",
          display: "flex",
          flexDirection: "column",
          alignItems: isOwnMessage ? "flex-end" : "flex-start",
        }}
      >
        <Box
          sx={{
            backgroundColor: isOwnMessage ? "primary.main" : "background.paper",
            color: isOwnMessage ? "primary.contrastText" : "text.primary",
            borderRadius: 2,
            px: 2,
            py: 1,
            wordBreak: "break-word",
            whiteSpace: "pre-wrap",
            overflowWrap: "break-word",
            maxWidth: "100%",
            border: isOwnMessage ? "none" : "1px solid",
            borderColor: "divider",
          }}
        >
          <Typography variant="body2">{message.content}</Typography>
        </Box>

        <Box sx={{ display: "flex", alignItems: "center", mt: 0.5 }}>
          <Tooltip title={formatTimeOnly(message.createdAt)}>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ 
                fontSize: "0.7rem",
                cursor: "help",
                "&:hover": {
                  color: "primary.main",
                },
              }}
            >
              {formatTimestamp(message.createdAt)}
            </Typography>
          </Tooltip>
          {isOwnMessage && (
            <MessageStatus 
              status="read" 
              timestamp={formatTimeOnly(message.createdAt)}
              isRead={message.isRead || false}
            />
          )}
        </Box>
        
        {/* Message Reactions */}
        <MessageReactions message={message} onReactionUpdate={onReactionUpdate} />
      </Box>
    </Box>
  );
};

export default MessageItem;
