package com.pdr.models;
/**
 * File: TraceStep.java
 * Package: com.pdr.models
 *
 * Original Author: Nikita Martin, Liam De Saldanha (2026 Honours Project, University of Cape Town)
 * Context: Used in PDR project for the BaseRank algorithm.
 * Purpose: Used for educational purposes
 */
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;
import com.pdr.dtos.BaseRankDTO;
import com.pdr.dtos.RankDTO;
import com.pdr.dtos.BaseRankStepDTO;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@Builder(setterPrefix = "with")
public class BaseRank {
    private final KnowledgeBase knowledgeBase;

    @JsonManagedReference
    private Ranking ranking; //final ranking

    @JsonManagedReference
    private Ranking sequence; //sequence of ranks generated along the way
    
    private final int n; //number of finite ranks
    
    private List<BaseRankStep> traceSteps = new ArrayList<>(); //trace of the algorithm
    private double executionTime;


    public BaseRankDTO toDTO(){
        List<RankDTO> sequenceDTO = this.sequence.stream().map(Rank::toDTO).collect(Collectors.toList());
        List<RankDTO> rankingDTO = this.ranking.stream().map(Rank::toDTO).collect(Collectors.toList());
        List<BaseRankStepDTO> traceStepsDTO = this.traceSteps.stream().filter(step -> !step.getConsideredFormulas().isEmpty() || step.getIteration() == Integer.MAX_VALUE).map(BaseRankStep::toDTO).collect(Collectors.toList());
        return new BaseRankDTO(this.knowledgeBase.toStringList(), sequenceDTO, rankingDTO, traceStepsDTO,this.executionTime);
    }   
}
