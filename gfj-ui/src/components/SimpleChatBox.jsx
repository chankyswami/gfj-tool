import React, { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { 
  Box, 
  TextField, 
  IconButton, 
  Paper, 
  Typography, 
  Avatar,
  CircularProgress,
  Alert,
  Divider,
  Chip
} from '@mui/material';
import { 
  Send, 
  Refresh,
  Clear
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import apiClient from '../app/axiosConfig';

const SimpleChatBox = ({ currentUser }) => {
  const user = useSelector((state) => state.user.userDetails || {});
  const { token } = user;
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);
  const serviceWorkerRef = useRef(null);
  const [isPolling, setIsPolling] = useState(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // console.log('SimpleChatBox - Current user details:', user);
    
    if (user && token) {
      initializeServiceWorker();
    }
    
    return () => {
      stopServiceWorker();
    };
  }, [user, token]);

  // Start polling when component mounts
  useEffect(() => {
    if (user && token && !isPolling) {
      loadMessages();
      // Polling will start after service worker is initialized
    }
  }, [user, token, isPolling]);

  // Cleanup polling on unmount
  useEffect(() => {
    return () => {
      stopPolling();
    };
  }, []);

  const initializeServiceWorker = async () => {
    try {
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.register('/chat-worker.js');
        serviceWorkerRef.current = registration;
        
        // Listen for messages from service worker
        navigator.serviceWorker.addEventListener('message', handleServiceWorkerMessage);
        
        // console.log('Chat Service Worker registered');
        
        // Start polling once service worker is ready
        if (user && token && !isPolling) {
          startPolling();
        }
      }
    } catch (error) {
      console.error('Failed to register service worker:', error);
    }
  };

  const startPolling = () => {
    if (serviceWorkerRef.current && navigator.serviceWorker.controller && !isPolling) {
      navigator.serviceWorker.controller.postMessage({
        type: 'START_POLLING',
        data: {
          token,
          interval: 2000,
          currentMessages: messages
        }
      });
      setIsPolling(true);
    }
  };

  const stopPolling = () => {
    if (navigator.serviceWorker.controller && isPolling) {
      navigator.serviceWorker.controller.postMessage({
        type: 'STOP_POLLING'
      });
      setIsPolling(false);
    }
  };

  const stopServiceWorker = () => {
    stopPolling();
  };

  const handleServiceWorkerMessage = (event) => {
    const { type, newMessages, allMessages } = event.data;
    
    if (type === 'NEW_MESSAGES') {
      // console.log('New messages received from service worker:', newMessages);
      // Append only new messages to existing messages
      setMessages(prevMessages => {
        const existingIds = new Set(prevMessages.map(msg => msg.id));
        const messagesToAdd = newMessages.filter(msg => !existingIds.has(msg.id));
        return [...prevMessages, ...messagesToAdd];
      });
    }
  };

  const loadMessages = async () => {
    try {
      setLoading(true);
      
      if (!token) {
        setError('Authentication required');
        return;
      }

      const authToken = `Bearer ${token}`;
      
      const response = await apiClient.get('/chat/messages');
      
      const newMessages = response.data || [];
      // console.log('Initial messages loaded:', newMessages);
      
      setMessages(newMessages);
      setError(null);
    } catch (err) {
      console.error('Error loading messages:', err);
      
      if (err.response?.status === 401) {
        setError('Authentication failed. Please log in again.');
      } else {
        setError('Failed to load messages');
      }
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    try {
      setSending(true);
      // const token = localStorage.getItem('token');
      if (!token) {
        setError('Authentication required');
        return;
      }

      // Simple Bearer token with space
      const authToken = `Bearer ${token}`;
      
      const response = await apiClient.post('/chat/send', 
        { message: newMessage.trim() }
      );

      // Add the new message to the list (bottom-up approach)
      const updatedMessages = [...messages, response.data];
      setMessages(updatedMessages);
      
      // Update service worker with new message
      if (navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({
          type: 'ADD_MESSAGE',
          data: { message: response.data }
        });
      }
      
      setNewMessage('');
      setError(null);
    } catch (err) {
      console.error('Error sending message:', err);
      if (err.response?.status === 401) {
        setError('Authentication failed. Please log in again.');
      } else {
        setError('Failed to send message');
      }
    } finally {
      setSending(false);
    }
  };

  const clearAllMessages = async () => {
    if (!window.confirm('Are you sure you want to clear all messages? This action cannot be undone.')) {
      return;
    }

    try {
      // const token = localStorage.getItem('token');
      if (!token) {
        setError('Authentication required');
        return;
      }

      // Simple Bearer token with space
      const authToken = `Bearer ${token}`;
      
      await apiClient.delete('/chat/messages/clear');

      setMessages([]);
      
      // Update service worker when clearing messages
      if (navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({
          type: 'CLEAR_MESSAGES'
        });
      }
      
      setError(null);
    } catch (err) {
      console.error('Error clearing messages:', err);
      if (err.response?.status === 401) {
        setError('Authentication failed. Please log in again.');
      } else if (err.response?.status === 403) {
        setError('You do not have permission to clear messages');
      } else {
        setError('Failed to clear messages');
      }
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 168) { // 7 days
      return date.toLocaleDateString([], { weekday: 'short' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  const isOwnMessage = (message) => {
    const isOwn = message.username === user.name || message.username === user.username;
    // console.log('Message ownership check:', {
    //   messageUsername: message.username,
    //   userName: user.name,
    //   userUsername: user.username,
    //   isOwn: isOwn
    // });
    return isOwn;
  };

  // Sort messages by timestamp (oldest first, newest last)
  const sortedMessages = [...messages].sort((a, b) => {
    const dateA = new Date(a.sentAt);
    const dateB = new Date(b.sentAt);
    return dateA - dateB;
  });

  const MessageBubble = ({ message, isOwn }) => (
    <div
      className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-4`}
    >
      <div className={`flex ${isOwn ? 'flex-row-reverse' : 'flex-row'} items-end max-w-[85%]`}>
        {!isOwn && (
          <Avatar 
            className="w-8 h-8 mr-2 mb-1"
            sx={{
              background: '#1976d2'
            }}
          >
            {message.username?.charAt(0)?.toUpperCase()}
          </Avatar>
        )}
        
        <div className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'}`}>
          <Paper
            elevation={1}
            sx={{
              background: isOwn ? '#1976d2' : '#f5f5f5',
              color: isOwn ? '#FFFFFF' : '#000000',
              padding: '8px 12px',
              borderRadius: '12px',
              width: 'fit-content',
              minWidth: '120px',
              maxWidth: '90%',
              wordWrap: 'break-word'
            }}
          >
            <Typography 
              variant="body2" 
              className="whitespace-pre-wrap"
              sx={{
                fontSize: '0.875rem',
                lineHeight: 1.4
              }}
            >
              {message.message}
            </Typography>
          </Paper>
          
          <div className={`flex items-center mt-1 ${isOwn ? 'justify-end' : 'justify-start'}`}>
            <Typography 
              variant="caption" 
              sx={{ 
                color: '#6c757d',
                fontSize: '0.75rem'
              }}
            >
              {formatTime(message.sentAt)}
            </Typography>
            {!isOwn && (
              <Typography 
                variant="caption" 
                sx={{ 
                  color: '#6c757d',
                  fontSize: '0.75rem',
                  marginLeft: '8px'
                }}
              >
                {message.username}
              </Typography>
            )}
          </div>
        </div>
        
        {isOwn && (
          <Avatar 
            src={user?.avatar} 
            className="w-8 h-8 ml-2 mb-1"
            sx={{
              background: '#ff6b6b'
            }}
          >
            {user?.name?.charAt(0)?.toUpperCase() || user?.username?.charAt(0)?.toUpperCase()}
          </Avatar>
        )}
      </div>
    </div>
  );

  return (
    <Paper 
      elevation={2} 
      className="w-full h-full flex flex-col overflow-hidden"
      sx={{
        background: '#ffffff',
        borderRadius: '8px',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        height: '100%'
      }}
    >
      {/* Chat Header */}
      <Box 
        className="p-4 border-b border-gray-200"
        sx={{
          background: '#f8f9fa',
          borderBottom: '1px solid #e9ecef',
          position: 'relative',
          zIndex: 1
        }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <Typography 
              variant="h6" 
              className="font-medium text-gray-900"
              sx={{
                fontSize: '1.25rem'
              }}
            >
              Team Chat
            </Typography>
          </div>
          <div className="flex items-center space-x-2">
            <IconButton 
              size="small" 
              onClick={loadMessages}
              disabled={loading}
              sx={{
                color: '#6c757d',
                '&:hover': {
                  background: '#e9ecef'
                },
                '&:disabled': {
                  opacity: 0.5
                }
              }}
            >
              <Refresh fontSize="small" />
            </IconButton>
            {user?.role === 'ADMIN' && (
              <IconButton 
                size="small" 
                onClick={clearAllMessages}
                sx={{
                  color: '#6c757d',
                  '&:hover': {
                    background: '#e9ecef'
                  }
                }}
                title="Clear all messages (Admin only)"
              >
                <Clear fontSize="small" />
              </IconButton>
            )}
          </div>
        </div>
      </Box>

      {/* Messages Area */}
      <Box 
        className="flex-1 p-4 overflow-y-auto"
        sx={{
          background: '#ffffff',
          position: 'relative',
          flex: '1 1 0%',
          minHeight: 0,
          '&::-webkit-scrollbar': {
            width: '8px'
          },
          '&::-webkit-scrollbar-track': {
            background: '#f1f3f4'
          },
          '&::-webkit-scrollbar-thumb': {
            background: '#dadce0',
            borderRadius: '4px',
            '&:hover': {
              background: '#bdc1c6'
            }
          }
        }}
      >
        {error && (
          <Alert 
            severity="error" 
            className="mb-4" 
            onClose={() => setError(null)}
          >
            {error}
          </Alert>
        )}

                  {loading ? (
            <Box className="flex justify-center items-center h-32">
              <CircularProgress 
                sx={{
                  color: '#1976d2',
                  '& .MuiCircularProgress-circle': {
                    strokeLinecap: 'round'
                  }
                }}
              />
            </Box>
          ) : (
          <>
            {sortedMessages.map((message) => (
              <MessageBubble
                key={message.id}
                message={message}
                isOwn={isOwnMessage(message)}
              />
            ))}
            
            {messages.length === 0 && !loading && (
              <Box 
                className="flex flex-col items-center justify-center h-32"
                sx={{ color: '#6c757d' }}
              >
                <div className="text-4xl mb-4">💬</div>
                <Typography 
                  variant="h6" 
                  className="mb-2 font-medium"
                  sx={{ color: '#495057' }}
                >
                  No messages yet
                </Typography>
                <Typography 
                  variant="body2"
                  sx={{ color: '#6c757d' }}
                >
                  Start the conversation!
                </Typography>
              </Box>
            )}
            
            <div ref={messagesEndRef} />
          </>
        )}
      </Box>

      {/* Input Area */}
      <Box 
        className="p-4 border-t border-gray-200"
        sx={{
          background: '#f8f9fa',
          borderTop: '1px solid #e9ecef',
          position: 'relative',
          zIndex: 1
        }}
      >
        <div className="flex items-end space-x-3">
                      <TextField
              fullWidth
              multiline
              maxRows={3}
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              variant="outlined"
              size="small"
              disabled={sending}
              className="flex-1"
            />
          
          <IconButton 
            onClick={sendMessage}
            disabled={!newMessage.trim() || sending}
            sx={{
              background: newMessage.trim() && !sending ? '#1976d2' : '#e9ecef',
              color: newMessage.trim() && !sending ? 'white' : '#6c757d',
              '&:hover': {
                background: newMessage.trim() && !sending ? '#1565c0' : '#dee2e6'
              },
              '&:disabled': {
                opacity: 0.5
              }
            }}
          >
            {sending ? (
              <CircularProgress 
                size={20} 
                sx={{ color: 'white' }}
              />
            ) : (
              <Send />
            )}
          </IconButton>
        </div>
      </Box>
    </Paper>
  );
};

export default SimpleChatBox; 