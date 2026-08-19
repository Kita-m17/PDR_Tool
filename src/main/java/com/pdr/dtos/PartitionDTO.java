package com.pdr.dtos;

import java.util.List;

// Data Transfer Object (DTO) for the full Partition result (relevant closure)
public class PartitionDTO {
    public List<String> relevantPartition;
    public List<String> irrelevantPartition;
    public List<String> classicalStatements;
    public List<String> knowledgeBase;
    public List<PartitionStepDTO> traceSteps; // trace of the algorithm

    /**
     * Default Constructor
     */
    public PartitionDTO() {}

    /**
     * Parameterised Constructor
     */
    public PartitionDTO(List<String> relevantPartition, List<String> irrelevantPartition,
            List<String> classicalStatements, List<String> knowledgeBase, List<PartitionStepDTO> traceSteps) {
        this.relevantPartition = relevantPartition;
        this.irrelevantPartition = irrelevantPartition;
        this.classicalStatements = classicalStatements;
        this.knowledgeBase = knowledgeBase;
        this.traceSteps = traceSteps;
    }

    public List<String> getRelevantPartition() {
        return relevantPartition;
    }

    public void setRelevantPartition(List<String> relevantPartition) {
        this.relevantPartition = relevantPartition;
    }

    public List<String> getIrrelevantPartition() {
        return irrelevantPartition;
    }

    public void setIrrelevantPartition(List<String> irrelevantPartition) {
        this.irrelevantPartition = irrelevantPartition;
    }

    public List<String> getClassicalStatements() {
        return classicalStatements;
    }

    public void setClassicalStatements(List<String> classicalStatements) {
        this.classicalStatements = classicalStatements;
    }

    public List<String> getKnowledgeBase() {
        return knowledgeBase;
    }

    public void setKnowledgeBase(List<String> knowledgeBase) {
        this.knowledgeBase = knowledgeBase;
    }

    public List<PartitionStepDTO> getTraceSteps() {
        return traceSteps;
    }

    public void setTraceSteps(List<PartitionStepDTO> traceSteps) {
        this.traceSteps = traceSteps;
    }
}
