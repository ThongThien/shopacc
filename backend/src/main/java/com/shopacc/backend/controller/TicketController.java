package com.shopacc.backend.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.shopacc.backend.entity.Ticket;
import com.shopacc.backend.repository.TicketRepository;
import com.shopacc.backend.security.CustomUserDetails;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.*;

@RestController
@RequestMapping("/api/tickets")
@RequiredArgsConstructor
public class TicketController {

    private final TicketRepository ticketRepository;
    private final ObjectMapper objectMapper;

    public static class AddMessageRequest {
        public String text;
    }

    @GetMapping
    public List<Ticket> getMyTickets(
                    @AuthenticationPrincipal CustomUserDetails userDetails) {
        return ticketRepository.findByUserIdOrderByUpdatedAtDesc(userDetails.getId());
    }

    @GetMapping("/admin")
    @PreAuthorize("hasRole('ADMIN')")
    public List<Ticket> getAllTickets() {
        return ticketRepository.findAllByOrderByUpdatedAtDesc();
    }

    @PostMapping
    public Ticket createTicket(
                    @AuthenticationPrincipal CustomUserDetails userDetails,
                    @RequestBody Ticket ticket) {

        ticket.setUserId(userDetails.getId());
        ticket.setStatus("OPEN");
        ticket.setLastReplyByAdmin(false);
        ticket.setCreatedAt(LocalDateTime.now());
        ticket.setUpdatedAt(LocalDateTime.now());

        // Store first message wrapped in array
        String messageJson = buildMessage(
                        userDetails.getId(),
                        userDetails.getUsername(),
                        false,
                        ticket.getSubject(),
                        LocalDateTime.now());
        ticket.setMessages("[" + messageJson + "]");

        return ticketRepository.save(ticket);
    }

    @PostMapping("/{id}/reply")
    public Ticket replyTicket(
                    @PathVariable Long id,
                    @RequestBody AddMessageRequest request,
                    @AuthenticationPrincipal CustomUserDetails userDetails) {

        Ticket ticket = ticketRepository.findById(id)
                        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));

        boolean isAdmin = userDetails.getAuthorities().stream()
                        .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));

        String messageJson = buildMessage(
                        userDetails.getId(),
                        userDetails.getUsername(),
                        isAdmin,
                        request.text,
                        LocalDateTime.now());

        String existing = ticket.getMessages();
        String updated;
        try {
            @SuppressWarnings("unchecked")
            List<Object> list = objectMapper.readValue(existing != null ? existing : "[]", List.class);
            list.add(objectMapper.readValue(messageJson, Map.class));
            updated = objectMapper.writeValueAsString(list);
        } catch (Exception e) {
            updated = "[" + messageJson + "]";
        }

        ticket.setMessages(updated);
        ticket.setLastReplyByAdmin(isAdmin);
        ticket.setUpdatedAt(LocalDateTime.now());

        return ticketRepository.save(ticket);
    }

    @PatchMapping("/{id}/close")
    public Ticket closeTicket(@PathVariable Long id) {
        Ticket ticket = ticketRepository.findById(id)
                        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
        ticket.setStatus("CLOSED");
        ticket.setUpdatedAt(LocalDateTime.now());
        return ticketRepository.save(ticket);
    }

    @PatchMapping("/{id}/open")
    public Ticket openTicket(@PathVariable Long id) {
        Ticket ticket = ticketRepository.findById(id)
                        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
        ticket.setStatus("OPEN");
        ticket.setUpdatedAt(LocalDateTime.now());
        return ticketRepository.save(ticket);
    }

    private String buildMessage(Long userId, String username, boolean isAdmin, String text, LocalDateTime time) {
        try {
            Map<String, Object> msg = new LinkedHashMap<>();
            msg.put("userId", userId);
            msg.put("username", username);
            msg.put("isAdmin", isAdmin);
            msg.put("text", text);
            msg.put("createdAt", time.toString());
            return objectMapper.writeValueAsString(msg);
        } catch (Exception e) {
            return "{}";
        }
    }
}
