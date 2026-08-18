/**
 * File: LexicographicReasonerImpl.java
 * Package: com.pdr.services
 *
 * Original Author: Samukelisiwe Zwane(2026 Honours Project, University of Cape Town)
 * Reference: LexC - LexicographicClosure algorithm Chipo Hamayobe and Thabo Vincent Moloi's LexicalReasonerImpl (2024).
 *
 * Status: New - sub-knowledge base approach with algorithm trace.
 * Context: Used in PDR's project for lexicographic closure reasoning.
 * Purpose: Educational use only.
 */
package com.pdr.services;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

import org.tweetyproject.logics.pl.reasoner.SatReasoner;
import org.tweetyproject.logics.pl.sat.Sat4jSolver;
import org.tweetyproject.logics.pl.sat.SatSolver;
import org.tweetyproject.logics.pl.syntax.Conjunction;
import org.tweetyproject.logics.pl.syntax.Disjunction;
import org.tweetyproject.logics.pl.syntax.Implication;
import org.tweetyproject.logics.pl.syntax.Negation;
import org.tweetyproject.logics.pl.syntax.PlFormula;
import org.tweetyproject.logics.pl.syntax.Tautology;

import com.pdr.models.BaseRank;
import com.pdr.models.Entailment;
import com.pdr.models.EntailmentStep;
import com.pdr.models.KnowledgeBase;
import com.pdr.models.LexicographicEntailment;
import com.pdr.models.LexicographicStep;
import com.pdr.models.Rank;
import com.pdr.models.Ranking;
import com.pdr.models.SubKnowledgeBaseCheck;

/**
 * Implementation of the Lexicographic Closure reasoning algorithm, using the
 * sub-knowledge base approach.
 *
 * <pre>
 *  Algorithm 3.5. LexC - LexicographicClosure
 *    Input : a defeasible knowledge base K and a defeasible query a |~ b
 *    Output: true if K entails the query under Lexicographic Closure
 *
 *  1  (R0,...,Rn-1,R_inf,n) := BaseRank(K)
 *  2  R := union of R0 ... Rn-1                  (everything except R_inf)
 *  3  i := 0
 *  4  m := 0
 *  5  while R_inf u R |= !a and R != {} do
 *  6      R := R \ Ri                            (take the current rank out)
 *  7      m := |Ri| - 1                          (start by dropping one statement)
 *  8      Ri,m := OR over X in Subsets(Ri,m) of (AND over x in X of x)
 *  9      while R_inf u R u {Ri,m} |= !a and m &gt; 0 do
 * 10          m := m - 1
 * 11          Ri,m := OR over X in Subsets(Ri,m) of (AND over x in X of x)
 * 12      end
 * 13      R := R u {Ri,m}                        (put the weakened rank back)
 * 14      i := i + 1
 * 15  end
 * 16  return R_inf u R |= a -&gt; b
 * </pre>
 */

public class LexicographicReasonerImpl implements ReasonerService {

    private final SatReasoner reasoner; 
    public LexicographicReasonerImpl() {
        SatSolver.setDefaultSolver(new Sat4jSolver());
        this.reasoner = new SatReasoner();
    }

    @Override
    public Entailment getEntailment(BaseRank baseRank, PlFormula queryFormula) {
        PlFormula antecedent = ((Implication) queryFormula).getFirstFormula();
        PlFormula negation = new Negation(antecedent);
        PlFormula materialisedQuery = KnowledgeBase.materialise(queryFormula);

        KnowledgeBase knowledgeBase = baseRank.getKnowledgeBase();
        Ranking baseRanking = baseRank.getRanking();

        Ranking removedRanking = new Ranking();
        Ranking weakenedRanking = new Ranking();

        List<LexicographicStep> lexicographicSteps = new ArrayList<>();
        List<EntailmentStep> trace = new ArrayList<>();

        Rank rankInf = baseRanking.getRank(Integer.MAX_VALUE);
        KnowledgeBase rankInfKB = materialise(rankInf.getFormulas());

        List<Rank> finiteRanks = new ArrayList<>();
        for (Rank rank : baseRanking) {
            if (rank.getRankNumber() != Integer.MAX_VALUE) {
                finiteRanks.add(rank);
            }
        }
        finiteRanks.sort(Comparator.comparingInt(Rank::getRankNumber));

        KnowledgeBase r = new KnowledgeBase();
        for (Rank rank : finiteRanks) {
            r = r.union(materialise(rank.getFormulas()));
        }

        int i = 0;

        // Exits when the antecedent stops being refuted or contradicts the strict statements 
        while (i < finiteRanks.size() && entails(rankInfKB.union(r), negation)) {
            Rank currentRank = finiteRanks.get(i);
            KnowledgeBase originalRank = new KnowledgeBase(currentRank.getFormulas());
            List<PlFormula> rankFormulas = orderedFormulas(currentRank.getFormulas());

            // Line 6: R := R \ Ri removes Ri from the other ranks  
            r = r.difference(new KnowledgeBase(rankFormulas));
            KnowledgeBase otherRanks = rankInfKB.union(r);
            List<SubKnowledgeBaseCheck> subKBs = new ArrayList<>();

            // |Ri| - 1
            int m = rankFormulas.size() - 1;

            PlFormula combined = buildCombinedFormula(currentRank.getRankNumber(), rankFormulas, m,otherRanks, negation, subKBs);

            // check antecedent with agaignst subknowledge bases
            boolean stillRefuted = entails(otherRanks.union(single(combined)), negation);

            while (stillRefuted && m > 0) {
                // get rid of 1 statement at a time
                m--;
                combined = buildCombinedFormula(currentRank.getRankNumber(), rankFormulas, m, otherRanks, negation, subKBs);
                stillRefuted = entails(otherRanks.union(single(combined)), negation);
            }

            // tracing
            boolean rankRemoved = (m == 0);
            String reason;

            if (rankRemoved) {
                removedRanking.add(new Rank(currentRank.getRankNumber(), originalRank));
                reason = antecedent + " is refuted in every sub-knowledge base of Rank "
                + currentRank.getRankNumber() + " - removing Rank " + currentRank.getRankNumber();
            } else {
                weakenedRanking.add(new Rank(currentRank.getRankNumber(), List.of(combined)));
                r = r.union(single(combined));
                reason = "Rank " + currentRank.getRankNumber() + " weakened to " + combined + " - " + antecedent + " is no longer refuted";
            }

            KnowledgeBase remainingAfter = rankInfKB.union(r);

            // Detailed trace entry for this rank.
            lexicographicSteps.add(new LexicographicStep(i, currentRank.getRankNumber(), originalRank,otherRanks, subKBs, m, rankRemoved ? null : combined, rankRemoved,new KnowledgeBase(remainingAfter), reason));

            // Generic trace entry, same shape RationalReasonerImpl produces.
            trace.add(new EntailmentStep(i, new KnowledgeBase(remainingAfter), true, reason, rankRemoved ? originalRank : new KnowledgeBase()));

            i++;
        }

        KnowledgeBase finalKnowledgeBase = rankInfKB.union(r);
        boolean entailed = entails(finalKnowledgeBase, materialisedQuery);

        // For the trace only: the query asked of each surviving sub-knowledge base
        // separately. The result is true only if it holds in all of them - which is what
        // the single check above already computes, since the combined formula is a
        // disjunction. Showing them individually is what makes that claim inspectable, and
        // it is the structure the justification work builds on.
        List<SubKnowledgeBaseCheck> finalChecks = buildFinalChecks(lexicographicSteps, rankInfKB, r,
                materialisedQuery);

        trace.add(new EntailmentStep(i, new KnowledgeBase(finalKnowledgeBase), false,
                antecedent + " is no longer refuted, checking R∞ ∪ R |= " + materialisedQuery,
                new KnowledgeBase()));

        return new LexicographicEntailment.LexicographicEntailmentBuilder()
                .withWeakenedRanking(weakenedRanking)
                .withFinalChecks(finalChecks)
                .withLexicographicSteps(lexicographicSteps)
                .withKnowledgeBase(knowledgeBase)
                .withQueryFormula(queryFormula)
                .withBaseRanking(baseRanking)
                .withRemovedRanking(removedRanking)
                .withEntailed(entailed)
                .withTraceSteps(trace)
                .build();
    }

    // =================================================================================
    // Helpers
    // =================================================================================

    
    //  Builds every subset as a sub-knowledge base check against {@code context}, and returns the disjunction of their conjunctions.
    private PlFormula buildCombinedFormula(int rankNumber, List<PlFormula> rankFormulas, int m, KnowledgeBase otherRanks, PlFormula negation, List<SubKnowledgeBaseCheck> subKBs) {
        List<List<PlFormula>> subsets = subsetsOfSize(rankFormulas, m);
        List<PlFormula> disjuncts = new ArrayList<>();

        for (List<PlFormula> subset : subsets) {
            KnowledgeBase subKnowledgeBase = otherRanks.union(new KnowledgeBase(subset));
            boolean refuted = entails(subKnowledgeBase, negation);
            subKBs.add(new SubKnowledgeBaseCheck(rankNumber, m, rankFormulas.size(), subset,subKnowledgeBase, negation, refuted));
            disjuncts.add(toConjunction(subset));
        }

        return toDisjunction(disjuncts);
    }

    
    private List<SubKnowledgeBaseCheck> buildFinalChecks(List<LexicographicStep> steps,KnowledgeBase rankInfKB, KnowledgeBase r, PlFormula materialisedQuery) {
        List<SubKnowledgeBaseCheck> finalChecks = new ArrayList<>();
        KnowledgeBase finalKnowledgeBase = rankInfKB.union(r);
        // Find the last step that actually weakened a rank, if there was one.
        LexicographicStep weakenedStep = null;
        for (LexicographicStep step : steps) {
            if (!step.isRankRemoved()) {
                weakenedStep = step;
            }
        }

        if (weakenedStep == null) {
            // rational closure
            finalChecks.add(new SubKnowledgeBaseCheck(Integer.MAX_VALUE, 0, 0, List.of(), finalKnowledgeBase, materialisedQuery, entails(finalKnowledgeBase, materialisedQuery)));
            return finalChecks;
        }

        // ********************Otherwise re-form the sub-knowledge bases at the winning subset size and ask each one the query. The overall answer is true only if every one of them says yes.
        for (SubKnowledgeBaseCheck check : weakenedStep.getsubKBs()) {
            if (check.getSubsetSize() != weakenedStep.getFinalSubsetSize()) {
                continue; // skip the sizes that were rejected
            }
            KnowledgeBase subKnowledgeBase = check.getSubKnowledgeBase();
            finalChecks.add(new SubKnowledgeBaseCheck(check.getRankNumber(), check.getSubsetSize(),
                    check.getRankSize(), check.getSubset(), subKnowledgeBase, materialisedQuery,
                    entails(subKnowledgeBase, materialisedQuery)));
        }

        return finalChecks;
    }

    /**
     * Every subset of exactly {@code m} formulas, in a stable order.
     *
     * <p>A subset of an n element list is an n bit number: bit j means "formula j is in".
     * Counting from 0 to 2^n - 1 enumerates every subset, and Integer.bitCount gives its
     * size, so keeping the numbers whose bit count is m gives exactly what is wanted. This
     * is the same technique as the 2024 weakenRank(), except the subsets are returned
     * rather than immediately collapsed, so the trace can show them.</p>
     *
     * <p>For m = 0 this returns one empty subset, which is correct: dropping every
     * statement is a single way of doing it.</p>
     *
     * @param formulas The formulas to choose from
     * @param m        The subset size
     * @return List of subsets, each an ordered list
     */
    private List<List<PlFormula>> subsetsOfSize(List<PlFormula> formulas, int m) {
        List<List<PlFormula>> subsets = new ArrayList<>();
        int n = formulas.size();

        for (int bitmask = 0; bitmask < (1 << n); bitmask++) {
            if (Integer.bitCount(bitmask) != m) {
                continue;
            }
            List<PlFormula> subset = new ArrayList<>();
            for (int j = 0; j < n; j++) {
                if ((bitmask & (1 << j)) != 0) {
                    subset.add(formulas.get(j));
                }
            }
            subsets.add(subset);
        }

        return subsets;
    }

    // Joins a subset with AND.
    private PlFormula toConjunction(List<PlFormula> formulas) {
        if (formulas.isEmpty()) {
            return new Tautology();
        }
        // A one element conjunction is the formula itself - avoids pointless brackets.
        return formulas.size() == 1 ? formulas.get(0) : new Conjunction(formulas);
    }

    //Joins the conjunctions with OR to give Ri,m.
    private PlFormula toDisjunction(List<PlFormula> disjuncts) {
        if (disjuncts.isEmpty()) {
            return new Tautology();
        }
        return disjuncts.size() == 1 ? disjuncts.get(0) : new Disjunction(disjuncts);
    }

    // Materialises a knowledge base formula by formula.
    private KnowledgeBase materialise(KnowledgeBase knowledgeBase) {
        KnowledgeBase result = new KnowledgeBase();
        knowledgeBase.forEach(formula -> result.add(KnowledgeBase.materialise(formula)));
        return result;
    }

    //Materialises a rank into a list with a fixed order
    private List<PlFormula> orderedFormulas(KnowledgeBase knowledgeBase) {
        List<PlFormula> formulas = new ArrayList<>();
        knowledgeBase.forEach(formula -> formulas.add(KnowledgeBase.materialise(formula)));
        formulas.sort(Comparator.comparing(PlFormula::toString));
        return formulas;
    }

    //statement to knowledge base
    private KnowledgeBase single(PlFormula formula) {
        KnowledgeBase knowledgeBase = new KnowledgeBase();
        knowledgeBase.add(formula);
        return knowledgeBase;
    }

    // Classical entailment check 
    private boolean entails(KnowledgeBase knowledgeBase, PlFormula formula) {
        return !knowledgeBase.isEmpty() && reasoner.query(knowledgeBase, formula);
    }
}