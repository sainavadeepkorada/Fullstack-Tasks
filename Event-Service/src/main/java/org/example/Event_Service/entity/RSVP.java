package org.example.Event_Service.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "rsvps")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class RSVP {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "user_id", nullable = false)
    private Long userId;
    
    @Column(name = "event_id", nullable = false)
    private Long eventId;
    
    @Column(name = "rsvp_date")
    private LocalDateTime rsvpDate;
    
    public RSVP(Long userId, Long eventId) {
        this.userId = userId;
        this.eventId = eventId;
        this.rsvpDate = LocalDateTime.now();
    }
}