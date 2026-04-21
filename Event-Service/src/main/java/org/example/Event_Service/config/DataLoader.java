package org.example.Event_Service.config;

import org.example.Event_Service.entity.Event;
import org.example.Event_Service.entity.User;
import org.example.Event_Service.repository.EventRepository;
import org.example.Event_Service.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class DataLoader implements CommandLineRunner {
    
    @Autowired
    private EventRepository eventRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @Override
    public void run(String... args) throws Exception {
        
        // Load sample users
        if (userRepository.count() == 0) {
            User admin = new User();
            admin.setUsername("admin");
            admin.setPassword("admin123");
            admin.setRole("ADMIN");
            admin.setEmail("admin@campus.edu");
            admin.setFullName("Administrator");
            userRepository.save(admin);
            
            User student = new User();
            student.setUsername("student");
            student.setPassword("student123");
            student.setRole("STUDENT");
            student.setEmail("student@campus.edu");
            student.setFullName("John Student");
            userRepository.save(student);
            
            System.out.println("✅ Users created - Username: admin/admin123, student/student123");
        } else {
            System.out.println("Users already exist in database");
        }
        
        // Load sample events
        if (eventRepository.count() == 0) {
            Event event1 = new Event();
            event1.setTitle("AI & Machine Learning Summit");
            event1.setDescription("Explore the latest in neural networks, LLMs, and real-world AI applications.");
            event1.setEventDate("Apr 22, 2026");
            event1.setLocation("Auditorium A");
            event1.setTag("Tech");
            event1.setAccentColor("#378ADD");
            eventRepository.save(event1);
            
            Event event2 = new Event();
            event2.setTitle("Spring Cultural Fest");
            event2.setDescription("Celebrate diversity with dance, food, music and art installations.");
            event2.setEventDate("Apr 25, 2026");
            event2.setLocation("Central Quad");
            event2.setTag("Cultural");
            event2.setAccentColor("#D4537E");
            eventRepository.save(event2);
            
            Event event3 = new Event();
            event3.setTitle("Hackathon 2026");
            event3.setDescription("48-hour build sprint - form a team and ship something remarkable.");
            event3.setEventDate("Apr 26, 2026");
            event3.setLocation("Innovation Lab");
            event3.setTag("Tech");
            event3.setAccentColor("#1D9E75");
            eventRepository.save(event3);
            
            Event event4 = new Event();
            event4.setTitle("Yoga & Mindfulness Morning");
            event4.setDescription("Guided session for stress management and mental wellness.");
            event4.setEventDate("Apr 28, 2026");
            event4.setLocation("Lawn B");
            event4.setTag("Social");
            event4.setAccentColor("#EF9F27");
            eventRepository.save(event4);
            
            Event event5 = new Event();
            event5.setTitle("Entrepreneurship Panel");
            event5.setDescription("Alumni founders share their journeys from campus to startups.");
            event5.setEventDate("Apr 30, 2026");
            event5.setLocation("Seminar Hall 2");
            event5.setTag("Workshop");
            event5.setAccentColor("#7C5CBF");
            eventRepository.save(event5);
            
            Event event6 = new Event();
            event6.setTitle("Inter-College Cricket Finals");
            event6.setDescription("Top 8 squads compete for the Founders' Cup trophy.");
            event6.setEventDate("May 2, 2026");
            event6.setLocation("Sports Ground");
            event6.setTag("Sports");
            event6.setAccentColor("#E24B4A");
            eventRepository.save(event6);
            
            System.out.println("✅ 6 sample events created!");
        } else {
            System.out.println("Events already exist in database");
        }
    }
}