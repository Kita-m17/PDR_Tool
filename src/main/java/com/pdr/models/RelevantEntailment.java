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
    @JsonIgnore
    private final Ranking removedRanking;

    /**
     * Constructor using the builder pattern
     *
     * @param builder
     */
    protected RelevantEntailment(RelevantEntailmentBuilder builder) {
        super(builder);
        this.weakJustification = builder.weakJustification;
        this.partitionExecutionTime = builder.partitionExecutionTime;
        this.removedRanking = builder.removedRanking;
    }
@JsonProperty("smallestWeakJustification")
    public List<String> getWeakJustification() {
        return weakJustification.toStringList();
    }

    @JsonProperty("partitionExecutionTime")
    public double getPartitionExecutionTime() {
        return this.partitionExecutionTime;
    }

    /**
     * @return Ranking the formulas excluded from the relevant partition
     *         because they were still exceptional (per rank).
     */
    public Ranking getRemovedRanking() {
        return removedRanking;
    }

    @JsonProperty("removedRanking")
    public List<RankDTO> getRemovedRankingDTO() {
        return removedRanking != null
                ? removedRanking.stream().map(Rank::toDTO).collect(Collectors.toList())
                : List.of();
    }

    /**
     * Relevant closure additionally goes through a partitioning phase (also
     * timed separately from base rank and closure), so its total is the
     * base Entailment total plus partitionExecutionTime.
     */
    @Override
    @JsonProperty("totalExecutionTime")
    public double getTotalExecutionTime() {
        return super.getTotalExecutionTime() + this.partitionExecutionTime;
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

        public RelevantEntailmentBuilder withRemovedRanking(Ranking removedRanking) {
            this.removedRanking = removedRanking;
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