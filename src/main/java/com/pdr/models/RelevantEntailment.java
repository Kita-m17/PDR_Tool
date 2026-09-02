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
    private double closureExecutionTime;
    private double baseRankExecutionTime;
    private double partitionExecutionTime;

    /**
     * Constructor using the builder pattern
     *
     * @param builder
     */
    protected RelevantEntailment(RelevantEntailmentBuilder builder) {
        super(builder);
        this.weakJustification = builder.weakJustification;
        this.closureExecutionTime = builder.closureExecutionTime;
        this.baseRankExecutionTime = builder.baseRankExecutionTime;
        this.partitionExecutionTime = builder.partitionExecutionTime;
    }
@JsonProperty("smallestWeakJustification")
    public List<String> getWeakJustification() {
        return weakJustification.toStringList();
    }

    @JsonProperty("closureExecutionTime")
    public double getClosureExecutionTime() {
        return this.closureExecutionTime;
    }
    @JsonProperty("baseRankExecutionTime")
    public double getBaseRankExecutionTime() {
        return this.baseRankExecutionTime;
    }
    @JsonProperty("partitionExecutionTime")
    public double getPartitionExecutionTime() {
        return this.partitionExecutionTime;
    }

    // builder class for relevant entailment
    public static class RelevantEntailmentBuilder extends EntailmentBuilder<RelevantEntailmentBuilder> {
        public double closureExecutionTime;
        public double baseRankExecutionTime;
        public double partitionExecutionTime;

        private Ranking removedRanking;
        private KnowledgeBase weakJustification;

        public RelevantEntailmentBuilder withWeakJustification(KnowledgeBase weakJustification) {
            this.weakJustification = weakJustification;
            return self();
        }

        public RelevantEntailmentBuilder withClosureExecutionTime(double closureExecutionTime) {
            this.closureExecutionTime = closureExecutionTime;
            return self();
        }

        public RelevantEntailmentBuilder withBaseRankExecutionTime(double baseRankExecutionTime) {
            this.baseRankExecutionTime = baseRankExecutionTime;
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