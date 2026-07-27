/*
 * File: RationalEntailment.java
 * Package: com.extrc.models
 *
 * Original Author: Thabo Vincent Moloi , Honours Project (2024), University of Cape Town
 * Adapted by: Julia Cotterrell (2025 Honours Project, University of Cape Town)
 * Used by: Nikita Martin (2026 Honours Project, University of Cape Town)
 *
 * Status: Not modified
 * Context: Used in PDR's project for rational closure reasoning.
 * Purpose: Educational use only.
 */
package com.pdr.models;

// Represents an entailment result under rational closure
public class RationalEntailment extends Entailment{
    protected final Ranking removedRanking;

    // Private constructor, only accessible via the builder
    private RationalEntailment(RationalEntailmentBuilder builder){
        super(builder);
        this.removedRanking = builder.removedRanking;
    }

    /**
     * static factory method to start building
     * @return RationalEntailmentBuilder
     */
    public static RationalEntailmentBuilder builder(){
        return new RationalEntailmentBuilder();
    }

    /**
     * @return Ranking
     */
    public Ranking getRemovedRanking(){
        return removedRanking;
    }

    // builer class for rational entailment
    public static class RationalEntailmentBuilder extends EntailmentBuilder<RationalEntailmentBuilder>{
        private Ranking removedRanking;

        public RationalEntailmentBuilder withRemovedRanking(Ranking removedRanking){
            this.removedRanking = removedRanking;
            return self();
        }

        @Override
        protected RationalEntailmentBuilder self(){
            return this;
        }

        @Override
        public RationalEntailment build(){
            return new RationalEntailment(this);
        }
    }
    
}