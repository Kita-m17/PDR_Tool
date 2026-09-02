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
import java.util.List;
import java.util.stream.Collectors;
import com.pdr.dtos.ExceptionalityCheckDTO;
/**
 * This class represents the result of an exceptionality check for a given antecedent in a knowledge base.
 * eg. "penguin: exceptional - Reason: {bird -> flies, penguin -> bird, penguin -> !flies} entails !penguin"
 */
public class ExceptionalityCheck {

    private final  PlFormula antecedant; // The antecedent being checked for exceptionality
    private final boolean isExceptional; // True if the antecedent is exceptional, false otherwise
    private final String reason; // Reason for the exceptionality result, e.g., "Exceptional because it leads to a contradiction."
    private final int rankNumber; // The rank number at which the exceptionality check was performed
    private final List<PlFormula> affectedRules; // The rules that with the antecedent

    /**
     * Creates a new ExceptionalityCheck instance with the given antecedent, exceptionality result, and reason.
     * 
     * @param antecedant The antecedent being checked for exceptionality
     * @param isExceptional True if the antecedent is exceptional, false otherwise
     * @param reason Reason for the exceptionality result
     */
    public ExceptionalityCheck(PlFormula antecedant, boolean isExceptional, String reason, int rankNumber, List<PlFormula> affectedRules) {
        this.antecedant = antecedant;
        this.isExceptional = isExceptional;
        this.reason = reason;
        this.rankNumber = rankNumber;
        this.affectedRules = affectedRules;
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
     * Returns the rank number at which the exceptionality check was performed.
     * @return int The rank number at which the exceptionality check was performed
     */
    public int getRankNumber() {
        return rankNumber;
    }

    /**
     * Returns the rules that were affected by the exceptionality check.
     * @return List<PlFormula> The rules that were affected by the exceptionality check
     */
    public List<PlFormula> getAffectedRules() {
        return affectedRules;
    }

    /**
     * Converts this ExceptionalityCheck instance to an ExceptionalityCheckDTO for data transfer.
     * @return ExceptionalityCheckDTO The DTO representation of this ExceptionalityCheck
     */
    public ExceptionalityCheckDTO toDTO() {
        List<String> affectedRulesStr = this.affectedRules.stream().map(PlFormula::toString).collect(Collectors.toList());
        return new ExceptionalityCheckDTO(this.antecedant.toString(), this.isExceptional, this.reason, this.rankNumber, affectedRulesStr);
    }
    
    /**
     * @return String A string representation of the exceptionality check result
     */
    @Override
    public String toString() {
        String formulaList = this.affectedRules.stream().map(f -> "       - " + f).collect(Collectors.joining("\n"));
        //return this.antecedant + ": " + (this.isExceptional ? "exceptional" : "not exceptional") + " - Reason: " + this.reason;
        if (this.isExceptional){
            return "Antecedent '" + this.antecedant + "' IS exceptional\n"
                + "   -> Materialised knowledge base: " + this.reason + "\n"
                + "   -> Under classical reasoning, assuming '" + this.antecedant + "' is true leads to a contradiction in this set.\n"
                + "   -> The knowledge base classically entails !" + this.antecedant + "\n"
                + "   -> The following rules with the antecedent '" + this.antecedant + "' are carried forward to the next iteration\n"
                + formulaList + "\n";
        }else{
            return "Antecedent '" + this.antecedant + "' IS NOT exceptional\n"
                + "   -> Materialised knowledge base: " + this.reason + "\n" 
                + "   -> Under classical reasoning, assuming '" + this.antecedant + "' is true, does not lead to a contradiction in this set.\n"
                + "   -> The following rules with the antecedent '" + this.antecedant + "' are assigned to Rank " + this.rankNumber + ":\n" 
                + formulaList + "\n";
        }
    }
}
