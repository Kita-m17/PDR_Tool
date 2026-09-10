package com.pdr.dtos;
/*
 * Original Author: Liam De Saldanha , Honours Project (2026), University of Cape Town
 *
 * Context: Used in PDR project for the combined "evaluate all algorithms" endpoint.
 * Purpose: Educational use only.
 */
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

// Response body for POST /api/entailment/evaluate-all. baseRank is computed
// once (it's already cached in KnowledgeBaseService, not recomputed per
// algorithm) and shared by every entry in results.
@Data
@AllArgsConstructor
@NoArgsConstructor
public class EvaluateAllResponseDTO {
    private BaseRankDTO baseRank;
    private List<AlgorithmEvaluationDTO> results;
}
