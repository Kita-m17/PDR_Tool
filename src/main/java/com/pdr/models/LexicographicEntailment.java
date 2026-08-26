/*
 * Original Author: Thabo Vincent Moloi (2024 Honours Project, University of Cape Town)
 * Adapted by: Samukelisiwe (2026 Honours Project, University of Cape Town)
 * Changes: Added the sub-knowledge base trace 
 *
 * Context: Used in PDR's project for lexicographic closure reasoning.
 * Purpose: Educational use only.
 */
package com.pdr.models;

import java.util.ArrayList;
import java.util.List;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.stream.Collectors;
import com.pdr.dtos.RankDTO;


public class LexicographicEntailment extends Entailment {

    @JsonIgnore
    private final Ranking removedRanking;
    @JsonIgnore
    private final Ranking weakenedRanking;

    // surviving sub-KBs + query + answer
    private final List<SubKnowledgeBaseCheck> finalChecks;
    // trace
    private final List<LexicographicStep> lexicographicSteps;

    private LexicographicEntailment(LexicographicEntailmentBuilder builder) {
        super(builder);
        this.removedRanking = builder.removedRanking;
        this.weakenedRanking = builder.weakenedRanking;
        this.finalChecks = builder.finalChecks;
        this.lexicographicSteps = builder.lexicographicSteps;
    }

    public static LexicographicEntailmentBuilder builder() {
        return new LexicographicEntailmentBuilder();
    }

    public Ranking getRemovedRanking() {
        return removedRanking;
    }

    public Ranking getWeakenedRanking() {
        return weakenedRanking;
    }

    // get query checked against each sub-knowledge base
    public List<SubKnowledgeBaseCheck> getFinalChecks() {
        return finalChecks;
    }

    public List<LexicographicStep> getLexicographicSteps() {
        return lexicographicSteps;
    }

    // JSON VIEW
    @JsonProperty("removedRanking")
    public List<RankDTO> getRemovedRankingDTO() {
        return removedRanking != null
                ? removedRanking.stream().map(Rank::toDTO).collect(Collectors.toList())
                : List.of();
    }
 
    @JsonProperty("weakenedRanking")
    public List<RankDTO> getWeakenedRankingDTO() {
        return weakenedRanking != null
                ? weakenedRanking.stream().map(Rank::toDTO).collect(Collectors.toList())
                : List.of();
    }


    public static class LexicographicEntailmentBuilder extends EntailmentBuilder<LexicographicEntailmentBuilder> {
        private Ranking removedRanking = new Ranking();
        private Ranking weakenedRanking = new Ranking();
        private List<SubKnowledgeBaseCheck> finalChecks = new ArrayList<>();
        private List<LexicographicStep> lexicographicSteps = new ArrayList<>();

        public LexicographicEntailmentBuilder withRemovedRanking(Ranking removedRanking) {
            this.removedRanking = removedRanking;
            return this;
        }

        public LexicographicEntailmentBuilder withWeakenedRanking(Ranking weakenedRanking) {
            this.weakenedRanking = weakenedRanking;
            return this;
        }

        public LexicographicEntailmentBuilder withFinalChecks(List<SubKnowledgeBaseCheck> finalChecks) {
            this.finalChecks = finalChecks;
            return this;
        }

        public LexicographicEntailmentBuilder withLexicographicSteps(List<LexicographicStep> lexicographicSteps) {
            this.lexicographicSteps = lexicographicSteps;
            return this;
        }

        @Override
        protected LexicographicEntailmentBuilder self() {
            return this;
        }

        @Override
        public LexicographicEntailment build() {
            return new LexicographicEntailment(this);
        }
    }
}