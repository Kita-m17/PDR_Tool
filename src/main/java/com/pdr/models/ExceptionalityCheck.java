/**
 * File: ExceptionalityCheck.java
 * Package: com.pdr.models
 * 
 * Original Author: Nikita Martin (2026 Honours Project, University of Cape Town)
 * Context: Used in PDR project for the BaseRank algorithm.
 * Purpose: Used for educational purposes
 */
package com.pdr.models;

import org.tweetyproject.logics.pl.syntax.PlFormula;

/**
 * This class represents the result of an exceptionality check for a given antecedent in a knowledge base.
 * eg. "penguin: exceptional - Reason: {bird -> flies, penguin -> bird, penguin -> !flies} entails !penguin"
 */
public class ExceptionalityCheck {

    private final  PlFormula antecedant; // The antecedent being checked for exceptionality
    private final boolean isExceptional; // True if the antecedent is exceptional, false otherwise
    private final String reason; // Reason for the exceptionality result, e.g., "Exceptional because it leads to a contradiction."

    /**
     * Creates a new ExceptionalityCheck instance with the given antecedent, exceptionality result, and reason.
     * 
     * @param antecedant The antecedent being checked for exceptionality
     * @param isExceptional True if the antecedent is exceptional, false otherwise
     * @param reason Reason for the exceptionality result
     */
    public ExceptionalityCheck(PlFormula antecedant, boolean isExceptional, String reason) {
        this.antecedant = antecedant;
        this.isExceptional = isExceptional;
        this.reason = reason;
    }

    /**
     * Returns the antecedent being checked for exceptionality.
     * @return PlFormula The antecedent being checked for exceptionality
     */
    public PlFormula getAntecedant() {
        return antecedant;
    }

    /**
     * Returns whether the antecedent is exceptional.
     * @return boolean True if the antecedent is exceptional, false otherwise
     */
    public boolean isExceptional() {
        return isExceptional;
    }

    /**
     * Returns the reason for the exceptionality result.
     * @return String The reason for the exceptionality result
     */
    public String getReason() {
        return reason;
    }
    
    /**
     * @return String A string representation of the exceptionality check result
     */
    @Override
    public String toString() {
        return this.antecedant + ": " + (this.isExceptional ? "exceptional" : "not exceptional") + " - Reason: " + this.reason;
    }
}
