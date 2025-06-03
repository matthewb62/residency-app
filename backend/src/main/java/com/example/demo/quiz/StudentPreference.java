package com.example.demo.quiz;

import java.util.List;
import java.util.Map;

public class StudentPreference {
    public Map<String, Integer> locationRatings;         // e.g. "Dublin" → 5
    public String durationPreference;                    // "Residency 1", "Residency 1+2", or "Open"
    public Map<String, Integer> sectorRatings;           // e.g. "AI" → 4
    public Map<String, Integer> companySizeRatings;      // e.g. "Startup" → 3
    public List<String> topTechPreferences;              // e.g. ["Java", "Docker", "SQL"]
    public int payImportanceRating;// 1 (low) to 5 (very important)
    public int fullyRemoteRating;

    public StudentPreference(
            Map<String, Integer> locationRatings,
            String durationPreference,
            Map<String, Integer> sectorRatings,
            Map<String, Integer> companySizeRatings,
            List<String> topTechPreferences,
            int payImportanceRating,
            int fullyRemoteRating
    ) {
        this.locationRatings = locationRatings;
        this.durationPreference = durationPreference;
        this.sectorRatings = sectorRatings;
        this.companySizeRatings = companySizeRatings;
        this.topTechPreferences = topTechPreferences;
        this.payImportanceRating = payImportanceRating;
        this.fullyRemoteRating=fullyRemoteRating;
    }
}
