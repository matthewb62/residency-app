package com.example.demo.quiz;
import java.util.List;
import java.util.Map;

public class QuizRequest {
    public Map<String, Integer> locationRatings;
    public String durationPref;
    public Map<String, Integer> sectorRatings;
    public Map<String, Integer> sizeRatings;
    public List<String> techPreferences;
    public int payImportance;
    public int remoteImportance;
}