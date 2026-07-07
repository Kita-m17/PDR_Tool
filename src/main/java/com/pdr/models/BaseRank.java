package com.pdr.models;

import java.util.ArrayList;
import java.util.List;
import org.springframework.stereotype.Service;

@Service
public class BaseRank {

    /**
        * Algorithm1.BaseRank 
           Input: A knowledge base K 
           Output: An ordered tuple (R0,...,Rn−1,R∞,n) 
        1  i:=0; 
        2  E0 := − →K; 
        3  repeat 
        4  Ei+1 := { α → β ∈ Ei | Ei |= ¬α}; 
        5  Ri := Ei\Ei+1; 
        6  i := i+1; 
        7  until Ei−1 = Ei; 
        8  R∞ := Ei−1; 
        9  if Ei−1 = ∅then 
        10    n := i−1; 
        11 else 
        12    n := i; 
        13 return (R0,...,Rn−1,R∞,n)
    */

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
}
