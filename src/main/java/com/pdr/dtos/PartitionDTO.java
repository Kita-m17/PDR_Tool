/*
 * Original Author: Liam De Saldanha , Honours Project (2026), University of Cape Town
 *
 * Context: Used in PDR project for partition controller.
 * Purpose: Educational use only.
 */
package com.pdr.dtos;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

// Data Transfer Object (DTO) for the full Partition result (relevant closure)
@Data
@AllArgsConstructor
@NoArgsConstructor
public class PartitionDTO {
    public List<String> relevantPartition;
    public List<String> irrelevantPartition;
    public List<String> classicalStatements;
    public List<String> knowledgeBase;
    public List<PartitionStepDTO> traceSteps; // trace of the algorithm
    public double executionTime;


}
