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
    // The one timing specific to relevant closure - baseRankExecutionTime and
    // closureExecutionTime are shared by every algorithm and live on Entailment.
    private double partitionExecutionTime;

    /**
     * Constructor using the builder pattern
     *
     * @param builder
     */
    protected RelevantEntailment(RelevantEntailmentBuilder builder) {
        super(builder);
        this.weakJustification = builder.weakJustification;
        this.partitionExecutionTime = builder.partitionExecutionTime;
    }
@JsonProperty("smallestWeakJustification")
    public List<String> getWeakJustification() {
        return weakJustification.toStringList();
    }

    @JsonProperty("partitionExecutionTime")
    public double getPartitionExecutionTime() {
        return this.partitionExecutionTime;
    }

    // builder class for relevant entailment
    public static class RelevantEntailmentBuilder extends EntailmentBuilder<RelevantEntailmentBuilder> {
        public double partitionExecutionTime;

        private Ranking removedRanking;
        private KnowledgeBase weakJustification;

        public RelevantEntailmentBuilder withWeakJustification(KnowledgeBase weakJustification) {
            this.weakJustification = weakJustification;
            return self();
        }

        public RelevantEntailmentBuilder withPartitionExecutionTime(double partitionExecutionTime) {
            this.partitionExecutionTime = partitionExecutionTime;
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