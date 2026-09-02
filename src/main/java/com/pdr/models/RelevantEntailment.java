package com.pdr.models;
/*
 * Original Author: Liam De Saldanha , Honours Project (2026), University of Cape Town
 *
 * Context: Used in PDR project for relevant closure.
 * Purpose: Educational use only.
 */
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.pdr.dtos.RankDTO;

import java.util.List;
import java.util.stream.Collectors;

public class RelevantEntailment extends Entailment {
    @JsonIgnore
    private final KnowledgeBase weakJustification;

    /**
     * Constructor using the builder pattern
     *
     * @param builder
     */
    protected RelevantEntailment(RelevantEntailmentBuilder builder) {
        super(builder);
        this.weakJustification = builder.weakJustification;
    }
@JsonProperty("smallestWeakJustification")
    public List<String> getWeakJustification() {
        return weakJustification.toStringList();
    }

    // builder class for relevant entailment
    public static class RelevantEntailmentBuilder extends EntailmentBuilder<RelevantEntailmentBuilder> {
        private Ranking removedRanking;
        private KnowledgeBase weakJustification;

        public RelevantEntailmentBuilder withWeakJustification(KnowledgeBase weakJustification) {
            this.weakJustification = weakJustification;
            return self();
        }

        @Override
        protected RelevantEntailmentBuilder self() {
            return this;
        }

        @Override
        public RelevantEntailment build() {
            return new RelevantEntailment(this);
        }

    }
}