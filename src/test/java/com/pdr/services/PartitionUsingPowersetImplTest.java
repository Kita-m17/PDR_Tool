package com.pdr.services;
/*
 * Original Author: Liam De Saldanha , Honours Project (2026), University of Cape Town
 *
 * Context: Used in PDR project for testing partition service.
 * Purpose: Educational use only.
 */
import com.pdr.models.KnowledgeBase;
import com.pdr.models.Partition;
import com.pdr.models.PartitionStep;
import com.pdr.utils.DefeasibleParser;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.tweetyproject.logics.pl.syntax.PlFormula;

import java.util.List;

import static org.assertj.core.api.AssertionsForInterfaceTypes.assertThat;

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

        List<PartitionStep> traceSteps = partition.getTraceSteps();

        assertThat(traceSteps).hasSize(8);
        for (int i = 0; i < traceSteps.size(); i++) {
            assertThat(traceSteps.get(i).getId()).isEqualTo(i + 1);
        }

        // Step 1: the empty defeasible combination, unioned with the classical
        // statement (penguin=>bird) that gets added to every combination -
        // never entailed on its own.
        PartitionStep step1 = traceSteps.get(0);
        assertThat(step1.getSet()).containsExactlyInAnyOrder(
                parser.parseFormula("(penguin=>bird)")
        );
        assertThat(step1.isEntailed()).isFalse();
        assertThat(step1.isMinimal()).isFalse();
        assertThat(step1.getMinimalSet()).isEmpty();
        assertThat(step1.getJustificationsSoFar()).isEmpty();

        // Step 6: {(bird~|flies),(penguin~|!flies)} plus the classical statement -
        // the first combination that's both entailed and minimal. For minimal
        // relevant closure, only its lowest-ranked statement, (bird~|flies)
        // (rank 0, vs. (penguin~|!flies) at rank 1), is kept as the justification.
        PartitionStep step6 = traceSteps.get(5);
        assertThat(step6.getSet()).containsExactlyInAnyOrder(
                parser.parseFormula("(bird~|flies)"),
                parser.parseFormula("(penguin~|!flies)"),
                parser.parseFormula("(penguin=>bird)")
        );
        assertThat(step6.isEntailed()).isTrue();
        assertThat(step6.isMinimal()).isTrue();
        assertThat(step6.getMinimalSet()).containsExactlyInAnyOrder(
                parser.parseFormula("(bird~|flies)")
        );
        assertThat(step6.getJustificationsSoFar()).hasSize(1);
        assertThat(step6.getJustificationsSoFar().get(0)).containsExactlyInAnyOrder(
                parser.parseFormula("(bird~|flies)")
        );

        // Step 8: the full combination - entailed, but not minimal, since it's a
        // superset of step 6's justification ((bird~|flies)) - so it contributes
        // nothing new to the running justification list.
        PartitionStep step8 = traceSteps.get(7);
        assertThat(step8.getSet()).containsExactlyInAnyOrderElementsOf(knowledgeBase);
        assertThat(step8.isEntailed()).isTrue();
        assertThat(step8.isMinimal()).isFalse();
        assertThat(step8.getMinimalSet()).isEmpty();
        assertThat(step8.getJustificationsSoFar()).hasSize(1);
        assertThat(step8.getJustificationsSoFar().get(0)).containsExactlyInAnyOrder(
                parser.parseFormula("(bird~|flies)")
        );

        // Cross-check: the running justification list on the final step, unioned
        // and stripped of classical statements, should reconstruct the relevant
        // partition already asserted above.
        KnowledgeBase unionOfJustifications1 = new KnowledgeBase();
        for (KnowledgeBase justification : traceSteps.get(traceSteps.size() - 1).getJustificationsSoFar()) {
            unionOfJustifications1 = unionOfJustifications1.union(justification);
        }
        assertThat(unionOfJustifications1.difference(partition.getClassicalStatements()))
                .containsExactlyInAnyOrderElementsOf(partition.getRelevantPartition());
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

        // --- Trace step assertions ---
        List<PartitionStep> traceSteps = partition.getTraceSteps();

        assertThat(traceSteps).hasSize(8);
        for (int i = 0; i < traceSteps.size(); i++) {
            assertThat(traceSteps.get(i).getId()).isEqualTo(i + 1);
            // Basic relevant closure never reduces to a lowest-rank statement -
            // minimalSet is only populated for minimal relevant closure.
            assertThat(traceSteps.get(i).getMinimalSet()).isEmpty();
        }

        // Step 1: the empty defeasible combination, unioned with the classical
        // statement (penguin=>bird).
        PartitionStep step1 = traceSteps.get(0);
        assertThat(step1.getSet()).containsExactlyInAnyOrder(
                parser.parseFormula("(penguin=>bird)")
        );
        assertThat(step1.isEntailed()).isFalse();
        assertThat(step1.isMinimal()).isFalse();
        assertThat(step1.getJustificationsSoFar()).isEmpty();

        // Step 6: {(bird~|flies),(penguin~|!flies)} plus the classical statement -
        // the first combination that's both entailed and minimal. Unlike minimal
        // relevant closure, basic relevant closure keeps the WHOLE combination
        // (including the classical statement) as the justification.
        PartitionStep step6 = traceSteps.get(5);
        assertThat(step6.getSet()).containsExactlyInAnyOrder(
                parser.parseFormula("(bird~|flies)"),
                parser.parseFormula("(penguin~|!flies)"),
                parser.parseFormula("(penguin=>bird)")
        );
        assertThat(step6.isEntailed()).isTrue();
        assertThat(step6.isMinimal()).isTrue();
        assertThat(step6.getJustificationsSoFar()).hasSize(1);
        assertThat(step6.getJustificationsSoFar().get(0)).containsExactlyInAnyOrder(
                parser.parseFormula("(bird~|flies)"),
                parser.parseFormula("(penguin~|!flies)"),
                parser.parseFormula("(penguin=>bird)")
        );

        // Step 8: the full combination - entailed, but not minimal, since it's a
        // superset of step 6's justification.
        PartitionStep step8 = traceSteps.get(7);
        assertThat(step8.getSet()).containsExactlyInAnyOrderElementsOf(knowledgeBase);
        assertThat(step8.isEntailed()).isTrue();
        assertThat(step8.isMinimal()).isFalse();
        assertThat(step8.getJustificationsSoFar()).hasSize(1);
        assertThat(step8.getJustificationsSoFar().get(0)).containsExactlyInAnyOrder(
                parser.parseFormula("(bird~|flies)"),
                parser.parseFormula("(penguin~|!flies)"),
                parser.parseFormula("(penguin=>bird)")
        );

        // Cross-check: the running justification list on the final step, unioned
        // and stripped of classical statements, should reconstruct the relevant
        // partition already asserted above.
        KnowledgeBase unionOfJustifications2 = new KnowledgeBase();
        for (KnowledgeBase justification : traceSteps.get(traceSteps.size() - 1).getJustificationsSoFar()) {
            unionOfJustifications2 = unionOfJustifications2.union(justification);
        }
        assertThat(unionOfJustifications2.difference(partition.getClassicalStatements()))
                .containsExactlyInAnyOrderElementsOf(partition.getRelevantPartition());
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

        // --- Trace step assertions ---
        // 5 defeasible formulas -> 2^5 = 32 combinations checked, ids 1..32 in
        // order. Not hand-verifying every combination's entailment here (that's
        // already covered in the smaller Example1 tests) - instead checking the
        // structural invariants that must hold regardless of which combinations
        // turn out entailed/minimal.
        List<PartitionStep> traceSteps = partition.getTraceSteps();
        assertThat(traceSteps).hasSize(32);
        for (int i = 0; i < traceSteps.size(); i++) {
            assertThat(traceSteps.get(i).getId()).isEqualTo(i + 1);
        }

        // Step 1 is always the empty defeasible combination, i.e. just the
        // classical statements that get added to every combination.
        assertThat(traceSteps.get(0).getSet()).containsExactlyInAnyOrder(
                parser.parseFormula("(pets=>animals)"),
                parser.parseFormula("(kittens=>cats)"),
                parser.parseFormula("(cats=>animals)")
        );
        assertThat(traceSteps.get(0).isEntailed()).isFalse();

        // The last step is always the full combination - every defeasible
        // statement plus the classical statements, i.e. the whole knowledge base.
        assertThat(traceSteps.get(31).getSet()).containsExactlyInAnyOrderElementsOf(knowledgeBase);

        // Cross-check: the running justification list on the final step, unioned
        // and stripped of classical statements, should reconstruct the relevant
        // partition already asserted above.
        KnowledgeBase unionOfJustifications3 = new KnowledgeBase();
        for (KnowledgeBase justification : traceSteps.get(traceSteps.size() - 1).getJustificationsSoFar()) {
            unionOfJustifications3 = unionOfJustifications3.union(justification);
        }
        assertThat(unionOfJustifications3.difference(partition.getClassicalStatements()))
                .containsExactlyInAnyOrderElementsOf(partition.getRelevantPartition());
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

        // --- Trace step assertions ---
        List<PartitionStep> traceSteps = partition.getTraceSteps();
        assertThat(traceSteps).hasSize(32);
        for (int i = 0; i < traceSteps.size(); i++) {
            assertThat(traceSteps.get(i).getId()).isEqualTo(i + 1);
            // Basic relevant closure never reduces to a lowest-rank statement -
            // minimalSet is only populated for minimal relevant closure.
            assertThat(traceSteps.get(i).getMinimalSet()).isEmpty();
        }

        assertThat(traceSteps.get(0).getSet()).containsExactlyInAnyOrder(
                parser.parseFormula("(pets=>animals)"),
                parser.parseFormula("(kittens=>cats)"),
                parser.parseFormula("(cats=>animals)")
        );
        assertThat(traceSteps.get(0).isEntailed()).isFalse();

        assertThat(traceSteps.get(31).getSet()).containsExactlyInAnyOrderElementsOf(knowledgeBase);

        // Cross-check: the running justification list on the final step, unioned
        // and stripped of classical statements, should reconstruct the relevant
        // partition already asserted above.
        KnowledgeBase unionOfJustifications4 = new KnowledgeBase();
        for (KnowledgeBase justification : traceSteps.get(traceSteps.size() - 1).getJustificationsSoFar()) {
            unionOfJustifications4 = unionOfJustifications4.union(justification);
        }
        assertThat(unionOfJustifications4.difference(partition.getClassicalStatements()))
                .containsExactlyInAnyOrderElementsOf(partition.getRelevantPartition());
    }


}