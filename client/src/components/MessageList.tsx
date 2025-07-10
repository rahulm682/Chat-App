import React, { useEffect, useRef } from "react";
import { Box, Typography } from "@mui/material";
import MessageItem from "./MessageItem";
import DateSeparator from "./DateSeparator";
import { isSameDay } from "../utils/timestamp";
import { useAppSelector } from "../store/hooks";
import { selectCurrentUser } from "../store/slices/userSlice";
import { VariableSizeList } from 'react-window';
import type { IMessage, IReaction } from "../types/api";

interface MessageListProps {
  messages: IMessage[];
  chatId: string;
  loading: boolean;
  isNewMessage?: boolean; // Flag to indicate if this is a new real-time message
  containerRef?: React.Ref<HTMLDivElement>;
  onReactionUpdate: (messageId: string, reactions: IReaction[]) => void;
  refetchMessages?: () => void;
  onLoadMore: () => void;
  [key: string]: any; // for extra props like data-message-list-container
}

const BASE_PADDING = 24; // top/bottom padding, borders, etc.
const DATE_SEPARATOR_HEIGHT = 60; // this is beacuse the we are returning date + message height and we do not want to have overlapping messages
const REACTIONS_ROW_HEIGHT = 32;
const TIMESTAMP_HEIGHT = 20;
const CHAR_PER_LINE = 40;
const LINE_HEIGHT = 22;

function getItemSize(index: number, messages: IMessage[]): number {
  const msg = messages[index];
  if (!msg) return BASE_PADDING + LINE_HEIGHT;

  let height = BASE_PADDING;

  // Add date separator if needed
  if (
    index === 0 ||
    !isSameDay(msg.createdAt, messages[index - 1]?.createdAt)
  ) {
    height += DATE_SEPARATOR_HEIGHT;
  }

  // Add message content height (dynamic)
  const content = msg.content || '';
  const lines = Math.max(1, Math.ceil(content.length / CHAR_PER_LINE));
  height += lines * LINE_HEIGHT;

  // Add reactions row if there are reactions
  // if (msg.reactions && msg.reactions.length > 0) {
    height += REACTIONS_ROW_HEIGHT;
  // }

  // Add timestamp row (if it's on a separate line)
  height += TIMESTAMP_HEIGHT;

  return height;
}

const MessageList = React.forwardRef<HTMLDivElement, MessageListProps>(({
  messages,
  chatId,
  loading,
  isNewMessage = false,
  containerRef,
  onReactionUpdate,
  refetchMessages,
  onLoadMore,
  ...rest
}, ref) => {
  const user = useAppSelector(selectCurrentUser);
  const listRef = useRef<any>(null);
  const previousMessageCount = useRef(messages.length);
  const isInitialLoad = useRef(true);

  // Scroll to bottom on initial load and for new real-time messages
  useEffect(() => {
    if (isInitialLoad.current && messages.length > 0 && !loading) {
      listRef.current?.scrollToItem(messages.length - 1, 'end');
      isInitialLoad.current = false;
    } else if (isNewMessage && messages.length > previousMessageCount.current) {
      listRef.current?.scrollToItem(messages.length - 1, 'end');
    }
    previousMessageCount.current = messages.length;
  }, [messages, isNewMessage, loading]);

  // Reset initial load flag when chat changes
  useEffect(() => {
    isInitialLoad.current = true;
  }, [chatId]);

  // Row renderer for react-window
  const Row = ({ index, style }: { index: number; style: React.CSSProperties }) => {
    const msg = messages[index] as IMessage;
    const showDateSeparator =
      index === 0 ||
      !isSameDay(msg.createdAt, messages[index - 1]?.createdAt);
    return (
      <div style={style}>
        {showDateSeparator && <DateSeparator date={msg.createdAt} />}
        <MessageItem
          message={msg}
          isOwnMessage={msg.sender._id === user?._id}
          onReactionUpdate={onReactionUpdate}
          refetchMessages={refetchMessages}
        />
      </div>
    );
  };

  // Infinite scroll: load more when scrolled to top
  const handleItemsRendered = ({ visibleStartIndex }: { visibleStartIndex: number }) => {
    if (visibleStartIndex === 0 && typeof onLoadMore === 'function') {
      onLoadMore();
    }
  };

  return (
    <Box
      ref={ref as any}
      {...rest}
      sx={{
        p: 2,
        display: "flex",
        flexDirection: "column",
        height: '100%',
        minHeight: 0,
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
      {messages.length === 0 && !loading && (
        <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 2 }}>
          No messages yet
        </Typography>
      )}
      {messages.length > 0 && (
        <VariableSizeList
          ref={listRef}
          height={500} // Or dynamically calculate based on container
          itemCount={messages.length}
          itemSize={index => getItemSize(index, messages)}
          width="100%"
          onItemsRendered={({ visibleStartIndex }) => handleItemsRendered({ visibleStartIndex })}
        >
          {Row}
        </VariableSizeList>
      )}
    </Box>
  );
});

export default MessageList;
