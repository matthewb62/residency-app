package com.example.demo.quiz;

import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

public class ResidencyPosition {
    public String companyName;
    public String contactEmail;
    public String website;
    public String companyDescription;
    public String sector;
    public String worksiteAddress;
    public String locationType; // Ireland / Abroad / Fully Remote
    public String county;
    public String eircode;
    public String workCountry;
    public String jobDescription;
    public int numEmployees;
    public int monthlyPay;
    public String duration; // Residency 1, Residency 2, Residency 1+2
    public List<String> tools;


    public ResidencyPosition(String[] row) {
        this.companyName = row[0];
        this.contactEmail = row[1];
        this.website = row[2];
        this.companyDescription = row[3];
        this.sector = row[4];
        this.worksiteAddress = row[5];
        this.locationType = row[6];
        this.county = row[7];
        this.eircode = row[8];
        this.workCountry = row[9];
        this.jobDescription = row[10];
        this.monthlyPay = Integer.parseInt(row[11]);
        this.duration = row[12];
        this.tools = Arrays.stream(row[13].split(","))
                .map(String::trim)
                .collect(Collectors.toList());
        this.numEmployees = Integer.parseInt(row[14].trim());
    }

    public String getLocationKey() {
        switch (locationType) {
            case "Ireland":
                return county;
            case "Abroad":
                return workCountry;
            default:
                return "Fully Remote";
        }
    }

    public String getCompanySizeCategory() {
        if (numEmployees <= 10) return "Startup";
        if (numEmployees <= 50) return "Small Company";
        if (numEmployees <= 250) return "Medium";
        if (numEmployees <= 1000) return "Large";
        return "Multinational";
    }
}

