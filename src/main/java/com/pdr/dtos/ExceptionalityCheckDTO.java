/*
 * File: ExceptionalityCheckDTO.java
 * Package: com.pdr.dtos
 *
 * Author: Nikita Martin (2026 Honours Project, University of Cape Town)
 * Status: Original Author
 * 
 * Context: Used for PDR project for exceptionality check trace
 * Purpose: Educational use only.
 */
package com.pdr.dtos;

import java.util.List;

// Data Transfer Object (DTO) for the exceptionality check trace
public class ExceptionalityCheckDTO {

    private String antecedant; // The antecedent being checked for exceptionality
    private boolean isExceptional; // True if the antecedent is exceptional, false otherwise
    private String reason; // Reason for the exceptionality result, e.g., "Exceptional because it leads to a contradiction."
    private int rankNumber; // The rank number at which the exceptionality check was performed
    private List<String> affectedRules; // The rules that with the antecedent

    /**
     * Default Constructor
     */
    public ExceptionalityCheckDTO(){}

    /**
     * Parameterised Constructor
     * 
     * @param antecedant
     * @param isExceptional
     * @param reason
     * @param rankNumber
     * @param affectedRules
     */
    public ExceptionalityCheckDTO(String antecedant, boolean isExceptional, String reason, int rankNumber, List<String> affectedRules){
        this.antecedant = antecedant;
        this.isExceptional = isExceptional;
        this.reason = reason;
        this.rankNumber = rankNumber;
        this.affectedRules = affectedRules;
    }

    /**
     * @return String antecedent
     */
    public String getAntecedant(){
        return this.antecedant;
    }


    /**
     * @param antecedant
     */
    public void setAntecedent(String antecedant){
        this.antecedant = antecedant;
    }

    /**
     * @return boolean exceptionality
     */
    public boolean getExceptionality(){
        return this.isExceptional;
    }

    /**
     * @param exceptionality
     */
    public void setExceptionality(boolean exceptionality){
        this.isExceptional = exceptionality;
    }

    /**
     * @return String reason
     */
    public String getReason(){
        return this.reason;
    }

    /**
     * @param reason
     */
    public void setReason(String reason){
        this.reason = reason;
    }

    /**
     * @return rankNumber
     */
    public int getRankNumber(){
        return this.rankNumber;
    }

    /**
     * @param rankNumber
     */
    public void setAntecedent(int rankNumber){
        this.rankNumber = rankNumber;
    }

    /**
     * @return List<String> affected rules
     */
    public List<String> getAffectedRules(){
        return this.affectedRules;
    }

    /**
     * @param affectedRules
     */
    public void setAntecedent(List<String> affectedRules){
        this.affectedRules = affectedRules;
    }
}
