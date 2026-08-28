package com.pdr.services;
/*
 * Original Author: Liam De Saldanha , Honours Project (2026), University of Cape Town
 *
 * Context: Used in PDR project for testing partition service.
 * Purpose: Educational use only.
 */
import com.pdr.models.DefeasibleImplication;
import com.pdr.models.KnowledgeBase;
import com.pdr.models.Partition;
import com.pdr.utils.DefeasibleParser;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.tweetyproject.logics.pl.syntax.PlFormula;

import static org.assertj.core.api.AssertionsForInterfaceTypes.assertThat;
import static org.junit.jupiter.api.Assertions.*;

class PartitionUsingPowersetImplTest {
    private final DefeasibleParser parser = new DefeasibleParser();
    @Test
    @DisplayName("Relevant Partition for knowledge base {(bird~|flies),(bird~|wings),(penguin=>bird),(penguin~|!flies)} with query = {(penguin~|!flies)}")
    void getMinimalPartitionExample1() throws Exception {

        KnowledgeBase knowledgeBase = parser.parseFormulas("(bird~|flies),(bird~|wings),(penguin=>bird),(penguin~|!flies)");
        PlFormula query = parser.parseFormula("(penguin~|!flies)");
        boolean isMinimalRelevantClosure = true;
        PartitionService partitionService = new PartitionUsingPowersetImpl();
        Partition partition = partitionService.getPartition(knowledgeBase,query,isMinimalRelevantClosure);
        assertThat(partition.getRelevantPartition()).containsExactlyInAnyOrder(
                parser.parseFormula("(bird~|flies)")
        );
        assertThat(partition.getIrrelevantPartition()).containsExactlyInAnyOrder(
                parser.parseFormula("(penguin~|!flies)"),
                parser.parseFormula("(bird~|wings)"),
                parser.parseFormula("(penguin=>bird)")
        );
    }
    @Test
    void getBasicPartitionExample1() throws Exception {

        KnowledgeBase knowledgeBase = parser.parseFormulas("(bird~|flies),(bird~|wings),(penguin=>bird),(penguin~|!flies)");
        PlFormula query = parser.parseFormula("(penguin~|!flies)");
        boolean isMinimalRelevantClosure = false;
        PartitionService partitionService = new PartitionUsingPowersetImpl();
        Partition partition = partitionService.getPartition(knowledgeBase,query,isMinimalRelevantClosure);
        assertThat(partition.getRelevantPartition()).containsExactlyInAnyOrder(
                parser.parseFormula("(penguin~|!flies)"),
                parser.parseFormula("(bird~|flies)")
        );
        assertThat(partition.getIrrelevantPartition()).containsExactlyInAnyOrder(
                parser.parseFormula("(bird~|wings)"),
                parser.parseFormula("(penguin=>bird)")
        );
    }

    @Test
    void getMinimalPartitionExample2() throws Exception {

        KnowledgeBase knowledgeBase = parser.parseFormulas("(pets=>animals),(kittens=>cats), (cats~|trainable), (kittens~|!trainable), (animals~|legs), (animals~|wild), (cats=>animals), (cats~|!wild)");
        PlFormula query = parser.parseFormula("(kittens~|!wild)");
        boolean isMinimalRelevantClosure = true;
        PartitionService partitionService = new PartitionUsingPowersetImpl();
        Partition partition = partitionService.getPartition(knowledgeBase,query,isMinimalRelevantClosure);
        assertThat(partition.getRelevantPartition()).containsExactlyInAnyOrder(
                parser.parseFormula("(animals~|wild)"),
                parser.parseFormula("(cats~|trainable)")
        );
        assertThat(partition.getIrrelevantPartition()).containsExactlyInAnyOrder(
                parser.parseFormula("(pets=>animals)"),
                parser.parseFormula("(kittens=>cats)"),
                parser.parseFormula("(kittens~|!trainable)"),
                parser.parseFormula("(cats=>animals)"),
                parser.parseFormula("(animals~|legs)"),
                parser.parseFormula("(cats~|!wild)")

        );
    }
    @Test
    void getBasicPartitionExample2() throws Exception {

        KnowledgeBase knowledgeBase = parser.parseFormulas("(pets=>animals),(kittens=>cats), (cats~|trainable), (kittens~|!trainable), (animals~|legs), (animals~|wild), (cats=>animals), (cats~|!wild)");
        PlFormula query = parser.parseFormula("(kittens~|!wild)");
        boolean isMinimalRelevantClosure = false;
        PartitionService partitionService = new PartitionUsingPowersetImpl();
        Partition partition = partitionService.getPartition(knowledgeBase,query,isMinimalRelevantClosure);
        assertThat(partition.getRelevantPartition()).containsExactlyInAnyOrder(
                parser.parseFormula("(animals~|wild)"),
                parser.parseFormula("(cats~|trainable)"),
                parser.parseFormula("(kittens~|!trainable)"),
                parser.parseFormula("(cats~|!wild)")
        );
        assertThat(partition.getIrrelevantPartition()).containsExactlyInAnyOrder(
                parser.parseFormula("(pets=>animals)"),
                parser.parseFormula("(kittens=>cats)"),
                parser.parseFormula("(cats=>animals)"),
                parser.parseFormula("(animals~|legs)")

        );
    }

    @Test
    void getPowerSets() {
    }
}