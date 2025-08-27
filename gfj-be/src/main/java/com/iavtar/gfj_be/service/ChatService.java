package com.iavtar.gfj_be.service;

import com.iavtar.gfj_be.model.request.MessageRequest;
import com.iavtar.gfj_be.model.response.MessageResponse;

import java.util.List;

/**
 * Service interface for chat operations.
 */
public interface ChatService {

    /**
     * Send a message from a user.
     * 
     * @param username The username of the sender
     * @param request The message request
     * @return The created message response
     */
    MessageResponse sendMessage(String username, MessageRequest request);

    /**
     * Get all messages ordered by sent time (newest first).
     * 
     * @return List of all messages
     */
    List<MessageResponse> getAllMessages();

    /**
     * Get recent messages (last 50).
     * 
     * @return List of recent messages
     */
    List<MessageResponse> getRecentMessages();

    /**
     * Get messages by username.
     * 
     * @param username The username to search for
     * @return List of messages from the specified user
     */
    List<MessageResponse> getMessagesByUsername(String username);
} 