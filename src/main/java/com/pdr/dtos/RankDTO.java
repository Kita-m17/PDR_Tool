package com.pdr.dtos;

import java.util.List;

//Data Transfer Object (DTO) for the rank trace
public class RankDTO {
    private int rankNumber;// the rank number

    private List<String> knowledgeBase; //the formulas from the knowledge base that belong to this rank

    /**
     * Default Constructor
     */
    public RankDTO(){}

    /**
     * Parameterised Constructor
     * @param rankNumber
     * @param kb
     */
    public RankDTO(int rankNumber, List<String> knowledgeBase){
        this.rankNumber = rankNumber;
        this.knowledgeBase = knowledgeBase;
    }
    
    /**
     * @return int rank number
     */
    public int getRankNumber(){
        return this.rankNumber;
    }

    /**
     * @param rankNumber
     */
    public void setRankNumber(int rankNumber){
        this.rankNumber = rankNumber;
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
    
}
