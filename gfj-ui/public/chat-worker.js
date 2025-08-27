// Chat Service Worker for message polling
let currentMessages = [];
let lastMessageIds = new Set();
let isPolling = false;

// Function to compare messages and find new ones
function findNewMessages(newMessages) {
  const newMessageIds = new Set(newMessages.map(msg => msg.id));
  const currentMessageIds = new Set(currentMessages.map(msg => msg.id));
  
  // Find messages that exist in newMessages but not in currentMessages
  const newMessagesOnly = newMessages.filter(msg => !currentMessageIds.has(msg.id));
  
  return {
    hasNewMessages: newMessagesOnly.length > 0,
    newMessages: newMessagesOnly,
    allMessages: newMessages
  };
}

// Function to fetch messages from API
async function fetchMessages(token) {
  try {
    const response = await fetch('/api/chat/messages', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const messages = await response.json();
    return messages || [];
  } catch (error) {
    console.error('Service Worker: Error fetching messages:', error);
    return null;
  }
}

// Polling function
async function pollMessages(token) {
  if (isPolling) return;
  
  isPolling = true;
  
  try {
    const newMessages = await fetchMessages(token);
    
    if (newMessages !== null) {
      const result = findNewMessages(newMessages);
      
      if (result.hasNewMessages) {
        // Update current messages
        currentMessages = result.allMessages;
        
        // Send new messages to main thread
        self.clients.matchAll().then(clients => {
          clients.forEach(client => {
            client.postMessage({
              type: 'NEW_MESSAGES',
              newMessages: result.newMessages,
              allMessages: result.allMessages
            });
          });
        });
      }
    }
  } catch (error) {
    console.error('Service Worker: Polling error:', error);
  } finally {
    isPolling = false;
  }
}

// Handle messages from main thread
self.addEventListener('message', (event) => {
  const { type, data } = event.data;
  
  switch (type) {
    case 'START_POLLING':
      const { token, interval = 2000 } = data;
      currentMessages = data.currentMessages || [];
      
      // Start polling
      const pollInterval = setInterval(() => {
        pollMessages(token);
      }, interval);
      
      // Store interval ID for cleanup
      self.pollIntervalId = pollInterval;
      break;
      
    case 'STOP_POLLING':
      if (self.pollIntervalId) {
        clearInterval(self.pollIntervalId);
        self.pollIntervalId = null;
      }
      break;
      
    case 'UPDATE_MESSAGES':
      currentMessages = data.messages || [];
      break;
      
    case 'ADD_MESSAGE':
      currentMessages.push(data.message);
      break;
      
    case 'CLEAR_MESSAGES':
      currentMessages = [];
      break;
  }
});

// Handle service worker installation
self.addEventListener('install', (event) => {
  // console.log('Chat Service Worker installed');
  self.skipWaiting();
});

// Handle service worker activation
self.addEventListener('activate', (event) => {
  // console.log('Chat Service Worker activated');
  event.waitUntil(self.clients.claim());
}); 