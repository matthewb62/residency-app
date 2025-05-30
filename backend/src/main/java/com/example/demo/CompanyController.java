package com.example.demo;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.CrossOrigin;

import java.util.List;
import java.util.Map;

@RestController
@CrossOrigin(origins = "http://localhost:3000") // allow React dev server
public class CompanyController {

    @GetMapping("/companies")
    public List<Map<String, String>> getCompanies() {
        return List.of(
                Map.of("name", "Amazon", "sector", "Tech"),
                Map.of("name", "Pfizer", "sector", "Pharma"),
                Map.of("name", "Stripe", "sector", "FinTech")
        );
    }
}

