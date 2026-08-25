package com.pdr.services;

import com.pdr.models.BaseRank;
import com.pdr.models.Entailment;
import com.pdr.models.KnowledgeBase;
import com.pdr.utils.DefeasibleParser;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.AssertionsForClassTypes.assertThat;
import static org.junit.jupiter.api.Assertions.*;

class MinimalRelevantReasonerImplTest {
    private final DefeasibleParser parser = new DefeasibleParser();

    @Test
    void getEntailmentExample1() throws Exception {
        KnowledgeBase kb = parser.parseFormulas("(pets=>animals),(kittens=>cats), (cats~|trainable), (kittens~|!trainable), (animals~|legs), (animals~|wild), (cats=>animals), (cats~|!wild)");
        BaseRank baseRank = new BaseRankServiceImp().constructBaseRank(kb);

        KnowledgeBaseService fixedKbService = new KnowledgeBaseService() {
            public KnowledgeBase getKnowledgeBase() { return kb; }
            public BaseRank getBaseRank() { return baseRank; }
            public void setKnowledgeBase(KnowledgeBase newKb) {}
        };

        PartitionService partitionService = new PartitionUsingPowersetImpl();
        ReasonerService reasoner = new MinimalRelevantReasonerImpl(partitionService, fixedKbService);

        Entailment result = reasoner.getEntailment(baseRank, parser.parseFormula("(kittens~|!wild)"));
        assertThat(result.getEntailed()).isTrue();
    }

    @Test
    void getEntailmentExample2() throws Exception {
        KnowledgeBase kb = parser.parseFormulas("(bird~|flies),(penguin=>bird),(penguin~|!flies),(bird~|wings)");
        BaseRank baseRank = new BaseRankServiceImp().constructBaseRank(kb);

        KnowledgeBaseService fixedKbService = new KnowledgeBaseService() {
            public KnowledgeBase getKnowledgeBase() { return kb; }
            public BaseRank getBaseRank() { return baseRank; }
            public void setKnowledgeBase(KnowledgeBase newKb) {}
        };

        PartitionService partitionService = new PartitionUsingPowersetImpl();
        ReasonerService reasoner = new MinimalRelevantReasonerImpl(partitionService, fixedKbService);

        Entailment result = reasoner.getEntailment(baseRank, parser.parseFormula("(penguin~|!flies)"));
        assertThat(result.getEntailed()).isTrue();
    }
    @Test
    void getEntailmentExample3() throws Exception {
        KnowledgeBase kb = parser.parseFormulas("(bird~|flies),(penguin=>bird),(penguin~|!flies),(bird~|wings)");
        BaseRank baseRank = new BaseRankServiceImp().constructBaseRank(kb);

        KnowledgeBaseService fixedKbService = new KnowledgeBaseService() {
            public KnowledgeBase getKnowledgeBase() { return kb; }
            public BaseRank getBaseRank() { return baseRank; }
            public void setKnowledgeBase(KnowledgeBase newKb) {}
        };

        PartitionService partitionService = new PartitionUsingPowersetImpl();
        ReasonerService reasoner = new MinimalRelevantReasonerImpl(partitionService, fixedKbService);

        Entailment result = reasoner.getEntailment(baseRank, parser.parseFormula("(penguin~|flies)"));
        assertThat(result.getEntailed()).isFalse();
    }
}