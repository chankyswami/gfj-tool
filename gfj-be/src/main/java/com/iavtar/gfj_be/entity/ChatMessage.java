package com.iavtar.gfj_be.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDateTime;

/**
 * Entity representing a chat message in the system.
 * This is a simplified version that only stores username and message content.
 */
@Entity
@Table(name = "chat_messages")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ChatMessage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "username", nullable = false)
    private String username;

    @Column(name = "message", nullable = false, columnDefinition = "TEXT")
    private String message;

    @Column(name = "sent_at", nullable = false)
    private LocalDateTime sentAt;

    /**
     * Constructor with username and message.
     * Automatically sets the sent time to current time.
     * 
     * @param username The username of the message sender
     * @param message The message content
     */
    public ChatMessage(String username, String message) {
        this.username = username;
        this.message = message;
        this.sentAt = LocalDateTime.now();
    }
} 