/**
 * File: LexicographicStep.java
 * Package: com.pdr.models
 *
 * Original Author: Samukelisiwe Zwane (2026 Honours Project, University of Cape Town)
 * Context: Used in PDR project for the LexicographicClosure algorithm.
 * Purpose: Used for educational purposes
 */
package com.pdr.models;

import java.util.ArrayList;
import java.util.List;

import org.tweetyproject.logics.pl.syntax.PlFormula;

// 1 step of the lexicographic closure algorithm
public class LexicographicStep {

    private final int iteration;                        // outer loop (i)
    private final int rankNumber;                       // Ri
    private final KnowledgeBase originalRank;           // Original Ri 
    private final KnowledgeBase remainingRanks;        // R∞ ∪ Ri+1...
    private final List<SubKnowledgeBaseCheck> subKBs;   // sub-knowledge bases tested
    private final int finalSubsetSize;                  // m
    private final PlFormula combinedFormula;            // disjunction that replaced the Ri - null if the rank was dropped
    private final boolean rankRemoved;                  // true if m reached 0
    private final KnowledgeBase remainingAfter;         // remainingRanks after this step
    private final String stepDetails;                        // one line summary

    /**
     * Creates a new LexicographicStep.
     *
     * @param iteration       The iteration number
     * @param rankNumber      The rank processed in this step
     * @param originalRank    The rank before weakening
     * @param remainingRanks The knowledge base after the rank was removed from R
     * @param subKBs          Every sub-knowledge base tested, largest subset first
     * @param finalSubsetSize The subset size the inner loop stopped at
     * @param combinedFormula The disjunction that replaced the rank, or null if dropped
     * @param rankRemoved     True if no subset worked and the rank was dropped
     * @param remainingAfter  The knowledge base at the end of this step
     * @param stepDetails          A short summary of what happened
     */
    public LexicographicStep(int iteration, int rankNumber, KnowledgeBase originalRank,
            KnowledgeBase remainingRanks, List<SubKnowledgeBaseCheck> subKBs, int finalSubsetSize,
            PlFormula combinedFormula, boolean rankRemoved, KnowledgeBase remainingAfter, String stepDetails) {
        this.iteration = iteration;
        this.rankNumber = rankNumber;
        this.originalRank = originalRank;
        this.remainingRanks = remainingRanks;
        this.subKBs = subKBs;
        this.finalSubsetSize = finalSubsetSize;
        this.combinedFormula = combinedFormula;
        this.rankRemoved = rankRemoved;
        this.remainingAfter = remainingAfter;
        this.stepDetails = stepDetails;
    }

    
    public int getIteration() {
        return iteration;
    }

    public int getRankNumber() {
        return rankNumber;
    }

    public KnowledgeBase getOriginalRank() {
        return originalRank;
    }

    public KnowledgeBase getremainingRanks() {
        return remainingRanks;
    }

    
    public List<SubKnowledgeBaseCheck> getsubKBs() {
        return subKBs;
    }

    public int getFinalSubsetSize() {
        return finalSubsetSize;
    }

    public PlFormula getCombinedFormula() {
        return combinedFormula;
    }

    public boolean isRankRemoved() {
        return rankRemoved;
    }

    public KnowledgeBase getRemainingAfter() {
        return remainingAfter;
    }

    public String getstepDetails() {
        return stepDetails;
    }

    // The surviving sub-knowledge bases
    public List<SubKnowledgeBaseCheck> getSurvivingsubKBs() {
        List<SubKnowledgeBaseCheck> surviving = new ArrayList<>();
 
        if (rankRemoved) {
            return surviving;
        }
 
        for (SubKnowledgeBaseCheck subKnowledge : subKBs) {
            if (subKnowledge.getSubsetSize() == finalSubsetSize && !subKnowledge.getHolds()) {
                surviving.add(subKnowledge);
            }
        }
 
        return surviving;
    }

    @Override
    public String toString() {
        StringBuilder sb = new StringBuilder();
        sb.append("Iteration: ").append(iteration).append("\n");
        sb.append("   The antecedent is refuted, so we weaken the lowest remaining rank.\n");
        sb.append("   Rank being weakened (R").append(rankNumber).append("): ").append(originalRank).append("\n");
        sb.append("   The reamining ranks with this rank removed: ").append(remainingRanks).append("\n\n");

        sb.append("   Sub-knowledge bases tested :\n");

        int l = -1;
        for (SubKnowledgeBaseCheck check : subKBs) {
            if (check.getSubsetSize() != l) {
                l = check.getSubsetSize();
                sb.append("\n   -- Subset size m = ").append(l)
                  .append(" (dropping ").append(check.getRankSize() - l)
                  .append(" of ").append(check.getRankSize()).append(") --\n");
            }
            sb.append("     -> ").append(check.toString());
        }

        sb.append("\n");

        if (rankRemoved) {
            sb.append("   Outcome: the antecedent is refuted in every sub-knowledge base at every\n")
              .append("            subset size, so Rank ").append(rankNumber)
              .append(" contributes nothing and is dropped.\n");
        } else {
            List<SubKnowledgeBaseCheck> surviving = getSurvivingsubKBs();

            sb.append("   Outcome: at m = ").append(finalSubsetSize)
              .append(" there is a sub-knowledge base that does not refute the antecedent,\n");

            for (SubKnowledgeBaseCheck check : surviving) {
                sb.append("            keeping ").append(check.getSubsetString()).append(" from Rank ").append(rankNumber).append("\n");
            }
 
            sb.append("            so Rank ").append(rankNumber)
              .append(" is replaced by the combined formula:\n")
              .append("            ").append(combinedFormula).append("\n");
        }
 
        sb.append("   R∞ ∪ R is now: ").append(remainingAfter).append("\n");
        return sb.toString();
    }
}
 