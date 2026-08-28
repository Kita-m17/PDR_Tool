package com.pdr.services;
/*
 * Original Author: Liam De Saldanha , Honours Project (2026), University of Cape Town
 *
 * Context: Used in PDR project for testing basic relevant closure.
 * Purpose: Educational use only.
 */
import com.pdr.models.BaseRank;
import com.pdr.models.Entailment;
import com.pdr.models.KnowledgeBase;
import com.pdr.models.RelevantEntailment;
import com.pdr.utils.DefeasibleParser;
import org.assertj.core.api.AssertionsForInterfaceTypes;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import static org.assertj.core.api.AssertionsForInterfaceTypes.assertThat;

import static org.junit.jupiter.api.Assertions.*;

class BasicRelevantReasonerImplTest {
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
        ReasonerService reasoner = new BasicRelevantReasonerImpl(partitionService, fixedKbService);

        Entailment result = reasoner.getEntailment(baseRank, parser.parseFormula("(kittens~|!wild)"));
        assertThat(result.getEntailed()).isFalse();
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
        ReasonerService reasoner = new BasicRelevantReasonerImpl(partitionService, fixedKbService);

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
        ReasonerService reasoner = new BasicRelevantReasonerImpl(partitionService, fixedKbService);

        Entailment result = reasoner.getEntailment(baseRank, parser.parseFormula("(penguin~|flies)"));
        assertThat(result.getEntailed()).isFalse();
    }

    @Test
    @DisplayName("Steve Wang Example robins~>wings")
    void TestWeakJustificationExample1() throws Exception {
        KnowledgeBase kb = parser.parseFormulas("(penguins=>birds)," +
                "(robins=>birds)," +
                "(specialpenguins=>penguins)," +
                "(birds~>fly)," +
                "(birds~>wings)," +
                "(penguins~>!fly)," +
                "(specialpenguins~>fly)");
        BaseRank baseRank = new BaseRankServiceImp().constructBaseRank(kb);

        KnowledgeBaseService fixedKbService = new KnowledgeBaseService() {
            public KnowledgeBase getKnowledgeBase() { return kb; }
            public BaseRank getBaseRank() { return baseRank; }
            public void setKnowledgeBase(KnowledgeBase newKb) {}
        };

        PartitionService partitionService = new PartitionUsingPowersetImpl();
        ReasonerService reasoner = new BasicRelevantReasonerImpl(partitionService, fixedKbService);

        RelevantEntailment result = (RelevantEntailment) reasoner.getEntailment(baseRank, parser.parseFormula("(robins~|wings)"));
        assertThat(result.getEntailed()).isTrue();
        assertThat(result.getWeakJustification()).containsExactly("(birds~|wings)","(robins=>birds)");

    }

    @Test
    @DisplayName("Steve Wang Example penguins~>wings")

    void TestWeakJustificationExample2() throws Exception {
        KnowledgeBase kb = parser.parseFormulas("(penguins=>birds)," +
                "(robins=>birds)," +
                "(specialpenguins=>penguins)," +
                "(birds~>fly)," +
                "(birds~>wings)," +
                "(penguins~>!fly)," +
                "(specialpenguins~>fly)");
        BaseRank baseRank = new BaseRankServiceImp().constructBaseRank(kb);

        KnowledgeBaseService fixedKbService = new KnowledgeBaseService() {
            public KnowledgeBase getKnowledgeBase() { return kb; }
            public BaseRank getBaseRank() { return baseRank; }
            public void setKnowledgeBase(KnowledgeBase newKb) {}
        };

        PartitionService partitionService = new PartitionUsingPowersetImpl();
        ReasonerService reasoner = new BasicRelevantReasonerImpl(partitionService, fixedKbService);

        RelevantEntailment result = (RelevantEntailment) reasoner.getEntailment(baseRank, parser.parseFormula("(penguins~|wings)"));

        assertThat(result.getEntailed()).isTrue();
        assertThat(result.getWeakJustification()).containsExactly("(penguins=>birds)","(birds~|wings)");

    }

    @Test
    @DisplayName("Steve Wang Example specialpenguins~>fly")
    void TestWeakJustificationExample3() throws Exception {
        KnowledgeBase kb = parser.parseFormulas("(penguins=>birds)," +
                "(robins=>birds)," +
                "(specialpenguins=>penguins)," +
                "(birds~>fly)," +
                "(birds~>wings)," +
                "(penguins~>!fly)," +
                "(specialpenguins~>fly)");
        BaseRank baseRank = new BaseRankServiceImp().constructBaseRank(kb);

        KnowledgeBaseService fixedKbService = new KnowledgeBaseService() {
            public KnowledgeBase getKnowledgeBase() { return kb; }
            public BaseRank getBaseRank() { return baseRank; }
            public void setKnowledgeBase(KnowledgeBase newKb) {}
        };

        PartitionService partitionService = new PartitionUsingPowersetImpl();
        ReasonerService reasoner = new BasicRelevantReasonerImpl(partitionService, fixedKbService);

        RelevantEntailment result = (RelevantEntailment) reasoner.getEntailment(baseRank, parser.parseFormula("(specialpenguins~>fly)"));
        assertThat(result.getEntailed()).isTrue();
        assertThat(result.getWeakJustification()).containsExactly("(specialpenguins~|fly)");
    }
    @Test
    @DisplayName("Chipo Hamayobe Example (kittens~|!wild)")
    void TestWeakJustificationExample4() throws Exception {
        KnowledgeBase kb = parser.parseFormulas("(pets=>animals),(kittens=>cats), (cats~|trainable), (kittens~|!trainable), (animals~|legs), (animals~|wild), (cats=>animals), (cats~|!wild)");
        BaseRank baseRank = new BaseRankServiceImp().constructBaseRank(kb);

        KnowledgeBaseService fixedKbService = new KnowledgeBaseService() {
            public KnowledgeBase getKnowledgeBase() {
                return kb;
            }

            public BaseRank getBaseRank() {
                return baseRank;
            }

            public void setKnowledgeBase(KnowledgeBase newKb) {
            }
        };

        PartitionService partitionService = new PartitionUsingPowersetImpl();
        ReasonerService reasoner = new BasicRelevantReasonerImpl(partitionService, fixedKbService);

        RelevantEntailment result = (RelevantEntailment) reasoner.getEntailment(baseRank, parser.parseFormula("(kittens~|!wild)"));
        assertThat(result.getEntailed()).isFalse();
        AssertionsForInterfaceTypes.assertThat(result.getWeakJustification()).isEmpty();
    }
}