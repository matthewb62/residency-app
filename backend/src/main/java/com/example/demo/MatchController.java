package com.example.demo;

import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.util.*;
import java.util.stream.Collectors;

@RestController
public class MatchController {

    private final WebClient webClient;
    private final String supabaseUrl = "https://skavheoivhbrtddpvkog.supabase.co";
    private final String supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNrYXZoZW9pdmhicnRkZHB2a29nIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0ODUyNDA5MywiZXhwIjoyMDY0MTAwMDkzfQ.sJsDV8OiYUe1T75g_gUfk_Brvbw-R3vrvWf46hc0tfQ";

    public MatchController() {
        this.webClient = WebClient.builder()
                .baseUrl(supabaseUrl)
                .defaultHeader("apikey", supabaseKey)
                .defaultHeader(HttpHeaders.AUTHORIZATION, "Bearer " + supabaseKey)
                .defaultHeader(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                .build();
    }

    @GetMapping("/run-matching")
    public String runMatching() {
        List<StudentRanking> rankings = fetchStudentRankings();

        // Placeholder matching logic - sort and assign top company to each student
        Map<String, String> matches = new HashMap<>();
        rankings.stream()
                .collect(Collectors.groupingBy(r -> r.student_email))
                .forEach((email, list) -> {
                    list.sort(Comparator.comparingInt(r -> r.ranking));
                    matches.put(email, list.get(0).company_id);
                });

        // Prepare JSON for Supabase insert
        List<Map<String, String>> matchResults = new ArrayList<>();
        for (Map.Entry<String, String> entry : matches.entrySet()) {
            Map<String, String> record = new HashMap<>();
            record.put("student_email", entry.getKey());
            record.put("company_id", entry.getValue());
            matchResults.add(record);
        }

        webClient.post()
                .uri("/rest/v1/matches")
                .body(Mono.just(matchResults), List.class)
                .retrieve()
                .bodyToMono(String.class)
                .subscribe(response -> System.out.println("Insert Response: " + response));

        return "Matching completed";
    }

    private List<StudentRanking> fetchStudentRankings() {
        try {
            StudentRanking[] response = webClient.get()
                    .uri("/rest/v1/student_rankings?select=*")
                    .retrieve()
                    .bodyToMono(StudentRanking[].class)
                    .block();

            return Arrays.asList(Objects.requireNonNull(response));
        } catch (Exception e) {
            e.printStackTrace();
            return new ArrayList<>();
        }
    }
}