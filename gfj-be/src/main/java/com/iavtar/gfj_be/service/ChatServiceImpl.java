package com.iavtar.gfj_be.service;

import com.iavtar.gfj_be.entity.ChatMessage;
import com.iavtar.gfj_be.model.request.MessageRequest;
import com.iavtar.gfj_be.model.response.MessageResponse;
import com.iavtar.gfj_be.repository.ChatMessageRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * Implementation of ChatService for handling chat operations.
 */
@Service
@Slf4j
public class ChatServiceImpl implements ChatService {

    @Autowired
    private ChatMessageRepository chatMessageRepository;

    @Override
    public MessageResponse sendMessage(String username, MessageRequest request) {
        log.info("Sending message from user: {}", username);
        
        var chatMessage = new ChatMessage(username, request.message());
        var savedMessage = chatMessageRepository.save(chatMessage);
        
        log.info("Message saved with ID: {}", savedMessage.getId());
        
        return new MessageResponse(
            savedMessage.getId(),
            savedMessage.getUsername(),
            savedMessage.getMessage(),
            savedMessage.getSentAt()
        );
    }

    @Override
    public List<MessageResponse> getAllMessages() {
        log.info("Retrieving all messages");
        
        var messages = chatMessageRepository.findAllOrderBySentAtDesc();
        
        return messages.stream()
            .map(this::convertToResponse)
            .toList();
    }

    @Override
    public List<MessageResponse> getRecentMessages() {
        log.info("Retrieving recent messages");
        
        var messages = chatMessageRepository.findRecentMessages();
        
        return messages.stream()
            .map(this::convertToResponse)
            .toList();
    }

    @Override
    public List<MessageResponse> getMessagesByUsername(String username) {
        log.info("Retrieving messages for user: {}", username);
        
        var messages = chatMessageRepository.findByUsernameOrderBySentAtDesc(username);
        
        return messages.stream()
            .map(this::convertToResponse)
            .toList();
    }

    /**
     * Convert ChatMessage entity to MessageResponse DTO.
     * 
     * @param chatMessage The chat message entity
     * @return The message response DTO
     */
    private MessageResponse convertToResponse(ChatMessage chatMessage) {
        return new MessageResponse(
            chatMessage.getId(),
            chatMessage.getUsername(),
            chatMessage.getMessage(),
            chatMessage.getSentAt()
        );
    }
} 