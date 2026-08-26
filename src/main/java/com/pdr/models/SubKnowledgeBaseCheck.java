/**
 * File: SubKnowledgeBaseCheck.java
 * Package: com.pdr.models
 *
 * Original Author: Samukelisiwe Zwane (2026 Honours Project, University of Cape Town)
 * Context: Used in PDR project for the LexicographicClosure algorithm.
 * Purpose: Used for educational purposes
 */
package com.pdr.models;

import java.util.List;
import java.util.stream.Collectors;

import org.tweetyproject.logics.pl.syntax.PlFormula;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;

// Keeps 1 sub-knowledge base + query + answer
public class SubKnowledgeBaseCheck {
    private final int rankNumber;              // Ri
    private final int rankSize;                // total statements in Ri
    @JsonIgnore
    private final List<PlFormula> subset;      // the statements kept from Ri in subset
    private final int subsetSize;              // m - number of statements kept
    @JsonIgnore
    private final KnowledgeBase subKnowledgeBase; // R∞ ∪ R ∪ subset 
    @JsonIgnore
    private final PlFormula testedFormula;     
    private final boolean holds;               // whether subKnowledgeBase entails testedFormula

    /**
     * Creates a new SubKnowledgeBaseCheck.
     *
     * @param rankNumber       The rank the subset came from
     * @param subsetSize       The number of statements kept (m)
     * @param rankSize         The size of the rank the subset came from
     * @param subset           The statements kept
     * @param subKnowledgeBase The sub-knowledge base that was tested
     * @param testedFormula    The formula that was asked of it
     * @param holds            True if the sub-knowledge base entails the tested formula
     */
    public SubKnowledgeBaseCheck(int rankNumber, int subsetSize, int rankSize, List<PlFormula> subset, KnowledgeBase subKnowledgeBase, PlFormula testedFormula, boolean holds) {
        this.rankNumber = rankNumber;
        this.subsetSize = subsetSize;
        this.rankSize = rankSize;
        this.subset = subset;
        this.subKnowledgeBase = subKnowledgeBase;
        this.testedFormula = testedFormula;
        this.holds = holds;
    }

    public int getRankNumber() {
        return rankNumber;
    }

     public int getRankSize() {
        return rankSize;
    }

    public List<PlFormula> getSubset() {
        return subset;
    }
    public int getSubsetSize() {
        return subsetSize;
    }

    // sub-knowledge base that was tested
    public KnowledgeBase getSubKnowledgeBase() {
        return subKnowledgeBase;
    }

    public PlFormula getTestedFormula() {
        return testedFormula;
    }

    public boolean getHolds() {
        return holds;
    }

    // JSON view
    @JsonProperty("subset")
    public List<String> getSubsetStrings() {
        return subset != null ? subset.stream().map(PlFormula::toString).collect(Collectors.toList()) : List.of();
    }
 
    @JsonProperty("subKnowledgeBase")
    public List<String> getSubKnowledgeBaseStrings() {
        return subKnowledgeBase != null ? subKnowledgeBase.toStringList() : List.of();
    }
 
    @JsonProperty("testedFormula")
    public String getTestedFormulaString() {
        return testedFormula != null ? testedFormula.toString() : null;
    }
 
    @JsonProperty("subsetString")
    public String getSubsetString() {
        return "{" + getSubsetStrings().stream().collect(Collectors.joining(", ")) + "}";
    }

    // public String getSubsetString() {
    //     return "{" + subset.stream().map(PlFormula::toString).collect(Collectors.joining(", ")) + "}";
    // }

    @Override
    public String toString() {
        StringBuilder sb = new StringBuilder();
        // Which subset of the rank this sub-knowledge base was built from.
        if (subsetSize == 0) {
            sb.append("Keeping nothing from Rank ").append(rankNumber)
              .append(" (the whole rank is dropped)\n");
        } else {
            sb.append("Keeping ").append(subsetSize).append(" of the ").append(rankSize)
              .append(" statements in Rank ").append(rankNumber).append(": ")
              .append(getSubsetString()).append("\n");
        }

        sb.append("Sub-knowledge base: ").append(subKnowledgeBase).append("\n");
        sb.append("        Entails ").append(testedFormula).append("? ").append(holds ? "Yes" : "No").append("\n");

        return sb.toString();
    }
}