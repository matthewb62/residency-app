package com.example.demo;

import com.example.demo.quiz.*;

import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/quiz")
@CrossOrigin(origins = "*")
public class QuizController {

    @GetMapping("/options")
    public Map<String, Object> getQuizOptions() {
        List<ResidencyPosition> positions = SupabaseFetcher.fetch();

        Map<String, Object> options = new HashMap<>();
        options.put("sectors", MatchingEngine.QuizDataExtractor.extractSectors(positions));
        options.put("tools", MatchingEngine.QuizDataExtractor.extractTools(positions));
        options.put("counties", MatchingEngine.QuizDataExtractor.extractCounties(positions));
        options.put("countries", MatchingEngine.QuizDataExtractor.extractWorkCountries(positions));
        options.put("remoteAvailable", MatchingEngine.QuizDataExtractor.hasRemoteOption(positions));
        options.put("sizes", MatchingEngine.QuizDataExtractor.extractCompanySizes(positions));

        return options;
    }

    @PostMapping
    public List<String> matchResidencies(@RequestBody StudentPreferenceDTO dto) {
        // Convert DTO into real StudentPreference object
        StudentPreference pref = new StudentPreference(
                dto.locationRatings,
                dto.duration,
                dto.sectorRatings,
                dto.sizeRatings,
                dto.techPreferences,
                dto.payImportance,
                dto.remoteImportance
        );

        // TODO: Replace this with Supabase data loader
        List<ResidencyPosition> allResidencies = SupabaseFetcher.fetch();

        // Run matching algorithm
        List<MatchResult> matches = MatchingEngine.getTopMatches(pref, allResidencies, 3);

        // Return just company names for now
        return matches.stream()
                .map(m -> m.position.companyName)
                .toList();
    }
}
