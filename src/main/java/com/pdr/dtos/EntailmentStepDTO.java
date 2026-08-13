package com.pdr.dtos;

import java.util.List;

public class EntailmentStepDTO {
    private int iteration; // The iteration number of this entailment step
    private List<String> remaining; // The remaining knowledge base after this entailment step
    private boolean antecedentExceptional; // True if the antecedent is exceptional, false otherwise
    private String reason; // Reason for the exceptionality result, e.g., "Exceptional because it leads to a contradiction."
    private List<String> removed; // The removed knowledge base after this entailment step

    public EntailmentStepDTO(){}

    public EntailmentStepDTO(int iteration, List<String> remaining, boolean antecedentExceptional, String reason, List<String> removed) {
        this.iteration = iteration;
        this.remaining = remaining;
        this.antecedentExceptional = antecedentExceptional;
        this.reason = reason;
        this.removed = removed;
    }

    public int getIteration() {
        return iteration;
    }

    public void setIteration(int iteration) {
        this.iteration = iteration;
    }

    public List<String> getRemaining() {
        return remaining;
    }

    public void setRemaining(List<String> remaining) {
        this.remaining = remaining;
    }

    public boolean isAntecedentExceptional() {
        return antecedentExceptional;
    }

    public void setAntecedentExceptional(boolean antecedentExceptional) {
        this.antecedentExceptional = antecedentExceptional;
    }

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }

    public List<String> getRemoved() {
        return removed;
    }

    public void setRemoved(List<String> removed) {
        this.removed = removed;
    }
    
}
