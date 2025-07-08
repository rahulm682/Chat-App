import React from "react";
import { Box, Typography, Avatar, Tooltip } from "@mui/material";
import MessageReactions from "./MessageReactions";
import MessageStatus from "./MessageStatus";
import type { ApiMessage, ApiReaction } from '../store/services/chatApi';
import { formatTimestamp, formatTimeOnly } from "../utils/timestamp";

interface MessageItemProps {
  message: ApiMessage;
  isOwnMessage: boolean;
  onReactionUpdate: (messageId: string, reactions: ApiReaction[]) => void;
  refetchMessages?: () => void;
}

const MessageItem: React.FC<MessageItemProps> = ({ message, isOwnMessage, onReactionUpdate, refetchMessages }) => {
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
              isRead={('isRead' in message) ? (message as any).isRead : false}
            />
          )}
        </Box>
        
        {/* Message Reactions */}
        <MessageReactions message={message as any} onReactionUpdate={onReactionUpdate} refetchMessages={refetchMessages} />
      </Box>
    </Box>
  );
};

// Custom comparison: only re-render if message._id, content, reactions, or isOwnMessage change
function areEqual(prevProps: MessageItemProps, nextProps: MessageItemProps) {
  return (
    prevProps.message._id === nextProps.message._id &&
    prevProps.message.content === nextProps.message.content &&
    JSON.stringify(prevProps.message.reactions) === JSON.stringify(nextProps.message.reactions) &&
    prevProps.isOwnMessage === nextProps.isOwnMessage
  );
}

export default React.memo(MessageItem, areEqual);
