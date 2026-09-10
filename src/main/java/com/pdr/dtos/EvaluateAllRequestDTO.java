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

// Request body for POST /api/entailment/evaluate-all - the query to check, and
// which of the 4 algorithms ("rational", "lexicographic", "basic relevant",
// "minimal relevant") to evaluate it under.
@Data
@AllArgsConstructor
@NoArgsConstructor
public class EvaluateAllRequestDTO {
    private String query;
    private List<String> algorithms;
}
