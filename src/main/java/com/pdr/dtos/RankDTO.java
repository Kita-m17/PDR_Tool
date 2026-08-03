package com.pdr.dtos;

import java.util.List;

//Data Transfer Object (DTO) for the rank trace
public class RankDTO {
    private int rankNumber;// the rank number
    private String rankName; //the name of the rank (e.g., "R0", "R1", etc.)
    private List<String> knowledgeBase; //the formulas from the knowledge base that belong to this rank

    /**
     * Default Constructor
     */
    public RankDTO(){}

    /**
     * Parameterised Constructor
     * @param rankNumber
     * @param knowledgeBase
     */
    public RankDTO(int rankNumber, List<String> knowledgeBase){
        this.rankNumber = rankNumber;
        if (rankNumber == Integer.MAX_VALUE) {
            this.rankName = "∞"; // Representing the infinite rank
        } else {
            this.rankName = "" + rankNumber; // Representing finite ranks as R0, R1, R2, ...
        }
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
     * @return String rank name
     */
    public String getRankName(){
        return this.rankName;
    }

    /**
     * @param rankName
     */
    public void setRankName(String rankName){
        this.rankName = rankName;
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
