package com.example.demo.quiz;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.*;

public class SupabaseFetcher {

    private static final String SUPABASE_URL = "https://skavheoivhbrtddpvkog.supabase.co/rest/v1/";
    private static final String SUPABASE_TABLE = "company_data";
    private static final String API_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNrYXZoZW9pdmhicnRkZHB2a29nIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg1MjQwOTMsImV4cCI6MjA2NDEwMDA5M30.M9mPXBsmtxXKfHwcCPbbFSIWPFv0R3aAO0L4EQCi77g";

    public static List<ResidencyPosition> fetch() {
        List<ResidencyPosition> positions = new ArrayList<>();
        try {
            String endpoint = SUPABASE_URL + SUPABASE_TABLE + "?select=*";
            HttpURLConnection conn = (HttpURLConnection) new URL(endpoint).openConnection();
            conn.setRequestMethod("GET");
            conn.setRequestProperty("apikey", API_KEY);
            conn.setRequestProperty("Authorization", "Bearer " + API_KEY);

            BufferedReader in = new BufferedReader(new InputStreamReader(conn.getInputStream()));
            StringBuilder jsonStr = new StringBuilder();
            String line;
            while ((line = in.readLine()) != null) jsonStr.append(line);
            in.close();

            ObjectMapper mapper = new ObjectMapper();
            JsonNode array = mapper.readTree(jsonStr.toString());

            for (JsonNode node : array) {
                String[] row = new String[15];
                row[0] = node.hasNonNull("company_name") ? node.get("company_name").asText() : "Unknown";
                row[1] = node.hasNonNull("contact_email") ? node.get("contact_email").asText() : "Unknown";
                row[2] = node.hasNonNull("website") ? node.get("website").asText() : "Unknown";
                row[3] = node.hasNonNull("company_description") ? node.get("company_description").asText() : "Unknown";
                row[4] = node.hasNonNull("sector") ? node.get("sector").asText() : "Unknown";
                row[5] = node.hasNonNull("worksite_address") ? node.get("worksite_address").asText() : "Unknown";
                row[6] = node.hasNonNull("location_type") ? node.get("location_type").asText() : "Unknown";
                row[7] = node.hasNonNull("county") ? node.get("county").asText() : "Unknown";
                row[8] = node.hasNonNull("eircode") ? node.get("eircode").asText() : "Unknown";
                row[9] = node.hasNonNull("work_country") ? node.get("work_country").asText() : "Unknown";
                row[10] = node.hasNonNull("job_description") ? node.get("job_description").asText() : "Unknown";
                row[11] = node.hasNonNull("monthly_pay") ? node.get("monthly_pay").asText() : "0"; // or "Unknown"
                row[12] = node.hasNonNull("duration") ? node.get("duration").asText() : "Unknown";
                row[13] = node.hasNonNull("languages/tools") ? node.get("languages/tools").asText() : ""; // safer empty string for CSV style
                row[14] = node.hasNonNull("num_employees") ? node.get("num_employees").asText() : "0";

                ResidencyPosition position = new ResidencyPosition(row);
                positions.add(position);
            }
        } catch (Exception e) {
            e.printStackTrace();
        }

        return positions;
    }
}

