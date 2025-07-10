import React, { useState, useMemo } from "react";
import {
  Box,
  IconButton,
  Tooltip,
  Popover,
  Chip,
} from "@mui/material";
import { AddReaction as AddReactionIcon } from "@mui/icons-material";
import type { IReaction, IMessage } from "../types/api";
import { useAddReactionMutation, useRemoveReactionMutation } from '../store/services/chatApi';
import { selectCurrentUser } from "../store/slices/userSlice";
import { useAppSelector } from "../store/hooks";

interface MessageReactionsProps {
  message: IMessage;
  onReactionUpdate: (messageId: string, reactions: IReaction[]) => void;
  refetchMessages?: () => void;
}

const REACTION_OPTIONS = ["👍", "❤️", "😊", "😮", "😢", "😡"];

const MessageReactions: React.FC<MessageReactionsProps> = ({
  message,
  onReactionUpdate,
  refetchMessages,
}) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [loading, setLoading] = useState(false);
  const user = useAppSelector(selectCurrentUser);
  const [addReaction] = useAddReactionMutation();
  const [removeReaction] = useRemoveReactionMutation();

  const reactions = message.reactions || [];
  const userReaction = reactions.find((r) => r.user._id === user?._id);

  // Group reactions by emoji (memoized)
  const reactionGroups = useMemo(() => {
    return reactions.reduce((acc, reaction) => {
      if (!acc[reaction.emoji]) {
        acc[reaction.emoji] = [];
      }
      acc[reaction.emoji].push(reaction);
      return acc;
    }, {} as Record<string, IReaction[]>);
  }, [reactions]);

  const handleReactionClick = async (emoji: string) => {
    if (!user?.token) return;
    setLoading(true);
    try {
      if (userReaction?.emoji === emoji) {
        // Remove reaction
        const response = await removeReaction({ messageId: message._id, chatId: message.chat._id });
        const updatedReactions = reactions.filter((r) => !(r.user._id === user?._id && r.emoji === emoji));
        onReactionUpdate(message._id, updatedReactions);
        if (refetchMessages) refetchMessages();
      } else {
        // Add or update reaction
        const response = await addReaction({ messageId: message._id, emoji, chatId: message.chat._id }).unwrap();
        const updatedReactions = reactions.filter((r) => r.user._id !== user?._id);
        updatedReactions.push(response);
        onReactionUpdate(message._id, updatedReactions);
        if (refetchMessages) refetchMessages();
      }
    } catch (error) {
      console.error("Error handling reaction:", error);
    } finally {
      setLoading(false);
      setAnchorEl(null);
    }
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mt: 0.5 }}>
      {/* Display existing reactions */}
      {Object.entries(reactionGroups).map(([emoji, reactionList]) => (
        <Chip
          key={emoji}
          label={`${emoji} ${reactionList.length}`}
          size="small"
          variant={userReaction?.emoji === emoji ? "filled" : "outlined"}
          color={userReaction?.emoji === emoji ? "primary" : "default"}
          onClick={() => handleReactionClick(emoji)}
          sx={{
            cursor: "pointer",
            fontSize: "0.75rem",
            height: 20,
            "&:hover": {
              backgroundColor: "action.hover",
            },
          }}
        />
      ))}

      {/* Add reaction button */}
      <Tooltip title="Add reaction">
        <IconButton
          size="small"
          onClick={handleMenuOpen}
          disabled={loading}
          sx={{ width: 24, height: 24 }}
        >
          <AddReactionIcon fontSize="small" />
        </IconButton>
      </Tooltip>

      {/* Reaction menu */}
      <Popover
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        anchorOrigin={{
          vertical: "top",
          horizontal: "center",
        }}
        transformOrigin={{
          vertical: "bottom",
          horizontal: "center",
        }}
        PaperProps={{
          sx: {
            display: "flex",
            flexDirection: "row",
            p: 0.5,
            gap: 0.5,
            borderRadius: 2,
            boxShadow: 3,
          },
        }}
      >
        {REACTION_OPTIONS.map((emoji) => (
          <IconButton
            key={emoji}
            onClick={() => handleReactionClick(emoji)}
            sx={{
              fontSize: "1.5rem",
              width: 40,
              height: 40,
              p: 0,
              borderRadius: 1,
              "&:hover": {
                backgroundColor: "action.hover",
                transform: "scale(1.1)",
              },
              transition: "all 0.2s ease",
            }}
          >
            {emoji}
          </IconButton>
        ))}
      </Popover>
    </Box>
  );
};

// Custom comparison: only re-render if message._id, message.reactions, or user._id change
function areEqual(prevProps: MessageReactionsProps, nextProps: MessageReactionsProps) {
  return (
    prevProps.message._id === nextProps.message._id &&
    JSON.stringify(prevProps.message.reactions) === JSON.stringify(nextProps.message.reactions) &&
    prevProps.onReactionUpdate === nextProps.onReactionUpdate &&
    prevProps.refetchMessages === nextProps.refetchMessages
  );
}

export default React.memo(MessageReactions, areEqual); 