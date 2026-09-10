package com.pdr.dtos;
/**
 * File: TraceStep.java
 * Package: com.pdr.models
 *
 * Original Author: Nikita Martin, Liam De Saldanha (2026 Honours Project, University of Cape Town)
 * Context: Used in PDR project for the BaseRank algorithm.
 * Purpose: Used for educational purposes
 */
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

//Data Transfer Object (DTO) for the base rank step trace
@Data
@AllArgsConstructor
@NoArgsConstructor
public class BaseRankStepDTO {
    private int iteration; //iteration number of the base rank step
    private List<String> consideredFormulas; //the formulas from the knowledge base that are considered in this step
    private List<String> assignedRanks; //the formulas from the knowledge base that are assigned a rank in this step
    private List<String> carriedForward; //the formulas from the knowledge base that are carried forward to the next step
    private List<ExceptionalityCheckDTO> checks; //the exceptionality checks performed in this step



}
