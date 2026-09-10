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
import org.tweetyproject.logics.pl.syntax.PlFormula;

import static org.assertj.core.api.AssertionsForInterfaceTypes.assertThat;

class BasicRelevantReasonerImplTest {
    private final DefeasibleParser parser = new DefeasibleParser();

    @Test
    void getEntailmentExample1() throws Exception {
        KnowledgeBase kb = parser.parseFormulas("(pets=>animals),(kittens=>cats), (cats|~trainable), (kittens|~!trainable), (animals|~legs), (animals|~wild), (cats=>animals), (cats|~!wild)");
        BaseRank baseRank = new BaseRankServiceImp().constructBaseRank(kb);

        KnowledgeBaseService fixedKbService = new KnowledgeBaseService() {
            public KnowledgeBase getKnowledgeBase() { return kb; }
            public BaseRank getBaseRank() { return baseRank; }
            public void setKnowledgeBase(KnowledgeBase newKb) {}
        };

        PartitionService partitionService = new PartitionUsingPowersetImpl(fixedKbService);
        PlFormula query = parser.parseFormula("(kittens|~!wild)");
        partitionService.getPartition(kb,query,false);
        ReasonerService reasoner = new BasicRelevantReasonerImpl(partitionService, fixedKbService);

        Entailment result = reasoner.getEntailment(baseRank, query);
        assertThat(result.getEntailed()).isFalse();
    }

    @Test
    void getEntailmentExample2() throws Exception {
        KnowledgeBase kb = parser.parseFormulas("(bird|~flies),(penguin=>bird),(penguin|~!flies),(bird|~wings)");
        BaseRank baseRank = new BaseRankServiceImp().constructBaseRank(kb);

        KnowledgeBaseService fixedKbService = new KnowledgeBaseService() {
            public KnowledgeBase getKnowledgeBase() { return kb; }
            public BaseRank getBaseRank() { return baseRank; }
            public void setKnowledgeBase(KnowledgeBase newKb) {}
        };

        PartitionService partitionService = new PartitionUsingPowersetImpl(fixedKbService);
        PlFormula query = parser.parseFormula("(penguin|~!flies)");
        partitionService.getPartition(kb, query, false);
        ReasonerService reasoner = new BasicRelevantReasonerImpl(partitionService, fixedKbService);

        Entailment result = reasoner.getEntailment(baseRank, query);
        assertThat(result.getEntailed()).isTrue();
    }
    @Test
    void getEntailmentExample3() throws Exception {
        KnowledgeBase kb = parser.parseFormulas("(bird|~flies),(penguin=>bird),(penguin|~!flies),(bird|~wings)");
        BaseRank baseRank = new BaseRankServiceImp().constructBaseRank(kb);

        KnowledgeBaseService fixedKbService = new KnowledgeBaseService() {
            public KnowledgeBase getKnowledgeBase() { return kb; }
            public BaseRank getBaseRank() { return baseRank; }
            public void setKnowledgeBase(KnowledgeBase newKb) {}
        };

        PartitionService partitionService = new PartitionUsingPowersetImpl(fixedKbService);
        PlFormula query = parser.parseFormula("(penguin|~flies)");
        partitionService.getPartition(kb, query, false);
        ReasonerService reasoner = new BasicRelevantReasonerImpl(partitionService, fixedKbService);

        Entailment result = reasoner.getEntailment(baseRank, query);
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

        PartitionService partitionService = new PartitionUsingPowersetImpl(fixedKbService);
        PlFormula query = parser.parseFormula("(robins|~wings)");
        partitionService.getPartition(kb, query, false);
        ReasonerService reasoner = new BasicRelevantReasonerImpl(partitionService, fixedKbService);

        RelevantEntailment result = (RelevantEntailment) reasoner.getEntailment(baseRank, query);
        assertThat(result.getEntailed()).isTrue();
        assertThat(result.getWeakJustification()).containsExactly("(birds|~wings)","(robins=>birds)");

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

        PartitionService partitionService = new PartitionUsingPowersetImpl(fixedKbService);
        PlFormula query = parser.parseFormula("(penguins|~wings)");
        partitionService.getPartition(kb, query, false);
        ReasonerService reasoner = new BasicRelevantReasonerImpl(partitionService, fixedKbService);

        RelevantEntailment result = (RelevantEntailment) reasoner.getEntailment(baseRank, query);

        assertThat(result.getEntailed()).isTrue();
        assertThat(result.getWeakJustification()).containsExactly("(penguins=>birds)","(birds|~wings)");

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

        PartitionService partitionService = new PartitionUsingPowersetImpl(fixedKbService);
        PlFormula query = parser.parseFormula("(specialpenguins~>fly)");
        partitionService.getPartition(kb, query, false);
        ReasonerService reasoner = new BasicRelevantReasonerImpl(partitionService, fixedKbService);

        RelevantEntailment result = (RelevantEntailment) reasoner.getEntailment(baseRank, query);
        assertThat(result.getEntailed()).isTrue();
        assertThat(result.getWeakJustification()).containsExactly("(specialpenguins|~fly)");
    }
    @Test
    @DisplayName("Chipo Hamayobe Example (kittens|~!wild)")
    void TestWeakJustificationExample4() throws Exception {
        KnowledgeBase kb = parser.parseFormulas("(pets=>animals),(kittens=>cats), (cats|~trainable), (kittens|~!trainable), (animals|~legs), (animals|~wild), (cats=>animals), (cats|~!wild)");
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

        PartitionService partitionService = new PartitionUsingPowersetImpl(fixedKbService);
        PlFormula query = parser.parseFormula("(kittens|~!wild)");
        partitionService.getPartition(kb, query, false);
        ReasonerService reasoner = new BasicRelevantReasonerImpl(partitionService, fixedKbService);

        RelevantEntailment result = (RelevantEntailment) reasoner.getEntailment(baseRank, query);
        assertThat(result.getEntailed()).isFalse();
        AssertionsForInterfaceTypes.assertThat(result.getWeakJustification()).isEmpty();
    }
}