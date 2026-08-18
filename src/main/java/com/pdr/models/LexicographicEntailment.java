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

public class LexicographicEntailment extends Entailment {

    private final Ranking weakenedRanking;
    // surviving sub-KBs + query + answer
    private final List<SubKnowledgeBaseCheck> finalChecks;
    // trace
    private final List<LexicographicStep> lexicographicSteps;

    private LexicographicEntailment(LexicographicEntailmentBuilder builder) {
        super(builder);
        this.weakenedRanking = builder.weakenedRanking;
        this.finalChecks = builder.finalChecks;
        this.lexicographicSteps = builder.lexicographicSteps;
    }

    public static LexicographicEntailmentBuilder builder() {
        return new LexicographicEntailmentBuilder();
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



    public static class LexicographicEntailmentBuilder extends EntailmentBuilder<LexicographicEntailmentBuilder> {
        private Ranking weakenedRanking = new Ranking();
        private List<SubKnowledgeBaseCheck> finalChecks = new ArrayList<>();
        private List<LexicographicStep> lexicographicSteps = new ArrayList<>();

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