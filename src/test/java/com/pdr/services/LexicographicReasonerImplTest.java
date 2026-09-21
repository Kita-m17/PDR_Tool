package com.pdr.services;
/*
 * Original Author: Samukelisiwe Zwane, Honours Project (2026), University of Cape Town
 *
 * AI was used to assist making this class
 * Context: Used in PDR project for testing lexicographic closure.
 * Purpose: Educational use only.
 */
import com.pdr.models.BaseRank;
import com.pdr.models.Entailment;
import com.pdr.models.KnowledgeBase;
import com.pdr.models.LexicographicEntailment;
import com.pdr.models.LexicographicStep;
import com.pdr.models.SubKnowledgeBaseCheck;
import com.pdr.utils.DefeasibleParser;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.tweetyproject.logics.pl.syntax.PlFormula;

import java.util.List;
import java.util.stream.Collectors;

import static org.assertj.core.api.Assertions.assertThat;

class LexicographicReasonerImplTest {
    private final DefeasibleParser parser = new DefeasibleParser();

    private static final String DROWNING_KB =
            "(bird|~flies),(bird|~wings),(penguin=>bird),(penguin|~!flies)";

    private static final String GARFIELD_KB =
            "(cat|~active),(cat|~likesMondays),(cat|~hasFur),(garfield=>cat)," +
            "(garfield|~!active),(garfield|~!likesMondays)";

    private LexicographicEntailment lexicographic(String knowledgeBaseString, String queryString) throws Exception {
        KnowledgeBase kb = parser.parseFormulas(knowledgeBaseString);
        BaseRank baseRank = new BaseRankServiceImp().constructBaseRank(kb);
        PlFormula query = parser.parseFormula(queryString);
        return (LexicographicEntailment) new LexicographicReasonerImpl().getEntailment(baseRank, query);
    }

    private Entailment rational(String knowledgeBaseString, String queryString) throws Exception {
        KnowledgeBase kb = parser.parseFormulas(knowledgeBaseString);
        BaseRank baseRank = new BaseRankServiceImp().constructBaseRank(kb);
        PlFormula query = parser.parseFormula(queryString);
        return new RationalReasonerImpl().getEntailment(baseRank, query);
    }

    @Test
    @DisplayName("Antecedent is not exceptional, so nothing is weakened")
    void getEntailmentNonExceptionalAntecedent() throws Exception {
        LexicographicEntailment result = lexicographic(DROWNING_KB, "(bird|~flies)");

        assertThat(result.getEntailed()).isTrue();

        assertThat(result.getLexicographicSteps()).isEmpty();
        assertThat(result.getWeakenedRanking()).isEmpty();
        assertThat(result.getRemovedRanking()).isEmpty();

        assertThat(result.getFinalChecks()).hasSize(1);
        assertThat(result.getFinalChecks().get(0).getRankNumber()).isEqualTo(Integer.MAX_VALUE);
        assertThat(result.getFinalChecks().get(0).getHolds()).isTrue();

        assertThat(result.getTraceSteps()).hasSize(1);
    }

    @Test
    @DisplayName("Exceptional antecedent keeps its own defeasible statement")
    void getEntailmentExceptionalAntecedent() throws Exception {
        assertThat(lexicographic(DROWNING_KB, "(penguin|~!flies)").getEntailed()).isTrue();
    }

    @Test
    @DisplayName("The negation of an entailed query is not itself entailed")
    void getEntailmentNegatedQueryNotEntailed() throws Exception {
        assertThat(lexicographic(DROWNING_KB, "(penguin|~flies)").getEntailed()).isFalse();
    }

    @Test
    @DisplayName("Query about a proposition absent from the knowledge base is not entailed")
    void getEntailmentUnrelatedProposition() throws Exception {
        assertThat(lexicographic(DROWNING_KB, "(penguin|~swims)").getEntailed()).isFalse();
    }

    @Test
    @DisplayName("Drowning problem: RC drops penguin|~wings, LC keeps it")
    void getEntailmentRecoversDrownedStatement() throws Exception {
        assertThat(rational(DROWNING_KB, "(penguin|~wings)").getEntailed()).isFalse();
        assertThat(lexicographic(DROWNING_KB, "(penguin|~wings)").getEntailed()).isTrue();
    }

    @Test
    @DisplayName("Drowning problem: weakening rank 0 keeps the subset containing bird|~wings")
    void getEntailmentWeakensRatherThanRemoves() throws Exception {
        LexicographicEntailment result = lexicographic(DROWNING_KB, "(penguin|~wings)");

        assertThat(result.getLexicographicSteps()).hasSize(1);

        LexicographicStep step = result.getLexicographicSteps().get(0);
        assertThat(step.getIteration()).isEqualTo(0);
        assertThat(step.getRankNumber()).isEqualTo(0);
        assertThat(step.isRankRemoved()).isFalse();
        assertThat(step.getCombinedFormula()).isNotNull();

        assertThat(step.getOriginalRank()).hasSize(2);
        assertThat(step.getFinalSubsetSize()).isEqualTo(1);

        assertThat(subsetChecksOfSize(step, 1)).hasSize(2);
        assertThat(step.getSurvivingsubKBs()).hasSize(1);
        assertThat(step.getSurvivingsubKBs().get(0).getSubsetStrings())
                .containsExactly("(bird=>wings)");

        assertThat(result.getWeakenedRanking()).hasSize(1);
        assertThat(result.getRemovedRanking()).isEmpty();
        assertThat(result.getWeakenedRanking().get(0).getRankNumber()).isEqualTo(0);
    }

    @Test
    @DisplayName("A single-statement rank is dropped")
    void getEntailmentRemovesSingleStatementRank() throws Exception {
        String kb = "(bird|~flies),(penguin=>bird),(penguin|~!flies)";
        LexicographicEntailment result = lexicographic(kb, "(penguin|~!flies)");

        assertThat(result.getEntailed()).isTrue();
        assertThat(result.getLexicographicSteps()).hasSize(1);

        LexicographicStep step = result.getLexicographicSteps().get(0);
        assertThat(step.isRankRemoved()).isTrue();
        assertThat(step.getFinalSubsetSize()).isEqualTo(0);
        assertThat(step.getCombinedFormula()).isNull();
        assertThat(step.getSurvivingsubKBs()).isEmpty();

        assertThat(result.getRemovedRanking()).hasSize(1);
        assertThat(result.getRemovedRanking().get(0).getRankNumber()).isEqualTo(0);
        assertThat(result.getWeakenedRanking()).isEmpty();

        assertThat(result.getFinalChecks()).hasSize(1);
        assertThat(result.getFinalChecks().get(0).getRankNumber()).isEqualTo(Integer.MAX_VALUE);
    }

    @Test
    @DisplayName("Garfield: RC discards garfield|~hasFur, while LC keeps it")
    void getEntailmentGarfieldHasFur() throws Exception {
        assertThat(rational(GARFIELD_KB, "(garfield|~hasFur)").getEntailed()).isFalse();
        assertThat(lexicographic(GARFIELD_KB, "(garfield|~hasFur)").getEntailed()).isTrue();
    }

    @Test
    @DisplayName("Garfield: the exceptional statements about Garfield still hold")
    void getEntailmentGarfieldExceptions() throws Exception {
        assertThat(lexicographic(GARFIELD_KB, "(garfield|~!active)").getEntailed()).isTrue();
        assertThat(lexicographic(GARFIELD_KB, "(garfield|~!likesMondays)").getEntailed()).isTrue();
        assertThat(lexicographic(GARFIELD_KB, "(garfield|~likesMondays)").getEntailed()).isFalse();
    }

    @Test
    @DisplayName("Garfield: ordinary cats are unaffected by Garfield being exceptional")
    void getEntailmentGarfieldOrdinaryCats() throws Exception {
        assertThat(lexicographic(GARFIELD_KB, "(cat|~active)").getEntailed()).isTrue();
        assertThat(lexicographic(GARFIELD_KB, "(cat|~hasFur)").getEntailed()).isTrue();
    }

    @Test
    @DisplayName("Garfield: rank 0 is weakened down to one statement")
    void getEntailmentGarfieldWeakeningStopsAtOne() throws Exception {
        LexicographicEntailment result = lexicographic(GARFIELD_KB, "(garfield|~hasFur)");

        assertThat(result.getLexicographicSteps()).hasSize(1);
        LexicographicStep step = result.getLexicographicSteps().get(0);

        assertThat(step.getRankNumber()).isEqualTo(0);
        assertThat(step.getOriginalRank()).hasSize(3);
        assertThat(step.isRankRemoved()).isFalse();

        assertThat(step.getFinalSubsetSize()).isEqualTo(1);
        assertThat(subsetChecksOfSize(step, 2)).hasSize(3);
        assertThat(subsetChecksOfSize(step, 2)).allMatch(check -> check.getHolds());
        assertThat(subsetChecksOfSize(step, 1)).hasSize(3);

        assertThat(step.getSurvivingsubKBs()).hasSize(1);
        assertThat(step.getSurvivingsubKBs().get(0).getSubsetStrings())
                .containsExactly("(cat=>hasFur)");
    }

    @Test
    @DisplayName("Trace has one entry per weakened rank plus closing entry")
    void getEntailmentTraceShape() throws Exception {
        LexicographicEntailment result = lexicographic(GARFIELD_KB, "(garfield|~hasFur)");

        assertThat(result.getTraceSteps()).hasSize(result.getLexicographicSteps().size() + 1);

        for (int i = 0; i < result.getLexicographicSteps().size(); i++) {
            assertThat(result.getLexicographicSteps().get(i).getIteration()).isEqualTo(i);
            assertThat(result.getTraceSteps().get(i).getIteration()).isEqualTo(i);
        }
    }

    @Test
    @DisplayName("Ranks are processed lowest first, and each is either weakened or removed")
    void getEntailmentRanksProcessedInOrder() throws Exception {
        LexicographicEntailment result = lexicographic(GARFIELD_KB, "(garfield|~hasFur)");

        int previousRank = -1;
        for (LexicographicStep step : result.getLexicographicSteps()) {
            assertThat(step.getRankNumber()).isGreaterThan(previousRank);
            previousRank = step.getRankNumber();

            assertThat(step.isRankRemoved()).isEqualTo(step.getCombinedFormula() == null);
        }

        int weakened = result.getWeakenedRanking().size();
        int removed = result.getRemovedRanking().size();
        assertThat(weakened + removed).isEqualTo(result.getLexicographicSteps().size());
    }

    @Test
    @DisplayName("Every sub-knowledge base check reports the rank it came from")
    void getEntailmentSubKnowledgeBaseChecksAreConsistent() throws Exception {
        LexicographicEntailment result = lexicographic(GARFIELD_KB, "(garfield|~hasFur)");

        for (LexicographicStep step : result.getLexicographicSteps()) {
            assertThat(step.getsubKBs()).isNotEmpty();
            for (SubKnowledgeBaseCheck check : step.getsubKBs()) {
                assertThat(check.getRankNumber()).isEqualTo(step.getRankNumber());
                assertThat(check.getRankSize()).isEqualTo(step.getOriginalRank().size());
                assertThat(check.getSubset()).hasSize(check.getSubsetSize());
                assertThat(check.getSubsetSize()).isLessThan(check.getRankSize());
            }
        }
    }

    @Test
    @DisplayName("Lexicographic Closure never retracts what Rational Closure concluded")
    void getEntailmentExtendsRationalClosure() throws Exception {
        String[] queries = {
                "(penguin|~!flies)", "(penguin|~wings)", "(penguin|~flies)",
                "(bird|~flies)", "(bird|~wings)"
        };

        for (String query : queries) {
            boolean rationalEntails = rational(DROWNING_KB, query).getEntailed();
            boolean lexicographicEntails = lexicographic(DROWNING_KB, query).getEntailed();
            if (rationalEntails) {
                assertThat(lexicographicEntails)
                        .as("LexC should still entail %s", query)
                        .isTrue();
            }
        }
    }

    private List<SubKnowledgeBaseCheck> subsetChecksOfSize(LexicographicStep step, int size) {
        return step.getsubKBs().stream()
                .filter(check -> check.getSubsetSize() == size)
                .collect(Collectors.toList());
    }
}
