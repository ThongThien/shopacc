package com.shopacc.backend.repository;

import com.shopacc.backend.entity.Ticket;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface TicketRepository extends JpaRepository<Ticket, Long> {
    List<Ticket> findByUserIdOrderByUpdatedAtDesc(Long userId);
    List<Ticket> findAllByOrderByUpdatedAtDesc();
}
