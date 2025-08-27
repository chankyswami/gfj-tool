package com.iavtar.gfj_be.model.response;

import java.time.LocalDateTime;

/**
 * Response DTO for chat message data.
 */
public record MessageResponse(Long id, String username, String message, LocalDateTime sentAt) {
} 