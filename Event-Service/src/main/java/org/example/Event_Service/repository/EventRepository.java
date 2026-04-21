
package org.example.Event_Service.repository;
import java.util.List;

import org.example.Event_Service.entity.Event;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository

public interface EventRepository extends JpaRepository<Event, Long> {
	List<Event> findByTag(String tag);
	List<Event> findAllByOrderByIdDesc();	
}
