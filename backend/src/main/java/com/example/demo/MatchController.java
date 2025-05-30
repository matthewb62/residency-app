package com.example.demo;

import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@CrossOrigin(origins = "http://localhost:3000")
public class MatchController {

    @PostMapping("/match")
    public List<String> runMatching(@RequestBody StudentSubmission submission) {
        // 🧠 Simple mocked matching logic for now
        System.out.println("Received submission from: " + submission.name);

        // Mock result — you can replace this with Gale-Shapley later
        return List.of("Stripe", "Amazon", "WrxFlo");
    }
}

