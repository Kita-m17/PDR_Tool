package com.pdr.dtos;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.pdr.models.EntailmentStep;
import com.pdr.models.KnowledgeBase;
import com.pdr.models.Ranking;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import org.tweetyproject.logics.pl.syntax.PlFormula;

import java.util.List;

/*
 * Original Author: Liam De Saldanha , Honours Project (2026), University of Cape Town
 *
 * Context: Used in PDR project for relevant closure reasoning.
 *
 */
@Data
@AllArgsConstructor
@Builder(setterPrefix = "with")
public class EntailmentDTO {
    private List<String> knowledgeBase; // The knowledge base from which the entailment is derived
    private String queryFormula; // The formula being queried for entailment
    private List<RankDTO> baseRanking; // The ranking of the knowledge base used for defeasible reasoning
    private boolean entailed; // Whether the query is entailed
    private List<EntailmentStep> traceSteps; // Trace of the algorithm
}
