package org.example.Event_Service.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Entity
@Table(name = "events")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Event {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private String title;
    
    @Column(length = 1000)
    private String description;
    
    private String eventDate;
    private String location;
    private String tag;
    private String accentColor;
    
    // Transient fields - not stored in database
    @Transient
    private Integer rsvpCount = 0;
    
    @Transient
    private Boolean isRsvped = false;
}