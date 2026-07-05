package com.shopacc.backend.service;

import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final SimpMessagingTemplate messagingTemplate;

    /**
     * Push balance update to a specific user via WebSocket.
     */
    public void pushBalance(Long userId, Map<String, Object> data) {
        messagingTemplate.convertAndSend("/topic/user/" + userId + "/balance", data);
    }
}
