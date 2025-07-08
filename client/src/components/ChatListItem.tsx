import React from "react";
import {
  ListItem,
  ListItemText,
  Avatar,
  Typography,
  Box,
  Tooltip,
  Badge,
  Chip,
} from "@mui/material";
import type { User, Message } from "../types/auth";
import { formatTimestamp, formatTimeOnly } from "../utils/timestamp";

interface Chat {
  _id: string;
  isGroup: boolean;
  participants: User[];
  groupAdmin?: User;
  chatName?: string;
  latestMessage?: Message;
}

interface ChatListItemProps {
  chat: Chat;
  isSelected: boolean;
  currentUserId: string;
  unreadCount: number;
  onClick: () => void;
}

const ChatListItem: React.FC<ChatListItemProps> = ({
  chat,
  isSelected,
  currentUserId,
  unreadCount,
  onClick,
}) => {
  // Helper to get chat display name and avatar
  const getChatDisplay = () => {
    if (chat.isGroup) {
      return { name: chat.chatName || "Group Chat", avatar: undefined };
    }
    // 1:1 chat: show the other user's name
    const otherUser = chat.participants.find(
      (p) => String(p._id) !== String(currentUserId)
    );
    return { name: otherUser?.name || "Unknown", avatar: otherUser?.avatarUrl };
  };

  const { name, avatar } = getChatDisplay();

  const formatMessagePreview = (message: Message) => {
    const senderName = message.sender._id === currentUserId ? "You" : message.sender.name;
    return (
      <span>
        <span style={{ fontWeight: 'normal', color: undefined }}>
          {senderName}
        </span>
        {`: ${message.content}`}
      </span>
    );
  };

  return (
    <ListItem
      onClick={onClick}
      sx={{
        cursor: "pointer",
        backgroundColor: isSelected ? "action.selected" : unreadCount > 0 ? "action.hover" : "transparent",
        borderRadius: 1,
        mb: 0.5,
        border: unreadCount > 0 ? "1px solid" : "none",
        borderColor: "primary.main",
        "&:hover": {
          backgroundColor: "action.hover",
        },
      }}
    >
      <Badge
        badgeContent={unreadCount}
        color="primary"
        max={99}
        anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
        sx={{
          position: 'relative',
          top: 0,
          left: 0,
          zIndex: 1,
          "& .MuiBadge-badge": {
            fontSize: "0.7rem",
            height: "18px",
            minWidth: "18px",
          },
        }}
      >
        <Avatar
          src={avatar}
          alt={name}
          sx={{ width: 48, height: 48, mr: 2 }}
        >
          {name?.charAt(0)?.toUpperCase()}
        </Avatar>
      </Badge>
      <ListItemText
        primary={
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Typography
              variant="body1"
              fontWeight={isSelected ? "bold" : "normal"}
              noWrap
              sx={{ 
                maxWidth: "70%",
                color: isSelected ? "primary.main" : "text.primary",
                textShadow: isSelected ? "0 0 1px rgba(0,0,0,0.1)" : "none",
              }}
            >
              {name}
            </Typography>
            {chat.latestMessage && (
              <Tooltip title={formatTimeOnly(chat.latestMessage.createdAt)}>
                <Typography 
                  variant="caption" 
                  color="text.secondary"
                  sx={{
                    cursor: "help",
                    "&:hover": {
                      color: "primary.main",
                    },
                  }}
                >
                  {formatTimestamp(chat.latestMessage.createdAt)}
                </Typography>
              </Tooltip>
            )}
          </Box>
        }
        secondary={
          chat.latestMessage ? (
            <Tooltip title={chat.latestMessage.content}>
              <Typography
                variant="body2"
                color="text.secondary"
                noWrap
                sx={{
                  maxWidth: "100%",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  display: "block",
                }}
                component="span"
              >
                {formatMessagePreview(chat.latestMessage)}
              </Typography>
            </Tooltip>
          ) : (
            <Typography variant="body2" color="text.secondary">
              No messages yet
            </Typography>
          )
        }
      />
    </ListItem>
  );
};

// Custom comparison: only re-render if chat._id, isSelected, unreadCount, or latestMessage change
function areEqual(prevProps: ChatListItemProps, nextProps: ChatListItemProps) {
  return (
    prevProps.chat._id === nextProps.chat._id &&
    prevProps.isSelected === nextProps.isSelected &&
    prevProps.unreadCount === nextProps.unreadCount &&
    JSON.stringify(prevProps.chat.latestMessage) === JSON.stringify(nextProps.chat.latestMessage)
  );
}

export default React.memo(ChatListItem, areEqual); 