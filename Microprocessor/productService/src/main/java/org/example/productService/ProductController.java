package org.example.productService;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class ProductController {
	
	
	@GetMapping("hi")
	public String mtd() {
		return "Hi welcome";
	}

}
