package com.pdr.dtos;

import java.util.List;

// Data Transfer Object (DTO) for the base rank trace
public class BaseRankDTO {
    public List<String> knowledgeBase; //get the formulas in the knowledge base
    public List<RankDTO> sequence; //sequence of ranks
    public List<RankDTO> ranking; //final ranking of the formulas
    public List<BaseRankStepDTO> traceSteps; //trace of the algorithm

    /**
     * Default Constructor
     */
    public BaseRankDTO(){}

    /**
     * Parameterised Constructor
     * @param knowledgeBase
     * @param sequence
     * @param ranking
     * @param traceSteps
     */
    public BaseRankDTO(List<String> knowledgeBase, List<RankDTO> sequence, List<RankDTO> ranking, List<BaseRankStepDTO> traceSteps){
        this.knowledgeBase = knowledgeBase;
        this.sequence = sequence;
        this.ranking = ranking;
        this.traceSteps = traceSteps;
    }

    /**
     * @return List<String> knowledge base
     */
    public List<String> getKnowledgeBase(){
        return this.knowledgeBase;
    }

    /**
     * @param knowledgeBase
     */
    public void setKnowledgeBase(List<String> knowledgeBase){
        this.knowledgeBase = knowledgeBase;
    }

    /**
     * @return List<RankDTO> sequence
     */
    public List<RankDTO> getSequence(){
        return this.sequence;
    }

    /**
     * @param sequence
     */
    public void setSequence(List<RankDTO> sequence){
        this.sequence = sequence;
    }

    /**
     * @return List<RankDTO> ranking
     */
    public List<RankDTO> getRanking(){
        return this.ranking;
    }

    /**
     * @param ranking
     */
    public void setRanking(List<RankDTO> ranking){
        this.ranking = ranking;
    }

    /**
     * @return List<BaseRankStepDTO> trace steps
     */
    public List<BaseRankStepDTO> getTraceSteps(){
        return this.traceSteps;
    }

    /**
     * @param traceSteps
     */
    public void setTraceSteps(List<BaseRankStepDTO> traceSteps){
        this.traceSteps = traceSteps;
    }
}