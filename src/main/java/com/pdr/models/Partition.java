/*
 * Original Author: Liam De Saldanha , Honours Project (2026), University of Cape Town
 *
 * Context: Used in PDR project for partition service.
 * Purpose: Educational use only.
 */
package com.pdr.models;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

import com.pdr.dtos.PartitionDTO;
import com.pdr.dtos.PartitionStepDTO;
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder(setterPrefix = "with")
public class Partition {
    private KnowledgeBase relevantPartition;
    private KnowledgeBase irrelevantPartition;
    private KnowledgeBase classicalStatements;
    private KnowledgeBase knowledgeBase;
    private List<PartitionStep> traceSteps = new ArrayList<>();
    private double executionTime;

    /**
     * Converts this Partition instance to a PartitionDTO for endpoint
     * @return PartitionDTO The DTO representation of this Partition
     */
    public PartitionDTO toDTO() {
        List<PartitionStepDTO> traceStepsDTO = this.traceSteps != null
                ? this.traceSteps.stream().map(PartitionStep::toDTO).collect(Collectors.toList())
                : new ArrayList<>();
        return new PartitionDTO(
                this.relevantPartition != null ? this.relevantPartition.getStringFormulas() : new ArrayList<>(),
                this.irrelevantPartition != null ? this.irrelevantPartition.getStringFormulas() : new ArrayList<>(),
                this.classicalStatements != null ? this.classicalStatements.getStringFormulas() : new ArrayList<>(),
                this.knowledgeBase != null ? this.knowledgeBase.getStringFormulas() : new ArrayList<>(),

                traceStepsDTO,this.executionTime
        );
    }
}
