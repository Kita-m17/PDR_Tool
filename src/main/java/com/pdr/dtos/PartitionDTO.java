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


}
