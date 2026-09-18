/*
 * File: RationalReasonerImpTest.java
 * Original Author: Nikita Martin (PDR Honours Project (University of Cape Town 2026))
 * Context: Used in PDR project for testing Rational Closure.
 * Purpose: Educational use only.
 */
package com.pdr.services;

import com.pdr.models.BaseRank;
import com.pdr.models.Entailment;
import com.pdr.models.EntailmentStep;
import com.pdr.models.KnowledgeBase;
import com.pdr.models.RationalEntailment;
import com.pdr.utils.DefeasibleParser;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.tweetyproject.logics.pl.syntax.PlFormula;

import java.util.List;
import java.util.stream.Collectors;

import static org.assertj.core.api.Assertions.assertThat;

class RationalReasonerImplTest {
    private final DefeasibleParser parser = new DefeasibleParser();

    @Test
    @DisplayName("Directly asserted defeasible fact is entailed")
    void getEntailmentExample1() throws Exception {
        KnowledgeBase kb = parser.parseFormulas("(bird|~flies),(penguin=>bird),(penguin|~!flies),(bird|~wings)");
        BaseRank baseRank = new BaseRankServiceImp().constructBaseRank(kb);
        PlFormula query = parser.parseFormula("(penguin|~!flies)");

        ReasonerService reasoner = new RationalReasonerImpl();
        Entailment result = reasoner.getEntailment(baseRank, query);

        assertThat(result.getEntailed()).isTrue();
    }

    @Test
    @DisplayName("Overridden default property is not entailed")
    void getEntailmentExample2() throws Exception {
        KnowledgeBase kb = parser.parseFormulas("(bird|~flies),(penguin=>bird),(penguin|~!flies),(bird|~wings)");
        BaseRank baseRank = new BaseRankServiceImp().constructBaseRank(kb);
        PlFormula query = parser.parseFormula("(penguin|~flies)");

        ReasonerService reasoner = new RationalReasonerImpl();
        Entailment result = reasoner.getEntailment(baseRank, query);

        assertThat(result.getEntailed()).isFalse();
    }

    @Test
    @DisplayName("The Drowning Problem: unrelated fact sharing a rank is lost")
    void getEntailmentDrowningProblem() throws Exception {
        KnowledgeBase kb = parser.parseFormulas("(bird|~flies),(bird|~wings),(penguin=>bird),(penguin|~!flies)");
        BaseRank baseRank = new BaseRankServiceImp().constructBaseRank(kb);
        PlFormula query = parser.parseFormula("(penguin|~wings)");

        ReasonerService reasoner = new RationalReasonerImpl();
        Entailment result = reasoner.getEntailment(baseRank, query);

        // bird|~wings shares Rank 0 with bird|~flies. Removing the rank to resolve the penguin/flying conflict also removes wings, even though nothing challenged it - this is RC's known limitation.
        assertThat(result.getEntailed()).isFalse();
    }

    @Test
    @DisplayName("The Drowning Problem: the whole exceptional rank is removed, culprit and unrelated/innocent together")
    void getEntailmentDrowningProblemRemovedRanking() throws Exception {
        KnowledgeBase kb = parser.parseFormulas("(bird|~flies),(bird|~wings),(penguin=>bird),(penguin|~!flies)");
        BaseRank baseRank = new BaseRankServiceImp().constructBaseRank(kb);
        PlFormula query = parser.parseFormula("(penguin|~wings)");

        ReasonerService reasoner = new RationalReasonerImpl();
        RationalEntailment result = (RationalEntailment) reasoner.getEntailment(baseRank, query);

        List<String> removedFormulas = result.getRemovedRanking().stream().flatMap(rank -> rank.getFormulas().toStringList().stream()).collect(Collectors.toList());

        assertThat(removedFormulas).containsExactlyInAnyOrder("(bird|~flies)", "(bird|~wings)");
    }

    @Test
    @DisplayName("Rockhopper example - exceptionality justification is the smallest unsat core")
    void getEntailmentJustification() throws Exception {
        KnowledgeBase kb = parser.parseFormulas(
            "(bird|~hasWings),(animal|~moves),(bird|~flies),(bird=>animal)," +
            "(penguin|~swims),(penguin|~!flies),(penguin=>bird)," +
            "(rockhopper|~!swims),(rockhopper|~hasYellowFeathers),(rockhopper=>penguin)"
        );
        BaseRank baseRank = new BaseRankServiceImp().constructBaseRank(kb);
        PlFormula query = parser.parseFormula("(rockhopper|~!swims)");

        ReasonerService reasoner = new RationalReasonerImpl();
        Entailment result = reasoner.getEntailment(baseRank, query);

        EntailmentStep exceptionalStep = result.getTraceSteps().stream().filter(EntailmentStep::isAntecedentExceptional).findFirst().orElseThrow();

        // The smaller "swimming chain" justification, not the larger/ "flying chain" one - this is exactly the case causef the min-size justification fix.
        assertThat(exceptionalStep.getJustification().toStringList()).containsExactlyInAnyOrder("(rockhopper=>penguin)", "(penguin|~swims)", "(rockhopper|~!swims)");
    }

    @Test
    @DisplayName("Weak justification is populated on the final entailed step")
    void getEntailmentWeakJustification() throws Exception {
        KnowledgeBase kb = parser.parseFormulas("(bird|~flies),(penguin=>bird),(penguin|~!flies),(bird|~wings)");
        BaseRank baseRank = new BaseRankServiceImp().constructBaseRank(kb);
        PlFormula query = parser.parseFormula("(penguin|~!flies)");

        ReasonerService reasoner = new RationalReasonerImpl();
        Entailment result = reasoner.getEntailment(baseRank, query);

        EntailmentStep finalStep = result.getTraceSteps().get(result.getTraceSteps().size() - 1);

        assertThat(finalStep.getWeakJustification()).isNotNull();
        assertThat(finalStep.getWeakJustification().toStringList()).isNotEmpty();
    }

    @Test
    @DisplayName("Weak justification is empty when the query is not entailed")
    void getEntailmentWeakJustificationEmptyWhenNotEntailed() throws Exception {
        KnowledgeBase kb = parser.parseFormulas("(bird|~flies),(penguin=>bird),(penguin|~!flies),(bird|~wings)");
        BaseRank baseRank = new BaseRankServiceImp().constructBaseRank(kb);
        PlFormula query = parser.parseFormula("(penguin|~flies)");

        ReasonerService reasoner = new RationalReasonerImpl();
        Entailment result = reasoner.getEntailment(baseRank, query);

        assertThat(result.getEntailed()).isFalse();
        EntailmentStep finalStep = result.getTraceSteps().get(result.getTraceSteps().size() - 1);
        assertThat(finalStep.getWeakJustification().toStringList()).isEmpty();
    }
}