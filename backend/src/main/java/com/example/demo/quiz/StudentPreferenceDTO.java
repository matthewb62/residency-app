package com.example.demo.quiz;

import java.util.List;
import java.util.Map;

/**
 * DTO for receiving quiz preferences from the frontend.
 */
public class StudentPreferenceDTO {
    public Map<String, Integer> locationRatings;
    public String duration;
    public Map<String, Integer> sectorRatings;
    public Map<String, Integer> sizeRatings;
    public List<String> techPreferences;
    public int payImportance;
    public int remoteImportance;

    @Override
    public String toString() {
        return "StudentPreferenceDTO{" +
                "locationRatings=" + locationRatings +
                ", duration='" + duration + '\'' +
                ", sectorRatings=" + sectorRatings +
                ", sizeRatings=" + sizeRatings +
                ", techPreferences=" + techPreferences +
                ", payImportance=" + payImportance +
                ", remoteImportance=" + remoteImportance +
                '}';
    }
}
