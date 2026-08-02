package com.pdr.models;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;
import com.pdr.dtos.BaseRankDTO;
import com.pdr.dtos.RankDTO;
import com.pdr.dtos.BaseRankStepDTO;

public class BaseRank {
    private final KnowledgeBase knowledgeBase;
    private Ranking ranking; //final ranking
    private Ranking sequence; //sequence of ranks generated along the way
    private final int n; //number of finite ranks
    private List<BaseRankStep> traceSteps = new ArrayList<>(); //trace of the algorithm

    // Constructor with explicit components
    public BaseRank(KnowledgeBase knowledgeBase, Ranking sequence, Ranking ranking, int n, List<BaseRankStep> traceSteps) {
        this.sequence = sequence;
        this.ranking = ranking;
        this.knowledgeBase = knowledgeBase;
        this.n = n;
        this.traceSteps = traceSteps;
    }

    /**
     *  Copy constructor
     */
    public BaseRank(BaseRank baseRank) {
        this(baseRank.getKnowledgeBase(), baseRank.getSequence(), baseRank.getRanking(), baseRank.getN(), baseRank.getTraceSteps());
    }

    /**
     * @return Ranking The final ranking of the knowledge base.
     */
    public Ranking getRanking() {
        return ranking;
    }

    /** 
     * @return Ranking The sequence of ranks generated during the construction of the base rank.
     */
    public Ranking getSequence() {
        return sequence;
    }

    /**
     * @return int The number of finite ranks in the final ranking.
     */
    public int getN() {
        return n;
    }

    /**
     * @return KnowledgeBase The original knowledge base.
     */
    public KnowledgeBase getKnowledgeBase() {
        return new KnowledgeBase(knowledgeBase);
    }
    
    /**
     * @return List<TraceStep> The trace of the algorithm, detailing each step of the base rank construction.
     */
    public List<BaseRankStep> getTraceSteps() {
        return traceSteps;
    }

    public BaseRankDTO toDTO(){
        List<RankDTO> sequenceDTO = this.sequence.stream().map(Rank::toDTO).collect(Collectors.toList());
        List<RankDTO> rankingDTO = this.ranking.stream().map(Rank::toDTO).collect(Collectors.toList());
        List<BaseRankStepDTO> traceStepsDTO = this.traceSteps.stream().map(BaseRankStep::toDTO).collect(Collectors.toList());
        return new BaseRankDTO(this.knowledgeBase.toStringList(), sequenceDTO, rankingDTO, traceStepsDTO);
    }   
}
