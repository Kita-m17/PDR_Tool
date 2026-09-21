package com.pdr.dtos;
/**
 * File: EntailmentStepDTO.java
 * Package: com.pdr.dtos
 *
 * Original Author: Nikita Martin (2026 Honours Project, University of Cape Town)
 * Context: Used in PDR project for the Rational Closure algorithm.
 * Purpose: Used for educational purposes
 */

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder(setterPrefix = "with")
public class EntailmentStepDTO {
    private int iteration; // The iteration number of this entailment step
    private List<String> remaining; // The remaining knowledge base after this entailment step
    private boolean antecedentExceptional; // True if the antecedent is exceptional, false otherwise
    private String reason; // Reason for the exceptionality result, e.g., "Exceptional because it leads to a contradiction."
    private List<String> removed; // The removed knowledge base after this entailment step
    private List<String> justification; // justification for entailment checks in the RC algo
    private List<String> weakJustification; //justification for final entailment check
}
