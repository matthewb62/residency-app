package com.example.demo.quiz;

public class MatchResult implements Comparable<MatchResult> {
    public ResidencyPosition position;
    public double score;

    public MatchResult(ResidencyPosition position, double score) {
        this.position = position;
        this.score = score;
    }

    @Override
    public int compareTo(MatchResult other) {
        return Double.compare(other.score, this.score); // Descending order
    }
}
