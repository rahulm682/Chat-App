import React, { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./AuthContext";
import { getSocket } from "../socket/socket";
import type { Message } from "../types/auth";

interface UnreadMessage {
  chatId: string;
  messageId: string;
  senderName: string;
  content: string;
  timestamp: string;
}

interface NotificationContextType {
  unreadMessages: Record<string, UnreadMessage[]>;
  unreadCounts: Record<string, number>;
  totalUnreadCount: number;
  markMessageAsRead: (chatId: string, messageId: string) => void;
  markChatAsRead: (chatId: string) => void;
  addUnreadMessage: (message: Message) => void;
  clearNotifications: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotifications must be used within NotificationProvider");
  }
  return context;
};

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [unreadMessages, setUnreadMessages] = useState<Record<string, UnreadMessage[]>>({});
  const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({});
  const { user } = useAuth();

  // Calculate total unread count
  const totalUnreadCount = Object.values(unreadCounts).reduce((sum, count) => sum + count, 0);

  // Add unread message
  const addUnreadMessage = (message: Message) => {
    if (!user || message.sender._id === user._id) return; // Don't count own messages

    const unreadMessage: UnreadMessage = {
      chatId: message.chat,
      messageId: message._id,
      senderName: message.sender.name,
      content: message.content,
      timestamp: message.createdAt,
    };

    setUnreadMessages(prev => ({
      ...prev,
      [message.chat]: [...(prev[message.chat] || []), unreadMessage],
    }));

    setUnreadCounts(prev => ({
      ...prev,
      [message.chat]: (prev[message.chat] || 0) + 1,
    }));
  };

  // Mark specific message as read
  const markMessageAsRead = (chatId: string, messageId: string) => {
    setUnreadMessages(prev => ({
      ...prev,
      [chatId]: (prev[chatId] || []).filter(msg => msg.messageId !== messageId),
    }));

    setUnreadCounts(prev => ({
      ...prev,
      [chatId]: Math.max(0, (prev[chatId] || 0) - 1),
    }));
  };

  // Mark entire chat as read
  const markChatAsRead = (chatId: string) => {
    setUnreadMessages(prev => ({
      ...prev,
      [chatId]: [],
    }));

    setUnreadCounts(prev => ({
      ...prev,
      [chatId]: 0,
    }));
  };

  // Clear all notifications
  const clearNotifications = () => {
    setUnreadMessages({});
    setUnreadCounts({});
  };

  // Listen for new messages
  useEffect(() => {
    if (!user) return;

    const socket = getSocket();
    if (!socket) return;

    const handleNewMessage = (message: Message) => {
      addUnreadMessage(message);
    };

    socket.on("message-received", handleNewMessage);

    return () => {
      socket.off("message-received", handleNewMessage);
    };
  }, [user]);

  return (
    <NotificationContext.Provider
      value={{
        unreadMessages,
        unreadCounts,
        totalUnreadCount,
        markMessageAsRead,
        markChatAsRead,
        addUnreadMessage,
        clearNotifications,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}; 