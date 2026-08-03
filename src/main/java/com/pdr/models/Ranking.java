/*
    * File: Ranking.java
    * Package: com.pdr.models
    *
    * Original Author: Thabo Vincent Moloi , Honours Project (2024), University of Cape Town
    * Adapted by: Julia Cotterrell (2025 Honours Project, University of Cape Town)
    *
    * Status: Not modified, used as it is in PDR's Honours Project (2026).
    * Context: Used in PDR project for defeasible reasoning algorithms.
    * Purpose: Educational use only.
*/
package com.pdr.models;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;


import java.util.ArrayList;
import java.util.Collection;

/**
    * This class represents ranking of formulas.
*/
public class Ranking extends ArrayList<Rank> {

    /**
        * Constructs an empty ranking.
    */
    public Ranking() {
        super();
    }

    /**
        * Constructs a ranking from a collection of ranks.
        * 
        * @param ranks
    */
    @JsonCreator
    public Ranking(@JsonProperty("ranking") Collection<? extends Rank> ranks) {
        super(ranks);
    }

    /**
        * Create and add new rank given a rank number and knowledge base of formulas.
        * 
        * @param rankNumber    Rank number.
        * @param knowledgeBase Knowledge base of formulas.
    */
    public void addRank(int rankNumber, KnowledgeBase knowledgeBase) {
        this.add(new Rank(rankNumber, knowledgeBase));
    }

    /**
        * Get the rank given the rank number.
        * 
        * @param rankNumber Rank number.
        * @return Rank
    */
    public Rank getRank(int rankNumber) {
        if (rankNumber == Integer.MAX_VALUE) {
            return this.get(this.size() - 1);
        }
        return this.get(rankNumber);
    }

}
