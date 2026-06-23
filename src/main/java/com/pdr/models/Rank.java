/*
    * File: Rank.java
    * Package: com.pdr.models
    *
    * Original Author: Thabo Vincent Moloi , Honours Project (2024), University of Cape Town
    * Adapted by: Nikita Martin (PDR 2026 Honours Project, University of Cape Town)
    *
    * Status: Used as it is in PDR's Honours Project (2026).
    * Context: Used in PDR project for defeasible reasoning algorithms.
    * Purpose: Educational use only.
*/
package com.pdr.models;

import java.util.Collection;

import org.tweetyproject.logics.pl.syntax.PlFormula;

/**
    * Represents a rank in a ranked knowledge base, containing a set of formulas and a rank number.
*/
public class Rank {
  
    /**
     * Represents the rank number (0 for the lowest rank, higher numbers for more exceptional ranks).
    */
    private int rankNumber;

    /**
     * Represents the set of formulas in this rank.
    */
    private KnowledgeBase formulas;

    /**
        * Default constructor that creates an empty rank with rank number 0.
    */
    public Rank() {
        this(0, new KnowledgeBase());
    }

    /**
        * Creates a new rank given a rank number and a set of formulas.
        * 
        * @param rankNumber Rank number.
        * @param formulas   A set of formulas.
    */
    public Rank(int rankNumber, Collection<? extends PlFormula> formulas) {
        this.formulas = new KnowledgeBase(formulas);
        this.rankNumber = rankNumber;
    }

    /**
        * Create a rank (copy) from a given rank.
        * 
        * @param rank Ranked knowledge base.
    */
    public Rank(Rank rank) {
        this.formulas = new KnowledgeBase(rank.formulas);
        this.rankNumber = rank.rankNumber;
    }

    /**
        * Get the rank number.
        * 
        * @return Rank number.
    */
    public int getRankNumber() {
        return this.rankNumber;
    }

    /**
        * Set the rank number.
        * 
        * @param rankNumber Rank number.
    */
    public void setRankNumber(int rankNumber) {
        this.rankNumber = rankNumber;
    }

    /**
        * Get the formulas in this rank.
        * @return KnowledgeBase
    */
    public KnowledgeBase getFormulas() {
        return formulas;
    }
}