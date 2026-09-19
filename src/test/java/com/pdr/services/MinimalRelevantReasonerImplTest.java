package com.pdr.services;
/*
 * Original Author: Liam De Saldanha , Honours Project (2026), University of Cape Town
 *
 * Context: Used in PDR project for testing minimal relevant closure.
 * Purpose: Educational use only.
 */
import com.pdr.models.*;
import com.pdr.utils.DefeasibleParser;
import org.tweetyproject.logics.pl.syntax.PlFormula;
import org.assertj.core.api.AssertionsForInterfaceTypes;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.AssertionsForClassTypes.assertThat;

class MinimalRelevantReasonerImplTest {
    private final DefeasibleParser parser = new DefeasibleParser();
    PartitionService partitionService = new PartitionUsingHittingSetTree();

    @Test
    void getEntailmentExample1() throws Exception {
        KnowledgeBase kb = parser.parseFormulas("(pets=>animals),(kittens=>cats), (cats|~trainable), (kittens|~!trainable), (animals|~legs), (animals|~wild), (cats=>animals), (cats|~!wild)");
        BaseRank baseRank = new BaseRankServiceImp().constructBaseRank(kb);


        PlFormula query = parser.parseFormula("(kittens|~!wild)");
        Partition partition = partitionService.getPartition(kb, query,baseRank, true);
        ReasonerService reasoner = new MinimalRelevantReasonerImpl(partition, kb);
        Entailment result = reasoner.getEntailment(baseRank, query);
        assertThat(result.getEntailed()).isTrue();
    }

    @Test
    void getEntailmentExample2() throws Exception {
        KnowledgeBase kb = parser.parseFormulas("(bird|~flies),(penguin=>bird),(penguin|~!flies),(bird|~wings)");
        BaseRank baseRank = new BaseRankServiceImp().constructBaseRank(kb);


        PlFormula query = parser.parseFormula("(penguin|~!flies)");
        Partition partition = partitionService.getPartition(kb, query,baseRank, true);
        ReasonerService reasoner = new MinimalRelevantReasonerImpl(partition, kb);
        Entailment result = reasoner.getEntailment(baseRank, query);
        assertThat(result.getEntailed()).isTrue();
    }
    @Test
    void getEntailmentExample3() throws Exception {
        KnowledgeBase kb = parser.parseFormulas("(bird|~flies),(penguin=>bird),(penguin|~!flies),(bird|~wings)");
        BaseRank baseRank = new BaseRankServiceImp().constructBaseRank(kb);

        PlFormula query = parser.parseFormula("(penguin|~flies)");
        Partition partition = partitionService.getPartition(kb, query,baseRank, true);
        ReasonerService reasoner = new MinimalRelevantReasonerImpl(partition, kb);
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


        PlFormula query = parser.parseFormula("(robins|~wings)");
        Partition partition = partitionService.getPartition(kb, query,baseRank, true);
        ReasonerService reasoner = new MinimalRelevantReasonerImpl(partition, kb);
        RelevantEntailment result = (RelevantEntailment) reasoner.getEntailment(baseRank, query);
        assertThat(result.getEntailed()).isTrue();
        AssertionsForInterfaceTypes.assertThat(result.getWeakJustification()).containsExactly("(birds|~wings)","(robins=>birds)");

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


        PlFormula query = parser.parseFormula("(penguins|~wings)");
        Partition partition = partitionService.getPartition(kb, query,baseRank, true);
        ReasonerService reasoner = new MinimalRelevantReasonerImpl(partition, kb);
        RelevantEntailment result = (RelevantEntailment) reasoner.getEntailment(baseRank, query);

        assertThat(result.getEntailed()).isTrue();
        AssertionsForInterfaceTypes.assertThat(result.getWeakJustification()).containsExactly("(penguins=>birds)","(birds|~wings)");

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


        PlFormula query = parser.parseFormula("(specialpenguins~>fly)");
        Partition partition = partitionService.getPartition(kb, query,baseRank, true);
        ReasonerService reasoner = new MinimalRelevantReasonerImpl(partition, kb);
        RelevantEntailment result = (RelevantEntailment) reasoner.getEntailment(baseRank, query);
        assertThat(result.getEntailed()).isTrue();
        AssertionsForInterfaceTypes.assertThat(result.getWeakJustification()).containsExactly("(specialpenguins|~fly)");
    }

    @Test
    @DisplayName("Chipo Hamayobe Example (kittens|~!wild)")
    void TestWeakJustificationExample4() throws Exception {
        KnowledgeBase kb = parser.parseFormulas("(pets=>animals),(kittens=>cats), (cats|~trainable), (kittens|~!trainable), (animals|~legs), (animals|~wild), (cats=>animals), (cats|~!wild)");
        BaseRank baseRank = new BaseRankServiceImp().constructBaseRank(kb);


        PlFormula query = parser.parseFormula("(kittens|~!wild)");
        Partition partition = partitionService.getPartition(kb, query,baseRank, true);
        ReasonerService reasoner = new MinimalRelevantReasonerImpl(partition, kb);
        RelevantEntailment result = (RelevantEntailment) reasoner.getEntailment(baseRank, query);
        assertThat(result.getEntailed()).isTrue();
        AssertionsForInterfaceTypes.assertThat(result.getWeakJustification()).containsExactly("(cats|~!wild)","(kittens=>cats)");
    }

}