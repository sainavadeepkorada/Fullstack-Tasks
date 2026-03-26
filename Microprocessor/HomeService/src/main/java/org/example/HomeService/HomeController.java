package org.example.HomeService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class HomeController {
	@GetMapping("/home")
	public String HomeService() {
		return "home page";
	}

}
