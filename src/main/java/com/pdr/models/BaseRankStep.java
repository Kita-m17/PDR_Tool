/**
 * File: TraceStep.java
 * Package: com.pdr.models
 * 
 * Original Author: Nikita Martin, Liam De Saldanha (2026 Honours Project, University of Cape Town)
 * Context: Used in PDR project for the BaseRank algorithm.
 * Purpose: Used for educational purposes
 */
package com.pdr.models;
import java.util.List;
import com.pdr.dtos.BaseRankStepDTO;
import com.pdr.dtos.ExceptionalityCheckDTO;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

import java.util.stream.Collectors;

/**
 * This class represents a single step in the trace of the BaseRank algorithm.
 */
@AllArgsConstructor
@Data
@Builder(setterPrefix = "with")
public class BaseRankStep {
    private int iteration; //i
    private KnowledgeBase consideredFormulas; //Ei
    private List<ExceptionalityCheck> checks;
    private KnowledgeBase assignedRank; //Ri
    private KnowledgeBase carriedForward; //Ei+1





    public BaseRankStepDTO toDTO() {
        List<ExceptionalityCheckDTO> checksDTO = this.checks.stream().map(ExceptionalityCheck::toDTO).collect(Collectors.toList());
        return new BaseRankStepDTO(this.iteration, this.consideredFormulas.toStringList(), this.assignedRank.toStringList(), this.carriedForward.toStringList(), checksDTO);
    }

    @Override
    public String toString() {
        StringBuilder sb = new StringBuilder();
        if (iteration == Integer.MAX_VALUE){
            sb.append("Rank ∞ Assignment:\n   The following classical formulas are assigned to Rank ∞ because they are never exceptional\n   -> they hold in all worlds\n").append("   Considered Formulas (R∞): ").append(consideredFormulas).append("\n\n");
            return sb.toString();
        }

        sb.append("Iteration: ").append(iteration).append("\n");


        if (consideredFormulas.isEmpty()) 
            return ""; // skip empty steps
        else
            sb.append("   Considered Formulas (Ei): ").append(consideredFormulas).append("\n\n");

        sb.append("   Exceptionality Checks:\n");
        for( ExceptionalityCheck check: checks){
            sb.append("   -> ").append(check.toString()).append("\n");
        }

        // sb.append("   Assigned Rank (Ri): ").append(assignedRank).append("\n");
        sb.append("   Carried Forward (Ei+1): ").append(carriedForward).append("\n");
        return sb.toString();
    }
}
