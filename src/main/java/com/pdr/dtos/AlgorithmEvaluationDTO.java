package com.pdr.dtos;
/*
 * Original Author: Liam De Saldanha , Honours Project (2026), University of Cape Town
 *
 * Context: Used in PDR project for the combined "evaluate all algorithms" endpoint.
 * Purpose: Educational use only.
 */
import com.pdr.models.Entailment;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

// One algorithm's result within an EvaluateAllResponseDTO - the entailment result
// (serialized the same way the single-algorithm /api/entailment/{reasoner}
// endpoint already does, via Entailment's own @JsonProperty getters) plus, for
// Basic/Minimal Relevant Closure only, the partition it was computed from.
// Null for Rational and Lexicographic Closure, which have no partition step.
@Data
@AllArgsConstructor
@NoArgsConstructor
public class AlgorithmEvaluationDTO {
    private String algorithm;
    private Entailment entailment;
    private PartitionDTO partition;
}
