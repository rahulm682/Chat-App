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
import { useNotifications } from "../context/NotificationContext";

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
  onClick: () => void;
}

const ChatListItem: React.FC<ChatListItemProps> = ({
  chat,
  isSelected,
  currentUserId,
  onClick,
}) => {
  const { unreadCounts } = useNotifications();
  const unreadCount = unreadCounts[chat._id] || 0;
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
    return `${senderName}: ${message.content}`;
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
        sx={{
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
            <Typography
              variant="body2"
              color="text.secondary"
              noWrap
              sx={{ maxWidth: "100%" }}
            >
              {formatMessagePreview(chat.latestMessage)}
            </Typography>
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

export default ChatListItem; 