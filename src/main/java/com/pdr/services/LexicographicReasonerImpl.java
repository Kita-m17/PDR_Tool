/**
 * File: LexicographicReasonerImpl.java
 * Package: com.pdr.services
 *
 * Original Author: Samukelisiwe Zwane(2026 Honours Project, University of Cape Town)
 * Reference: LexC - LexicographicClosure algorithm Chipo Hamayobe and Thabo Vincent Moloi's LexicalReasonerImpl (2024).
 *
 * Context: Used in PDR's project for lexicographic closure reasoning.
 */
package com.pdr.services;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

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

public class LexicographicReasonerImpl implements ReasonerService {

    // Weakening a rank enumerates its subsets, so the work doubles with every extra
    // statement in that rank. Twenty caps the worst case at about a million subsets
    private static final int MAX_RANK_SIZE = 20;

    private final SatReasoner reasoner;
    public LexicographicReasonerImpl() {
        SatSolver.setDefaultSolver(new Sat4jSolver());
        this.reasoner = new SatReasoner();
    }

    @Override
    public Entailment getEntailment(BaseRank baseRank, PlFormula queryFormula) {
        long startTime = System.nanoTime();
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
        // Lexicographic Closure Algorithm
        // Exits when the antecedent stops being refuted or contradicts the strict statements 
        while (i < finiteRanks.size() && entails(rankInfKB.union(r), negation)) {
            Rank currentRank = finiteRanks.get(i);
            KnowledgeBase originalRank = new KnowledgeBase(currentRank.getFormulas());
            List<PlFormula> rankFormulas = orderedFormulas(currentRank.getFormulas());

            if (rankFormulas.size() > MAX_RANK_SIZE) {
                throw new IllegalArgumentException(
                        "Lexicographic Closure cannot weaken Rank " + currentRank.getRankNumber()
                        + ": it has " + rankFormulas.size() + " statements and the limit is "
                        + MAX_RANK_SIZE + ". Weakening a rank tests its subsets one size at a time,"
                        + " so the work doubles with every extra statement in the rank.");
            }

            // R := R \ Ri removes Ri from the other ranks
            r = r.difference(new KnowledgeBase(rankFormulas));
            KnowledgeBase otherRanks = rankInfKB.union(r);
            List<SubKnowledgeBaseCheck> subKBs = new ArrayList<>();

            // |Ri| - 1
            int m = rankFormulas.size() - 1;

            PlFormula combined = buildCombinedFormula(currentRank.getRankNumber(), rankFormulas, m,otherRanks, negation, subKBs);

            // check antecedent agaignst subknowledge bases
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
                reason = "Every sub-knowledge base of Rank " + currentRank.getRankNumber()
                        + " still refutes " + antecedent + ", so Rank " + currentRank.getRankNumber() + " is removed.";
            } else {
                weakenedRanking.add(new Rank(currentRank.getRankNumber(), List.of(combined)));
                r = r.union(single(combined));
                reason = "Rank " + currentRank.getRankNumber() + " is weakened to " + combined
                        + ", and " + antecedent + " is no longer refuted.";
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

    
        List<SubKnowledgeBaseCheck> finalChecks = buildFinalChecks(lexicographicSteps, rankInfKB, r,
                materialisedQuery);

        trace.add(new EntailmentStep(i, new KnowledgeBase(finalKnowledgeBase), false,
                antecedent + " is no longer refuted, so we check whether R∞ ∪ R entails " + materialisedQuery + ".",
                new KnowledgeBase()));

        // The justification is worked out after the clock has stopped
        long endTime = System.nanoTime();
        double closureExecutionTime = (double) (endTime - startTime) / 1_000_000_000.0;
        KnowledgeBase weakJustification = computeWeakJustification(finalKnowledgeBase, materialisedQuery, entailed, knowledgeBase);

        return new LexicographicEntailment.LexicographicEntailmentBuilder()
                .withWeakenedRanking(weakenedRanking)
                .withWeakJustification(weakJustification)
                .withFinalChecks(finalChecks)
                .withLexicographicSteps(lexicographicSteps)
                .withKnowledgeBase(knowledgeBase)
                .withQueryFormula(queryFormula)
                .withBaseRanking(baseRanking)
                .withRemovedRanking(removedRanking)
                .withEntailed(entailed)
                .withTraceSteps(trace)
                .withBaseRankExecutionTime(baseRank.getExecutionTime())
                .withClosureExecutionTime(closureExecutionTime)
                .build();
    }

    
    
    // Helpers

    /**
     * The smallest justification for the query in the knowledge base that survived
     * the weakening loop, computed with the same service as relevant closure
     */
    private KnowledgeBase computeWeakJustification(KnowledgeBase finalKnowledgeBase, PlFormula materialisedQuery, boolean entailed, KnowledgeBase originalKnowledgeBase) {
        if (!entailed) {
            return new KnowledgeBase();
        }
        List<KnowledgeBase> justifications = ClassicalJustificationService.computeJustification(finalKnowledgeBase, materialisedQuery);
        KnowledgeBase smallest = new KnowledgeBase();
        int smallestSize = Integer.MAX_VALUE;
        for (KnowledgeBase justification : justifications) {
            if (justification.size() < smallestSize) {
                smallestSize = justification.size();
                smallest = justification;
            }
        }
        return presentJustification(smallest, originalKnowledgeBase);
    }

    //Rewrites a justification in original notation, that once materialised, a defeasible statement is indistinguishable from classical implication
    private KnowledgeBase presentJustification(KnowledgeBase justification, KnowledgeBase originalKnowledgeBase) {
        Map<String, PlFormula> byMaterialised = new HashMap<>();
        originalKnowledgeBase.forEach(formula -> byMaterialised.put(KnowledgeBase.materialise(formula).toString(), formula));
        KnowledgeBase result = new KnowledgeBase();
        justification.forEach(formula -> result.add(byMaterialised.getOrDefault(formula.toString(), formula)));

        return result;
    }

    // Builds Ri,m into one disjunction.
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
        
        // Only the surviving subsets are asked. 
        for (SubKnowledgeBaseCheck check : weakenedStep.getSurvivingsubKBs()) {
            KnowledgeBase subKnowledgeBase = check.getSubKnowledgeBase();
            finalChecks.add(new SubKnowledgeBaseCheck(check.getRankNumber(), check.getSubsetSize(),
                    check.getRankSize(), check.getSubset(), subKnowledgeBase, materialisedQuery,
                    entails(subKnowledgeBase, materialisedQuery)));
        }

        return finalChecks;
    }

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

    //formula to knowledge base
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