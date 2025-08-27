package com.iavtar.gfj_be.repository;

import com.iavtar.gfj_be.entity.ChatMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Repository interface for ChatMessage entity operations.
 */
@Repository
public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {

    /**
     * Find all messages ordered by sent time (newest first).
     * 
     * @return List of messages ordered by sent time descending
     */
    @Query("SELECT m FROM ChatMessage m ORDER BY m.sentAt DESC")
    List<ChatMessage> findAllOrderBySentAtDesc();

    /**
     * Find messages by username ordered by sent time (newest first).
     * 
     * @param username The username to search for
     * @return List of messages from the specified user
     */
    @Query("SELECT m FROM ChatMessage m WHERE m.username = ?1 ORDER BY m.sentAt DESC")
    List<ChatMessage> findByUsernameOrderBySentAtDesc(String username);

    /**
     * Find recent messages (last 50) ordered by sent time (newest first).
     * 
     * @return List of recent messages
     */
    @Query("SELECT m FROM ChatMessage m ORDER BY m.sentAt DESC LIMIT 50")
    List<ChatMessage> findRecentMessages();
} 