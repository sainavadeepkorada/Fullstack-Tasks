package org.example.Event_Service.controller;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.example.Event_Service.entity.Event;
import org.example.Event_Service.entity.RSVP;
import org.example.Event_Service.entity.User;
import org.example.Event_Service.repository.EventRepository;
import org.example.Event_Service.repository.RSVPRepository;
import org.example.Event_Service.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;

import jakarta.servlet.http.HttpSession;

@Controller
public class EventWebController {
    
    @Autowired 
    private EventRepository eventRepository;
    
    @Autowired 
    private UserRepository userRepository;
    
    @Autowired
    private RSVPRepository rsvpRepository;

    @GetMapping("/")
    public String root() {
        return "redirect:/login";
    }

    @GetMapping("/login")
    public String showLoginPage() {
        return "login";
    }

    @PostMapping("/login")
    public String handleLogin(@RequestParam String username, 
                              @RequestParam String password, 
                              Model model,
                              HttpSession session) {
        
        System.out.println("=== LOGIN ATTEMPT ===");
        System.out.println("Username: " + username);
        
        Optional<User> userOptional = userRepository.findByUsername(username);
        
        if (userOptional.isPresent()) {
            User user = userOptional.get();
            System.out.println("User found: " + user.getUsername());
            
            if (user.getPassword().equals(password)) {
                List<Event> allEvents = eventRepository.findAll();
                System.out.println("Total events found: " + allEvents.size());
                
                model.addAttribute("events", allEvents);
                model.addAttribute("user", user);
                session.setAttribute("loggedInUser", user);
                return "home";
            } else {
                System.out.println("Password incorrect");
                model.addAttribute("error", "Invalid Credentials");
                return "login";
            }
        } else {
            System.out.println("User not found: " + username);
            model.addAttribute("error", "User not found");
            return "login";
        }
    }
    
    @GetMapping("/home")
    public String showHomePage(Model model, HttpSession session) {
        System.out.println("=== HOME PAGE REQUESTED ===");
        
        if (session.getAttribute("loggedInUser") == null) {
            System.out.println("No user in session, redirecting to login");
            return "redirect:/login";
        }
        
        User user = (User) session.getAttribute("loggedInUser");
        System.out.println("User: " + user.getUsername());
        
        List<Event> allEvents = eventRepository.findAll();
        System.out.println("Total events in database: " + allEvents.size());
        
        model.addAttribute("events", allEvents);
        model.addAttribute("user", user);
        
        return "home";
    }
    
    // Get all events API
    @GetMapping("/api/events")
    @ResponseBody
    public List<Event> getEvents() {
        List<Event> events = eventRepository.findAll();
        System.out.println("API called - Returning " + events.size() + " events");
        
        // Add RSVP count for each event
        for (Event event : events) {
            Long count = rsvpRepository.countByEventId(event.getId());
            event.setRsvpCount(count != null ? count.intValue() : 0);
        }
        return events;
    }
    
    // Get user's RSVPs
    @GetMapping("/api/my-rsvps")
    @ResponseBody
    public List<Event> getMyRsvps(HttpSession session) {
        User user = (User) session.getAttribute("loggedInUser");
        if (user == null) return List.of();
        
        List<RSVP> userRSVPs = rsvpRepository.findByUserId(user.getId());
        List<Long> eventIds = userRSVPs.stream()
                                       .map(RSVP::getEventId)
                                       .collect(Collectors.toList());
        
        if (eventIds.isEmpty()) return List.of();
        return eventRepository.findAllById(eventIds);
    }
    
    // Toggle RSVP (Add or Remove)
    @PostMapping("/events/{eventId}/rsvp")
    @ResponseBody
    public String toggleRSVP(@PathVariable Long eventId, HttpSession session) {
        if (session.getAttribute("loggedInUser") == null) {
            return "Please login first";
        }
        
        User user = (User) session.getAttribute("loggedInUser");
        Optional<RSVP> existingRSVP = rsvpRepository.findByUserIdAndEventId(user.getId(), eventId);
        
        if (existingRSVP.isPresent()) {
            // Remove RSVP
            rsvpRepository.delete(existingRSVP.get());
            System.out.println("RSVP cancelled for event: " + eventId + " by user: " + user.getUsername());
            return "RSVP cancelled successfully";
        } else {
            // Add RSVP
            RSVP newRSVP = new RSVP(user.getId(), eventId);
            rsvpRepository.save(newRSVP);
            System.out.println("RSVP added for event: " + eventId + " by user: " + user.getUsername());
            return "RSVP added successfully";
        }
    }
    
    // Create event API
    @PostMapping("/api/events/create")
    @ResponseBody
    public Event createEventApi(@RequestBody Event event, HttpSession session) {
        User user = (User) session.getAttribute("loggedInUser");
        if (user == null || !"ADMIN".equals(user.getRole())) {
            throw new RuntimeException("Unauthorized - Only administrators can create events");
        }
        
        System.out.println("Creating new event: " + event.getTitle());
        Event savedEvent = eventRepository.save(event);
        System.out.println("Event saved with ID: " + savedEvent.getId());
        return savedEvent;
    }
    
    @GetMapping("/my-rsvps")
    public String showMyRsvps(Model model, HttpSession session) {
        if (session.getAttribute("loggedInUser") == null) {
            return "redirect:/login";
        }
        
        User user = (User) session.getAttribute("loggedInUser");
        model.addAttribute("user", user);
        return "home";
    }
    
    @GetMapping("/events/create")
    public String showCreateEvent(Model model, HttpSession session) {
        if (session.getAttribute("loggedInUser") == null) {
            return "redirect:/login";
        }
        
        User user = (User) session.getAttribute("loggedInUser");
        model.addAttribute("user", user);
        return "home";
    }
    
    @GetMapping("/logout")
    public String logout(HttpSession session) {
        session.invalidate();
        return "redirect:/login";
    }
    
    @GetMapping("/test")
    @ResponseBody
    public String test() {
        long eventCount = eventRepository.count();
        long userCount = userRepository.count();
        long rsvpCount = rsvpRepository.count();
        return "Application is working!\nEvents: " + eventCount + "\nUsers: " + userCount + "\nRSVPs: " + rsvpCount;
    }
}