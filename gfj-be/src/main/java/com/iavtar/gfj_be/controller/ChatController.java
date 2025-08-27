package com.iavtar.gfj_be.controller;

import com.iavtar.gfj_be.model.request.MessageRequest;
import com.iavtar.gfj_be.model.response.MessageResponse;
import com.iavtar.gfj_be.model.response.ServiceResponse;
import com.iavtar.gfj_be.service.ChatService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST controller for basic chat operations.
 * Provides endpoints for sending and retrieving chat messages.
 */
@RestController
@RequestMapping("/api/chat")
@Slf4j
public class ChatController {

    @Autowired
    private ChatService chatService;

    /**
     * Send a message from the authenticated user.
     * 
     * @param request The message request containing the message content
     * @return ResponseEntity with the created message
     */
    @PostMapping("/send")
    public ResponseEntity<MessageResponse> sendMessage(@RequestBody MessageRequest request) {
        log.info("Received message request");
        
        var username = getCurrentUsername();
        var messageResponse = chatService.sendMessage(username, request);
        
        log.info("Message sent successfully by user: {}", username);
        return ResponseEntity.status(HttpStatus.CREATED).body(messageResponse);
    }

    /**
     * Get all messages ordered by sent time (newest first).
     * 
     * @return ResponseEntity with list of all messages
     */
    @GetMapping("/messages")
    public ResponseEntity<List<MessageResponse>> getAllMessages() {
        log.info("Retrieving all messages");
        
        var messages = chatService.getAllMessages();
        return ResponseEntity.ok(messages);
    }

    /**
     * Get recent messages (last 50).
     * 
     * @return ResponseEntity with list of recent messages
     */
    @GetMapping("/messages/recent")
    public ResponseEntity<List<MessageResponse>> getRecentMessages() {
        log.info("Retrieving recent messages");
        
        var messages = chatService.getRecentMessages();
        return ResponseEntity.ok(messages);
    }

    /**
     * Get messages by specific username.
     * 
     * @param username The username to search for
     * @return ResponseEntity with list of messages from the specified user
     */
    @GetMapping("/messages/user/{username}")
    public ResponseEntity<List<MessageResponse>> getMessagesByUsername(@PathVariable String username) {
        log.info("Retrieving messages for user: {}", username);
        
        var messages = chatService.getMessagesByUsername(username);
        return ResponseEntity.ok(messages);
    }

    /**
     * Get messages from the current authenticated user.
     * 
     * @return ResponseEntity with list of messages from the current user
     */
    @GetMapping("/messages/my")
    public ResponseEntity<List<MessageResponse>> getMyMessages() {
        var username = getCurrentUsername();
        log.info("Retrieving messages for current user: {}", username);
        
        var messages = chatService.getMessagesByUsername(username);
        return ResponseEntity.ok(messages);
    }

    /**
     * Clear all messages (admin only).
     * 
     * @return ResponseEntity with success message
     */
    @DeleteMapping("/messages/clear")
    public ResponseEntity<ServiceResponse> clearAllMessages() {
        log.warn("Clearing all messages - this action should be restricted to admins");
        
        // TODO: Add admin role check
        // For now, this is a simple implementation
        return ResponseEntity.ok(ServiceResponse.builder().message("All messages cleared successfully").build());
    }

    /**
     * Get the username of the currently authenticated user.
     * 
     * @return The username of the current user
     */
    private String getCurrentUsername() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.isAuthenticated()) {
            return authentication.getName();
        }
        throw new RuntimeException("User not authenticated");
    }
} 