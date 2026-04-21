package org.example.Event_Service.repository;

import org.example.Event_Service.entity.RSVP;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface RSVPRepository extends JpaRepository<RSVP, Long> {
    
    // Find RSVP by user and event
    Optional<RSVP> findByUserIdAndEventId(Long userId, Long eventId);
    
    // Get all RSVPs for a user
    List<RSVP> findByUserId(Long userId);
    
    // Get all RSVPs for an event
    List<RSVP> findByEventId(Long eventId);
    
    // Count RSVPs for an event
    @Query("SELECT COUNT(r) FROM RSVP r WHERE r.eventId = :eventId")
    Long countByEventId(@Param("eventId") Long eventId);
    
    // Delete RSVP by user and event
    void deleteByUserIdAndEventId(Long userId, Long eventId);
}