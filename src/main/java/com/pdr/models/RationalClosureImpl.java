/**
 * File: RationalClosureImpl.java
 * Package: com.pdr.models
 * 
 * Original Author: Thabo Vincent Moloi , Honours Project (2024), University of Cape Town
 * Adapted by: Nikita Martin (2026 Honours Project, University of Cape Town)
 * 
 * Status: Modifies - Trace implementation added
 * Context: Used in PDR's project for rational closure reasoning.
 * Purpose: Educational use only.
 */
package com.pdr.models;

import org.tweetyproject.logics.pl.reasoner.SatReasoner;
import org.tweetyproject.logics.pl.sat.Sat4jSolver;
import org.tweetyproject.logics.pl.sat.SatSolver;
import org.tweetyproject.logics.pl.syntax.Implication;
import org.tweetyproject.logics.pl.syntax.Negation;
import org.tweetyproject.logics.pl.syntax.PlFormula;

import com.pdr.services.ReasonerService;
import java.util.ArrayList;
import java.util.List;

/**
 * Implementation of the Rational Closure reasoning algorithm
 */
public class RationalClosureImpl implements ReasonerService {

    private final SatReasoner reasoner; // The SAT reasoner used for entailment checks

    /**
     * Constructor for RationalClosureImpl. Initializes the necessary components for the rational closure reasoning process.
     */
    public RationalClosureImpl() {
        SatSolver.setDefaultSolver(new Sat4jSolver());
        this.reasoner = new SatReasoner();
    }

    /**
     * Gets the entailment for the given inputs.
     *
     * @param baseRank The base ranking implementation
     * @param queryFormula The query formula
     * @param antecedent The antecedent formula
     * @return The entailment result along with the trace
     */
    @Override
    public Entailment getEntailment(BaseRankImplementation baseRank, PlFormula queryFormula, PlFormula antecedent) {

        // Get inputs
        PlFormula negation = new Negation(((Implication) queryFormula).getFirstFormula());
        KnowledgeBase knowledgeBase = baseRank.getKnowledgeBase();
        Ranking baseRanking = baseRank.getRanking();
        Ranking removedRanking = new Ranking();

        List<EntailmentStep> trace = new ArrayList<>(); // Trace of the entailment process

        // create a union of all the ranks in the base ranking
        KnowledgeBase union = new KnowledgeBase();
        baseRanking.forEach(rank -> {
            union.addAll(rank.getFormulas());
        });

        int i = 0;

        //while (R∞ ∪ R) |= ¬α and  R̸= ∅ do
        while (!union.isEmpty() && reasoner.query(union, negation) && i < baseRanking.size() - 1) {
            Rank toRemove = baseRanking.get(i); //get the current rank to remove

            //add current step to trace
            trace.add(new EntailmentStep(i, new KnowledgeBase(union), true, antecedent + " is exceptional w.r.t. " + union + " - removing Rank " + i, new KnowledgeBase(toRemove.getFormulas())));

            removedRanking.add(toRemove);
            union.removeAll(toRemove.getFormulas()); //remove the curreny rank from the union:  R:=R\Ri
            i++;
        }

        boolean entailed = !union.isEmpty() && reasoner.query(union, queryFormula); //check if the query is entailed by the remaining ranks

        // add the final step to trace
        trace.add(new EntailmentStep(i, new KnowledgeBase(union), false, antecedent + " is no longer exceptional, checking entailment of " + queryFormula, new KnowledgeBase()));


        // return the entailment result along with the trace
        return new RationalEntailment.RationalEntailmentBuilder()
            .withKnowledgeBase(knowledgeBase)
            .withQueryFormula(queryFormula)
            .withBaseRanking(baseRanking)
            .withEntailed(entailed)
            .withTraceSteps(trace)
            .build();
    }
}
