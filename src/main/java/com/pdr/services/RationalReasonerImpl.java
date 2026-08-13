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
package com.pdr.services;

import java.util.ArrayList;
import java.util.List;

import org.tweetyproject.logics.pl.reasoner.SatReasoner;
import org.tweetyproject.logics.pl.sat.Sat4jSolver;
import org.tweetyproject.logics.pl.sat.SatSolver;
import org.tweetyproject.logics.pl.syntax.Implication;
import org.tweetyproject.logics.pl.syntax.Negation;
import org.tweetyproject.logics.pl.syntax.PlFormula;

import com.pdr.models.BaseRank;
import com.pdr.models.Entailment;
import com.pdr.models.EntailmentStep;
import com.pdr.models.KnowledgeBase;
import com.pdr.models.Rank;
import com.pdr.models.Ranking;
import com.pdr.models.RationalEntailment;

/**
 * Implementation of the Rational Closure reasoning algorithm
 */
public class RationalReasonerImpl implements ReasonerService {

    private final SatReasoner reasoner; // The SAT reasoner used for entailment checks

    /**
     * Constructor for RationalClosureImpl. Initializes the necessary components for the rational closure reasoning process.
     */
    public RationalReasonerImpl() {
        SatSolver.setDefaultSolver(new Sat4jSolver());
        this.reasoner = new SatReasoner();
    }

    /**
     * Gets the entailment for the given inputs.
     *
     * @param baseRank The base ranking implementation
     * @param queryFormula The query formula
     * @return The entailment result along with the trace
     */
    @Override
    public Entailment getEntailment(BaseRank baseRank, PlFormula queryFormula) {

        // Get inputs
        PlFormula antecedent = ((Implication) queryFormula).getFirstFormula();
        PlFormula negation = new Negation(antecedent);
        KnowledgeBase knowledgeBase = baseRank.getKnowledgeBase();
        Ranking baseRanking = baseRank.getRanking();
        Ranking removedRanking = new Ranking();

        List<EntailmentStep> trace = new ArrayList<>(); // Trace of the entailment process

        //get R_infinity
        Rank infinityRank = baseRanking.getRank(Integer.MAX_VALUE);
        KnowledgeBase r_infinity = new KnowledgeBase(infinityRank.getFormulas());

        //get the finite ranks
        KnowledgeBase finiteRanks = new KnowledgeBase();
        for(Rank rank: baseRanking){
            if(rank.getRankNumber() != Integer.MAX_VALUE)
                finiteRanks = finiteRanks.union(rank.getFormulas());
        }
        
        int i = 0;

        //union of the ranks: R∞ ∪ R
        KnowledgeBase currentUnion = r_infinity.union(finiteRanks);

        //while (R∞ ∪ R) |= ¬α and  R != ∅ do
        while (reasoner.query(currentUnion, negation) && !finiteRanks.isEmpty()) {
            /**
             * This is different for each algorithm - for the rational closure, we remove the entire rank
             */
            Rank toRemove = baseRanking.get(i); //get the current rank to remove
            removedRanking.add(toRemove);

            //add current step to trace
            trace.add(new EntailmentStep(i, currentUnion, true, antecedent + " is exceptional w.r.t. R∞ U R - removing Rank " + i, new KnowledgeBase(toRemove.getFormulas())));

            /** 
             * Remove ranks type 1 - tweety code
             * This will be different for each algorithm
             * ccreate a knowledge base with the ranks to remove and can use the difference() tweety method to remove those formulas
            */
            finiteRanks = finiteRanks.difference( new KnowledgeBase(toRemove.getFormulas())); //remove the curreny rank from the union:  R:=R\Ri
            i++;

            currentUnion = r_infinity.union(finiteRanks);
        }

        boolean entailed = reasoner.query(currentUnion, queryFormula); //check if the query is entailed by the remaining ranks

        // add the final step to trace
        trace.add(new EntailmentStep(i, currentUnion, false, antecedent + " is no longer exceptional, checking R∞ U R |=" + queryFormula, new KnowledgeBase()));


        // return the entailment result along with the trace
        return new RationalEntailment.RationalEntailmentBuilder()
            .withKnowledgeBase(knowledgeBase)
            .withQueryFormula(queryFormula)
            .withBaseRanking(baseRanking)
            .withEntailed(entailed)
            .withTraceSteps(trace)
            .withRemovedRanking(removedRanking)
            .build();
    }
}
