package com.example.demo.quiz;

import java.util.*;
import java.util.stream.Collectors;

public class MatchingEngine {

    public static List<MatchResult> getTopMatches(StudentPreference pref, List<ResidencyPosition> positions, int topN) {
        List<MatchResult> results = new ArrayList<>();

        // Determine min and max pay for normalization
        int minPay = positions.stream().mapToInt(p -> p.monthlyPay).min().orElse(0);
        int maxPay = positions.stream().mapToInt(p -> p.monthlyPay).max().orElse(1);

        for (ResidencyPosition pos : positions) {
            double score = 0.0;

            // Location
            String locKey = pos.getLocationKey();
            if (pref.locationRatings.containsKey(locKey)) {
                score += pref.locationRatings.get(locKey) * 3;
            }

            // Duration
            if (pref.durationPreference.equals("Open") || pref.durationPreference.equalsIgnoreCase(pos.duration)) {
                score += pref.durationPreference.equals("Open") ? 2 : 5;
            }

            // Sector
            if (pref.sectorRatings.containsKey(pos.sector)) {
                score += pref.sectorRatings.get(pos.sector) * 4;
            }

            // Company Size
            String size = pos.getCompanySizeCategory();
            if (pref.companySizeRatings.containsKey(size)) {
                score += pref.companySizeRatings.get(size) * 3;
            }

            // Tech Stack
            for (String tech : pref.topTechPreferences) {
                if (pos.tools.contains(tech)) {
                    score += 5;
                }
            }

            // Pay (normalize to 0–10)
            double normalizedPay = (pos.monthlyPay - minPay) / (double) (maxPay - minPay) * 10;
            score += normalizedPay * (pref.payImportanceRating / 5.0);

            //Remote
            if ("Fully Remote".equalsIgnoreCase(pos.locationType)) {
                score += pref.fullyRemoteRating * 3;
            }

            // Store result
            results.add(new MatchResult(pos, score));
        }

        // Sort and return top matches
        Set<String> seenCompanies = new HashSet<>();
        List<MatchResult> uniqueMatches = new ArrayList<>();
        Collections.sort(results);

        for (MatchResult match : results) {
            if (seenCompanies.add(match.position.companyName)) {
                uniqueMatches.add(match);
            }
            if (uniqueMatches.size() == topN) break;
        }

        return uniqueMatches;
    }

    public static class QuizDataExtractor {

        public static Set<String> extractSectors(List<ResidencyPosition> positions) {
            return positions.stream()
                    .map(pos -> pos.sector.trim())
                    .filter(s -> !s.isEmpty())
                    .collect(Collectors.toCollection(TreeSet::new)); // Sorted
        }

        public static Set<String> extractTools(List<ResidencyPosition> positions) {
            return positions.stream()
                    .flatMap(pos -> pos.tools.stream())
                    .map(String::trim)
                    .filter(s -> !s.isEmpty())
                    .collect(Collectors.toCollection(TreeSet::new));
        }

        public static Set<String> extractCounties(List<ResidencyPosition> positions) {
            return positions.stream()
                    .filter(pos -> pos.locationType.equalsIgnoreCase("Ireland"))
                    .map(pos -> pos.county.trim())
                    .filter(s -> !s.isEmpty())
                    .collect(Collectors.toCollection(TreeSet::new));
        }

        public static Set<String> extractWorkCountries(List<ResidencyPosition> positions) {
            return positions.stream()
                    .filter(pos -> pos.locationType.equalsIgnoreCase("Abroad"))
                    .map(pos -> pos.workCountry.trim())
                    .filter(s -> !s.isEmpty())
                    .collect(Collectors.toCollection(TreeSet::new));
        }

        public static boolean hasRemoteOption(List<ResidencyPosition> positions) {
            return positions.stream()
                    .anyMatch(pos -> pos.locationType.equalsIgnoreCase("Fully Remote"));
        }

        public static Set<String> extractCompanySizes(List<ResidencyPosition> positions) {
            return positions.stream()
                    .map(ResidencyPosition::getCompanySizeCategory)
                    .filter(s -> !s.isEmpty())
                    .collect(Collectors.toCollection(TreeSet::new));
        }

        public static Map<String, String> getCompanySizeDescriptions() {
            Map<String, String> descriptions = new LinkedHashMap<>();
            descriptions.put("Startup", "1–10 employees");
            descriptions.put("Small Company", "11–50 employees");
            descriptions.put("Medium", "51–250 employees");
            descriptions.put("Large", "251–1000 employees");
            descriptions.put("Multinational", "1001+ employees");
            return descriptions;
        }

    }
}
