package com.example.demo;

import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.util.*;

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

    private List<Ranking> fetchAllRankings() {
        try {
            Ranking[] response = webClient.get()
                    .uri("/rest/v1/rankings?select=*")
                    .retrieve()
                    .bodyToMono(Ranking[].class)
                    .block();

            return Arrays.asList(Objects.requireNonNull(response));
        } catch (Exception e) {
            e.printStackTrace();
            return new ArrayList<>();
        }
    }

    @PostMapping("/run-matching")
    public String runMatching() {
        List<Ranking> allRankings = fetchAllRankings();
        List<StudentAccount> studentAccounts = fetchStudentAccounts();
        List<CompanyPosition> companyPositions = fetchCompanyPositions();

        Map<String, Double> qcaMap = new HashMap<>();
        double minQCA = studentAccounts.stream().mapToDouble(s -> s.QCA).min().orElse(0);
        double maxQCA = studentAccounts.stream().mapToDouble(s -> s.QCA).max().orElse(1);
        for (StudentAccount sa : studentAccounts) {
            double normalized = (sa.QCA - minQCA) / (maxQCA - minQCA);
            qcaMap.put(sa.student_email, normalized);
        }

        Map<String, Map<String, Integer>> studentRankMap = new HashMap<>();
        Map<String, Map<String, Integer>> companyRankMap = new HashMap<>();
        for (Ranking r : allRankings) {
            if ("student".equals(r.ranked_by)) {
                studentRankMap.computeIfAbsent(r.student_email, k -> new HashMap<>())
                        .put(r.company_id, r.rank);
            } else if ("company".equals(r.ranked_by)) {
                companyRankMap.computeIfAbsent(r.company_id, k -> new HashMap<>())
                        .put(r.student_email, r.rank);
            }
        }

        List<MatchScore> allMatches = new ArrayList<>();
        for (String student : studentRankMap.keySet()) {
            for (String company : studentRankMap.get(student).keySet()) {
                if (!companyRankMap.containsKey(company) || !companyRankMap.get(company).containsKey(student)) {
                    continue;
                }

                int sRank = studentRankMap.get(student).get(company);
                int cRank = companyRankMap.get(company).get(student);

                double sScore = (10.0 - sRank + 1) / 10.0;
                double cScore = (10.0 - cRank + 1) / 10.0;
                double qcaScore = qcaMap.getOrDefault(student, 0.0);

                double score = 0.2 * qcaScore + 0.2 * sScore + 0.6 * cScore;

                allMatches.add(new MatchScore(student, company, score));
            }
        }

        allMatches.sort((a, b) -> Double.compare(b.score, a.score));

        Map<String, String> finalMatches = new HashMap<>();
        Map<String, Integer> companyAssigned = new HashMap<>();
        Map<String, Integer> companyCapacity = new HashMap<>();
        for (CompanyPosition cp : companyPositions) {
            companyCapacity.put(cp.company_id, cp.num_positions);
        }

        for (MatchScore match : allMatches) {
            if (finalMatches.containsKey(match.student_email)) continue;
            int assigned = companyAssigned.getOrDefault(match.company_id, 0);
            int capacity = companyCapacity.getOrDefault(match.company_id, 1);

            if (assigned < capacity) {
                finalMatches.put(match.student_email, match.company_id);
                companyAssigned.put(match.company_id, assigned + 1);
            }
        }

        webClient.delete()
                .uri(uriBuilder -> uriBuilder.path("/rest/v1/matches")
                        .queryParam("student_email", "neq.null").build())
                .retrieve()
                .bodyToMono(String.class)
                .block();

        List<Map<String, String>> results = new ArrayList<>();
        for (Map.Entry<String, String> e : finalMatches.entrySet()) {
            Map<String, String> record = new HashMap<>();
            record.put("student_email", e.getKey());
            record.put("company_id", e.getValue());
            results.add(record);
        }

        webClient.post()
                .uri("/rest/v1/matches")
                .body(Mono.just(results), List.class)
                .retrieve()
                .bodyToMono(String.class)
                .subscribe();

        return "Matching completed.";
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

    public static class MatchScore {
        String student_email;
        String company_id;
        double score;

        public MatchScore(String student_email, String company_id, double score) {
            this.student_email = student_email;
            this.company_id = company_id;
            this.score = score;
        }
    }
}
