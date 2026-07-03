/**
 * File: EntailmentStep.java
 * Package: com.pdr.models
 * 
 * Original Author: Nikita Martin (2026 Honours Project, University of Cape Town)
 * Context: Used in PDR project for the Closure algorithms.
 * Purpose: Used for educational purposes
 */
package com.pdr.models;

/**
 * This class represents a single step in the trace of the Entailment
 */
public class EntailmentStep {
    private final int iteration; // The iteration number of this entailment step
    private final KnowledgeBase remaining; // The remaining knowledge base after this entailment step
    private final boolean antecedentExceptional; // True if the antecedent is exceptional, false otherwise
    private final String reason; // Reason for the exceptionality result, e.g., "Exceptional because it leads to a contradiction."
    private final KnowledgeBase removed; // The removed knowledge base after this entailment step

    /**
     * Constructor that creates a new EntailmentStep instance with the given iteration number, remaining knowledge base, exceptionality checks, removed ranks, and the reason.
     * 
     * @param iteration
     * @param remaining
     * @param antecedentExceptional
     * @param reason
     * @param removed
     */
    public EntailmentStep(int iteration, KnowledgeBase remaining, boolean antecedentExceptional, String reason, KnowledgeBase removed) {
        this.iteration = iteration;
        this.remaining = remaining;
        this.antecedentExceptional = antecedentExceptional;
        this.reason = reason;
        this.removed = removed;
    }

    // --- Getters ---

    /**
     * @return int iteration number
     */
    public int getIteration() {
        return iteration;
    }

    /**
     * @return KnowledgeBase kn with remaining ranks
     */
    public KnowledgeBase getRemaining() {
        return remaining;
    }

    /**
     * @return boolean True if the antecedent is exceptional, false otherwise
     */
    public boolean isAntecedentExceptional() {
        return antecedentExceptional;
    }

    /**
     * @return String The reason for the Entailment result
     */
    public String getReason() {
        return reason;
    }

    /**
     * @return KnowledgeBase of all the removed ranks/formulas
     */
    public KnowledgeBase getRemoved() {
        return removed;
    }

    /**
     * @return String representation of the exntailment result
     */
    @Override
    public String toString() {
        return "EntailmentStep " + iteration + "\n" +
                "   Remaining: " + remaining + "\n" +
                "   Exceptional: " + antecedentExceptional + "\n" +
                "   Reason: " + reason + "\n" +
                "   Removed: " + removed;
    }
}