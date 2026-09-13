/**
 * File: EntailmentStep.java
 * Package: com.pdr.models
 *
 * Original Author: Nikita Martin (2026 Honours Project, University of Cape Town)
 * Context: Used in PDR project for the Closure algorithms.
 * Purpose: Used for educational purposes
 */
package com.pdr.models;

import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.pdr.dtos.EntailmentStepDTO;

/**
 * This class represents a single step in the trace of the Entailment
 */
public class EntailmentStep {
    private final int iteration; // The iteration number of this entailment step

    @JsonIgnore
    private final KnowledgeBase remaining; // The remaining knowledge base after this entailment step
    private final boolean antecedentExceptional; // True if the antecedent is exceptional, false otherwise
    private final String reason; // Reason for the exceptionality result, e.g., "Exceptional because it leads to a contradiction."

    @JsonIgnore
    private final KnowledgeBase removed; // The removed knowledge base after this entailment step

    @JsonIgnore
    private final KnowledgeBase justification;

    @JsonIgnore
    private final KnowledgeBase weakJustification;

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
        this(iteration, remaining, antecedentExceptional, reason, removed, null, null);
    }

    public EntailmentStep(int iteration, KnowledgeBase remaining, boolean antecedentExceptional, String reason, KnowledgeBase removed, KnowledgeBase justification) {
        this(iteration, remaining, antecedentExceptional, reason, removed, justification, null);
    }

    public EntailmentStep(int iteration, KnowledgeBase remaining, boolean antecedentExceptional, String reason, KnowledgeBase removed, KnowledgeBase justification, KnowledgeBase weakJustification) {
        this.iteration = iteration;
        this.remaining = remaining;
        this.antecedentExceptional = antecedentExceptional;
        this.reason = reason;
        this.removed = removed;
        this.justification = justification;
        this.weakJustification = weakJustification;
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
     * @return Knowledge base of the justifications
     */
    public KnowledgeBase getJustification() {
        return justification;
    }

    public KnowledgeBase getWeakJustification() {
        return weakJustification;
    }

    public EntailmentStepDTO toDTO() {
        return new EntailmentStepDTO(iteration, remaining.toStringList(), antecedentExceptional, reason, removed.toStringList(),
        justification != null ? justification.toStringList() : null,
        weakJustification != null ? weakJustification.toStringList() : null);
    }

    @JsonProperty("remaining")
    public List<String> getRemainingStrings() {
        return remaining != null ? remaining.toStringList() : null;
    }

    @JsonProperty("removed")
    public List<String> getRemovedStrings() {
        return removed != null ? removed.toStringList() : null;
    }

    @JsonProperty("justification")
    public List<String> getJustificationStrings() {
        return justification != null ? justification.toStringList() : null;
    }

    @JsonProperty("weakJustification")
    public List<String> getWeakJustificationStrings() {
        return weakJustification != null ? weakJustification.toStringList() : null;
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