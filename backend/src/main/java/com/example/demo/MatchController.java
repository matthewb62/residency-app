package com.example.demo;

import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.PostMapping;
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

    @PostMapping("/run-matching")
    public String runMatching() {
        List<StudentRanking> studentRankings = fetchStudentRankings();
        List<CompanyRanking> companyRankings = fetchCompanyRankings();
        List<StudentAccount> studentAccounts = fetchStudentAccounts();
        List<CompanyPosition> companyPositions = fetchCompanyPositions();

        Map<String, Integer> companyCapacity = new HashMap<>();
        for (CompanyPosition cp : companyPositions) {
            companyCapacity.put(cp.company_id, cp.num_positions);
        }

        Map<String, Integer> currentAssignments = new HashMap<>();

        Map<String, Double> qcaMap = new HashMap<>();
        double minQCA = studentAccounts.stream().mapToDouble(s -> s.QCA).min().orElse(0);
        double maxQCA = studentAccounts.stream().mapToDouble(s -> s.QCA).max().orElse(1);

        for (StudentAccount sa : studentAccounts) {
            double normalizedQCA = (sa.QCA - minQCA) / (maxQCA - minQCA);
            qcaMap.put(sa.student_email, normalizedQCA);
        }

        Map<String, Map<String, Integer>> studentRankMap = new HashMap<>();
        Map<String, Map<String, Integer>> companyRankMap = new HashMap<>();

        for (StudentRanking sr : studentRankings) {
            studentRankMap.computeIfAbsent(sr.student_email, k -> new HashMap<>()).put(sr.company_id, sr.ranking);
        }

        for (CompanyRanking cr : companyRankings) {
            companyRankMap.computeIfAbsent(cr.company_id, k -> new HashMap<>()).put(cr.student_email, cr.ranking);
        }

        Map<String, String> finalMatches = new HashMap<>();
        for (String student : studentRankMap.keySet()) {
            String bestCompany = null;
            double bestScore = -1;

            for (String company : studentRankMap.get(student).keySet()) {
                int sRank = studentRankMap.get(student).getOrDefault(company, 9999);
                int cRank = companyRankMap.getOrDefault(company, new HashMap<>()).getOrDefault(student, 9999);

                double studentScore = (sRank == 9999) ? 0 : (10.0 - sRank + 1) / 10.0;
                double companyScore = (cRank == 9999) ? 0 : (10.0 - cRank + 1) / 10.0;
                double qcaScore = qcaMap.getOrDefault(student, 0.0);

                double finalScore = 0.2 * qcaScore + 0.2 * studentScore + 0.6 * companyScore;

                int current = currentAssignments.getOrDefault(company, 0);
                int capacity = companyCapacity.getOrDefault(company, Integer.MAX_VALUE);

                if (finalScore > bestScore && current < capacity) {
                    bestScore = finalScore;
                    bestCompany = company;
                }
            }
            if (bestCompany != null) {
                finalMatches.put(student, bestCompany);
                currentAssignments.put(bestCompany, currentAssignments.getOrDefault(bestCompany, 0) + 1);
            }
        }

        webClient.delete()
                .uri(uriBuilder -> uriBuilder
                        .path("/rest/v1/matches")
                        .queryParam("student_email", "neq.null")
                        .build())
                .retrieve()
                .bodyToMono(String.class)
                .block();

        List<Map<String, String>> matchResults = new ArrayList<>();
        for (Map.Entry<String, String> entry : finalMatches.entrySet()) {
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

    private List<CompanyRanking> fetchCompanyRankings() {
        try {
            CompanyRanking[] response = webClient.get()
                    .uri("/rest/v1/company_rankings?select=*")
                    .retrieve()
                    .bodyToMono(CompanyRanking[].class)
                    .block();

            return Arrays.asList(Objects.requireNonNull(response));
        } catch (Exception e) {
            e.printStackTrace();
            return new ArrayList<>();
        }
    }

    private List<StudentAccount> fetchStudentAccounts() {
        try {
            StudentAccount[] response = webClient.get()
                    .uri("/rest/v1/student_account?select=student_email,QCA")
                    .retrieve()
                    .bodyToMono(StudentAccount[].class)
                    .block();

            return Arrays.asList(Objects.requireNonNull(response));
        } catch (Exception e) {
            e.printStackTrace();
            return new ArrayList<>();
        }
    }

    private List<CompanyPosition> fetchCompanyPositions() {
        try {
            CompanyPosition[] response = webClient.get()
                    .uri("/rest/v1/company_data?select=company_id,num_positions")
                    .retrieve()
                    .bodyToMono(CompanyPosition[].class)
                    .block();

            return Arrays.asList(Objects.requireNonNull(response));
        } catch (Exception e) {
            e.printStackTrace();
            return new ArrayList<>();
        }
    }
}