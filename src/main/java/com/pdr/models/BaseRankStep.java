/**
 * File: TraceStep.java
 * Package: com.pdr.models
 * 
 * Original Author: Nikita Martin (2026 Honours Project, University of Cape Town)
 * Context: Used in PDR project for the BaseRank algorithm.
 * Purpose: Used for educational purposes
 */
package com.pdr.models;
import java.util.List;

/**
 * This class represents a single step in the trace of the BaseRank algorithm.
 */
public class BaseRankStep {
    private int iteration; //i
    private KnowledgeBase consideredFormulas; //Ei
    private List<ExceptionalityCheck> checks;
    public KnowledgeBase assignedRank; //Ri
    public KnowledgeBase carriedForward; //Ei+1

    /**
     * Creates a new TraceStep instance with the given iteration number, considered formulas, exceptionality checks, assigned rank, and carried forward formulas.
     * 
     * @param iteration
     * @param consideredFormulas
     * @param checks
     * @param assignedRank
     * @param carriedForward
     */
    public BaseRankStep(int iteration, KnowledgeBase consideredFormulas, List<ExceptionalityCheck> checks, KnowledgeBase assignedRank, KnowledgeBase carriedForward) {
        this.iteration = iteration;
        this.consideredFormulas = consideredFormulas;
        this.checks = checks;
        this.assignedRank = assignedRank;
        this.carriedForward = carriedForward;
    }

    /**
     * @return int The iteration number of this trace step
     */
    public int getIteration() {
        return iteration;
    }

    /**
     * @return KnowledgeBase The set of formulas considered in this trace step
     */
    public KnowledgeBase getConsideredFormulas() {
        return consideredFormulas;
    }

    /**
     * @return List<ExceptionalityCheck> The list of exceptionality checks performed in this trace step
     */
    public List<ExceptionalityCheck> getChecks() {
        return checks;
    }

    /**
     * @return KnowledgeBase The set of formulas assigned a rank in this trace step
     */
    public KnowledgeBase getAssignedRank() {
        return assignedRank;
    }

    /**
     * @return KnowledgeBase The set of formulas carried forward to the next trace step
     */
    public KnowledgeBase getCarriedForward() {
        return carriedForward;
    }

    @Override
    public String toString() {
        StringBuilder sb = new StringBuilder();
        sb.append("Iteration: ").append(iteration).append("\n");
        sb.append("Considered Formulas (Ei): ").append(consideredFormulas).append("\n");
        sb.append("Exceptionality Checks: ").append(checks).append("\n");
        sb.append("Assigned Rank (Ri): ").append(assignedRank).append("\n");
        sb.append("Carried Forward (Ei+1): ").append(carriedForward).append("\n");
        return sb.toString();
    }
}
