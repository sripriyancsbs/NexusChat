import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { api } from '../services/api.js';
import { socketClient } from '../services/socket.js';
import { useAuth } from './AuthContext.jsx';

const ChatContext = createContext(null);

export const ChatProvider = ({ children }) => {
  const { user, token } = useAuth();

  const [channels, setChannels] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [activeConversationId, setActiveConversationId] = useState(null);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loadingMessages, setLoadingMessages] = useState(false);

  // Thread drawer
  const [activeThread, setActiveThread] = useState(null);
  const [threadMessages, setThreadMessages] = useState([]);
  const [loadingThread, setLoadingThread] = useState(false);

  // Presence & typing
  const [presenceMap, setPresenceMap] = useState({});
  const [typingMap, setTypingMap] = useState({});

  // Notifications & unread counts
  const [notifications, setNotifications] = useState([]);
  const [unreadNotificationsCount, setUnreadNotificationsCount] = useState(0);

  // Keep a ref to activeConversationId so socket callbacks have latest value
  const activeIdRef = useRef(activeConversationId);
  useEffect(() => {
    activeIdRef.current = activeConversationId;
  }, [activeConversationId]);

  const activeThreadRef = useRef(activeThread);
  useEffect(() => {
    activeThreadRef.current = activeThread;
  }, [activeThread]);

  // Fetch channels and DM conversations
  const refreshChannelsAndConversations = useCallback(async () => {
    if (!token) return;
    try {
      const [chanRes, convRes] = await Promise.all([
        api.listChannels(),
        api.listConversations()
      ]);
      setChannels(chanRes.channels || []);
      setConversations(convRes.conversations || []);
    } catch (err) {
      console.error('Failed to load channels/conversations:', err);
    }
  }, [token]);

  // Fetch notifications
  const refreshNotifications = useCallback(async () => {
    if (!token) return;
    try {
      const res = await api.listNotifications();
      const notifs = res.notifications || [];
      setNotifications(notifs);
      setUnreadNotificationsCount(notifs.filter((n) => !n.is_read && !n.isRead).length);
    } catch (err) {
      console.error('Failed to load notifications:', err);
    }
  }, [token]);

  // Initial load when user/token ready
  useEffect(() => {
    if (token && user) {
      refreshChannelsAndConversations();
      refreshNotifications();
    } else {
      setChannels([]);
      setConversations([]);
      setActiveConversationId(null);
      setActiveConversation(null);
      setMessages([]);
      setActiveThread(null);
      setThreadMessages([]);
    }
  }, [token, user, refreshChannelsAndConversations, refreshNotifications]);

  // Select a conversation by conversationId
  const selectConversation = useCallback(async (conversationId, convObject = null) => {
    if (!conversationId) return;

    // Unsubscribe from previous conversation
    if (activeIdRef.current && activeIdRef.current !== conversationId) {
      socketClient.unsubscribe(activeIdRef.current);
    }

    setActiveConversationId(conversationId);
    setLoadingMessages(true);
    setActiveThread(null);
    setThreadMessages([]);

    // Determine metadata
    if (convObject) {
      setActiveConversation(convObject);
    } else {
      // Find from channels or conversations list
      const chan = channels.find((c) => c.conversation_id === conversationId);
      if (chan) {
        setActiveConversation({ ...chan, type: 'CHANNEL' });
      } else {
        const conv = conversations.find((c) => c.id === conversationId);
        if (conv) {
          setActiveConversation(conv);
        }
      }
    }

    // Subscribe to socket room
    socketClient.subscribe(conversationId);

    // Fetch messages
    try {
      const res = await api.getMessages(conversationId);
      setMessages(res.messages || []);
      // Mark as read in backend and WS
      api.markAsRead(conversationId).catch(() => {});
      socketClient.ackRead(conversationId);

      // Reset unread count in local list
      setConversations((prev) =>
        prev.map((c) => (c.id === conversationId ? { ...c, unread_count: 0 } : c))
      );
    } catch (err) {
      console.error('Failed to load messages for conversation:', err);
    } finally {
      setLoadingMessages(false);
    }
  }, [channels, conversations]);

  // Helper to select a channel directly
  const selectChannel = useCallback((channel) => {
    if (!channel) return;
    selectConversation(channel.conversation_id, {
      ...channel,
      type: 'CHANNEL'
    });
  }, [selectConversation]);

  // Open thread drawer
  const openThread = useCallback(async (parentMessage) => {
    setActiveThread(parentMessage);
    if (!parentMessage?.id || !activeIdRef.current) return;

    setLoadingThread(true);
    try {
      // Fetch messages for active conversation and filter for thread
      const res = await api.getMessages(activeIdRef.current);
      const threadReplies = (res.messages || []).filter(
        (m) => m.reply_to_message_id === parentMessage.id
      );
      setThreadMessages(threadReplies);
    } catch (err) {
      console.error('Failed to load thread replies:', err);
    } finally {
      setLoadingThread(false);
    }
  }, []);

  const closeThread = useCallback(() => {
    setActiveThread(null);
    setThreadMessages([]);
  }, []);

  // Send message
  const sendMessage = useCallback(async (content, replyToMessageId = null) => {
    if (!activeIdRef.current || !content.trim()) return;

    try {
      const res = await api.sendMessage(activeIdRef.current, content.trim(), replyToMessageId);
      const newMsg = res.message;

      // Stop typing
      socketClient.setTyping(activeIdRef.current, false);

      if (replyToMessageId) {
        // Thread reply
        setThreadMessages((prev) => {
          if (prev.some((m) => m.id === newMsg.id)) return prev;
          return [...prev, newMsg];
        });
        // Update reply count on parent in messages list
        setMessages((prev) =>
          prev.map((m) =>
            m.id === replyToMessageId ? { ...m, reply_count: (m.reply_count || 0) + 1 } : m
          )
        );
      } else {
        // Main feed message
        setMessages((prev) => {
          if (prev.some((m) => m.id === newMsg.id)) return prev;
          return [...prev, newMsg];
        });
      }

      return newMsg;
    } catch (err) {
      console.error('Failed to send message:', err);
      throw err;
    }
  }, []);

  // Edit message
  const editMessage = useCallback(async (messageId, content) => {
    try {
      const res = await api.editMessage(messageId, content);
      const updated = res.message;
      setMessages((prev) => prev.map((m) => (m.id === messageId ? { ...m, ...updated } : m)));
      setThreadMessages((prev) => prev.map((m) => (m.id === messageId ? { ...m, ...updated } : m)));
      if (activeThreadRef.current?.id === messageId) {
        setActiveThread((prev) => ({ ...prev, ...updated }));
      }
      return updated;
    } catch (err) {
      console.error('Failed to edit message:', err);
      throw err;
    }
  }, []);

  // Delete message (soft delete)
  const deleteMessage = useCallback(async (messageId) => {
    try {
      await api.deleteMessage(messageId);
      const deletedState = {
        is_deleted: true,
        content: '[This message was deleted]'
      };
      setMessages((prev) =>
        prev.map((m) => (m.id === messageId ? { ...m, ...deletedState } : m))
      );
      setThreadMessages((prev) =>
        prev.map((m) => (m.id === messageId ? { ...m, ...deletedState } : m))
      );
      if (activeThreadRef.current?.id === messageId) {
        setActiveThread((prev) => ({ ...prev, ...deletedState }));
      }
    } catch (err) {
      console.error('Failed to delete message:', err);
      throw err;
    }
  }, []);

  // Toggle reaction
  const toggleReaction = useCallback(async (messageId, emoji) => {
    try {
      const res = await api.toggleReaction(messageId, emoji);
      const { reactions } = res;
      setMessages((prev) =>
        prev.map((m) => (m.id === messageId ? { ...m, reactions } : m))
      );
      setThreadMessages((prev) =>
        prev.map((m) => (m.id === messageId ? { ...m, reactions } : m))
      );
      if (activeThreadRef.current?.id === messageId) {
        setActiveThread((prev) => ({ ...prev, reactions }));
      }
    } catch (err) {
      console.error('Failed to toggle reaction:', err);
    }
  }, []);

  // Toggle pin
  const togglePin = useCallback(async (messageId) => {
    try {
      const res = await api.togglePin(messageId);
      const { isPinned } = res;
      setMessages((prev) =>
        prev.map((m) => (m.id === messageId ? { ...m, is_pinned: isPinned } : m))
      );
    } catch (err) {
      console.error('Failed to toggle pin:', err);
    }
  }, []);

  // Create channel
  const createChannel = useCallback(async (name, topic, isPrivate) => {
    try {
      const res = await api.createChannel({ name, topic, isPrivate });
      const newChan = res.channel;
      setChannels((prev) => [...prev, newChan]);
      // Select newly created channel
      selectChannel(newChan);
      return newChan;
    } catch (err) {
      console.error('Failed to create channel:', err);
      throw err;
    }
  }, [selectChannel]);

  // Start direct message
  const startDirectMessage = useCallback(async (targetUserId) => {
    try {
      const res = await api.getOrCreateDirect(targetUserId);
      const conv = res.conversation;
      await refreshChannelsAndConversations();
      selectConversation(conv.id, conv);
      return conv;
    } catch (err) {
      console.error('Failed to start direct message:', err);
      throw err;
    }
  }, [refreshChannelsAndConversations, selectConversation]);

  // Real-time WebSocket Event Subscriptions
  useEffect(() => {
    if (!token) return;

    // Handle new incoming messages
    const unsubMsg = socketClient.on('message:new', (payload) => {
      const msg = payload.message;
      if (!msg) return;

      // If for currently open conversation
      if (msg.conversation_id === activeIdRef.current) {
        if (msg.reply_to_message_id) {
          // It is a thread reply
          if (activeThreadRef.current?.id === msg.reply_to_message_id) {
            setThreadMessages((prev) => {
              if (prev.some((m) => m.id === msg.id)) return prev;
              return [...prev, msg];
            });
          }
          // Update reply count on parent
          setMessages((prev) =>
            prev.map((m) =>
              m.id === msg.reply_to_message_id
                ? { ...m, reply_count: (m.reply_count || 0) + 1 }
                : m
            )
          );
        } else {
          // Top-level message
          setMessages((prev) => {
            if (prev.some((m) => m.id === msg.id)) return prev;
            return [...prev, msg];
          });
        }
        // Ack read
        socketClient.ackRead(msg.conversation_id);
      } else {
        // For a different conversation, update unread count
        setConversations((prev) =>
          prev.map((c) =>
            c.id === msg.conversation_id
              ? { ...c, unread_count: (c.unread_count || 0) + 1, last_message: msg }
              : c
          )
        );
      }
    });

    // Handle message edits
    const unsubEdit = socketClient.on('message:edit', (payload) => {
      const { messageId, content, updatedAt } = payload;
      const updateFn = (m) =>
        m.id === messageId ? { ...m, content, updated_at: updatedAt, is_edited: true } : m;

      setMessages((prev) => prev.map(updateFn));
      setThreadMessages((prev) => prev.map(updateFn));
      if (activeThreadRef.current?.id === messageId) {
        setActiveThread((prev) => ({ ...prev, content, updated_at: updatedAt, is_edited: true }));
      }
    });

    // Handle message deletions
    const unsubDel = socketClient.on('message:delete', (payload) => {
      const { messageId } = payload;
      const deleteState = { is_deleted: true, content: '[This message was deleted]' };

      setMessages((prev) =>
        prev.map((m) => (m.id === messageId ? { ...m, ...deleteState } : m))
      );
      setThreadMessages((prev) =>
        prev.map((m) => (m.id === messageId ? { ...m, ...deleteState } : m))
      );
      if (activeThreadRef.current?.id === messageId) {
        setActiveThread((prev) => ({ ...prev, ...deleteState }));
      }
    });

    // Handle reactions
    const unsubReaction = socketClient.on('reaction:toggle', (payload) => {
      const { messageId, reactions } = payload;
      const updateFn = (m) => (m.id === messageId ? { ...m, reactions } : m);
      setMessages((prev) => prev.map(updateFn));
      setThreadMessages((prev) => prev.map(updateFn));
      if (activeThreadRef.current?.id === messageId) {
        setActiveThread((prev) => ({ ...prev, reactions }));
      }
    });

    // Handle pins
    const unsubPin = socketClient.on('pin:toggle', (payload) => {
      const { messageId, isPinned } = payload;
      setMessages((prev) =>
        prev.map((m) => (m.id === messageId ? { ...m, is_pinned: isPinned } : m))
      );
    });

    // Handle typing indicator
    const unsubTyping = socketClient.on('typing:update', (payload) => {
      const { conversationId, typingUsers } = payload;
      setTypingMap((prev) => ({
        ...prev,
        [conversationId]: typingUsers || []
      }));
    });

    // Handle presence
    const unsubPresence = socketClient.on('presence:update', (payload) => {
      const { userId, status } = payload;
      setPresenceMap((prev) => ({
        ...prev,
        [userId]: status
      }));
    });

    // Handle incoming notifications
    const unsubNotif = socketClient.on('notification:new', (payload) => {
      const notif = payload.notification;
      if (notif) {
        setNotifications((prev) => [notif, ...prev]);
        setUnreadNotificationsCount((prev) => prev + 1);
      }
    });

    return () => {
      unsubMsg();
      unsubEdit();
      unsubDel();
      unsubReaction();
      unsubPin();
      unsubTyping();
      unsubPresence();
      unsubNotif();
    };
  }, [token]);

  return (
    <ChatContext.Provider
      value={{
        channels,
        conversations,
        activeConversationId,
        activeConversation,
        messages,
        loadingMessages,
        activeThread,
        threadMessages,
        loadingThread,
        presenceMap,
        typingMap,
        notifications,
        unreadNotificationsCount,
        selectConversation,
        selectChannel,
        openThread,
        closeThread,
        sendMessage,
        editMessage,
        deleteMessage,
        toggleReaction,
        togglePin,
        createChannel,
        startDirectMessage,
        refreshChannelsAndConversations,
        refreshNotifications,
        setNotifications,
        setUnreadNotificationsCount
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) throw new Error('useChat must be used within ChatProvider');
  return context;
};
