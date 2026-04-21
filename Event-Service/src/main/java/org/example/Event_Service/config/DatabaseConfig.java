package org.example.Event_Service.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import org.example.Event_Service.repository.EventRepository;
import org.example.Event_Service.repository.UserRepository;

@Component
public class DatabaseConfig implements CommandLineRunner {
    
    @Autowired
    private EventRepository eventRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @Override
    public void run(String... args) throws Exception {
        System.out.println("========================================");
        System.out.println("DATABASE CONNECTION TEST");
        System.out.println("========================================");
        
        long eventCount = eventRepository.count();
        long userCount = userRepository.count();
        
        System.out.println("Total Events in Database: " + eventCount);
        System.out.println("Total Users in Database: " + userCount);
        
        if (eventCount > 0) {
            System.out.println("\nEvents found:");
            eventRepository.findAll().forEach(event -> {
                System.out.println("  - " + event.getTitle() + " | " + event.getEventDate());
            });
        } else {
            System.out.println("\nWARNING: No events found in database!");
            System.out.println("Please insert events using MySQL Workbench");
        }
        
        System.out.println("========================================");
    }
}