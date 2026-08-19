package com.pdr.models;

import lombok.AllArgsConstructor;
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
public class Partition {
    private KnowledgeBase relevantPartition;
    private KnowledgeBase irrelevantPartition;
    private KnowledgeBase classicalStatements;
    private KnowledgeBase knowledgeBase;
    // Initialised so callers that build a Partition via the no-args
    // constructor (e.g. PartitionUsingPowersetImpl) can call
    // getTraceSteps().add(...) immediately without a null check.
    private List<PartitionStep> traceSteps = new ArrayList<>();

    /**
     * Converts this Partition instance to a PartitionDTO for data transfer,
     * flattening every KnowledgeBase field down to a plain list of formula strings.
     * @return PartitionDTO The DTO representation of this Partition
     */
    public PartitionDTO toDTO() {
        List<PartitionStepDTO> traceStepsDTO = this.traceSteps != null
                ? this.traceSteps.stream().map(PartitionStep::toDTO).collect(Collectors.toList())
                : new ArrayList<>();
        return new PartitionDTO(
                this.relevantPartition != null ? this.relevantPartition.toStringList() : new ArrayList<>(),
                this.irrelevantPartition != null ? this.irrelevantPartition.toStringList() : new ArrayList<>(),
                this.classicalStatements != null ? this.classicalStatements.toStringList() : new ArrayList<>(),
                this.knowledgeBase != null ? this.knowledgeBase.toStringList() : new ArrayList<>(),
                traceStepsDTO
        );
    }
}
