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

// Data Transfer Object (DTO) for the base rank trace
@Data
@AllArgsConstructor
public class BaseRankDTO {
    private List<String> knowledgeBase; //get the formulas in the knowledge base
    private List<RankDTO> sequence; //sequence of ranks
    private List<RankDTO> ranking; //final ranking of the formulas
    private List<BaseRankStepDTO> traceSteps; //trace of the algorithm
    private double executionTime;

}