package com.pdr.models;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;
@Data
@AllArgsConstructor
@NoArgsConstructor
public class Justification {
    private List<String> relevantPartition;
    private List<String> irrelevantPartition;
    private List<String> classicalStatements;
    private List<String> knowledgeBase;
    // Initialised so callers that build a Justification via the no-args
    // constructor (e.g. JustificationUsingPowersetImpl) can call
    // getTraceSteps().add(...) immediately without a null check.
    private List<JustificationStep> traceSteps = new ArrayList<>();
}
