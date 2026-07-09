/*
 * File: BaseRankService.java
 * Package: com.pdr.services
 *
 * Original Author: Thabo Vincent Moloi , Honours Project (2024), University of Cape Town
 * Adapted by: Julia Cotterrell (2025 Honours Project, University of Cape Town) University of Cape Town) University of Cape Town)
 * Adapted by: Nikita Martin (2026 Honours Project, University of Cape Town)
 *
 * Status: Modified – Added trace implementation.
 * Context: Used in PDR project for rational closure reasoning.
 * Purpose: Educational use only.
 */

package com.pdr.services;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import org.tweetyproject.logics.pl.reasoner.SatReasoner;
import org.tweetyproject.logics.pl.sat.Sat4jSolver;
import org.tweetyproject.logics.pl.sat.SatSolver;
import org.tweetyproject.logics.pl.syntax.Implication;
import org.tweetyproject.logics.pl.syntax.Negation;
import org.tweetyproject.logics.pl.syntax.PlFormula;
import org.springframework.stereotype.Service;

import com.pdr.models.BaseRank;
import com.pdr.models.BaseRankStep;
import com.pdr.models.ExceptionalityCheck;
import com.pdr.models.KnowledgeBase;
import com.pdr.models.Rank;
import com.pdr.models.Ranking;

@Service
public class BaseRankService {
    /**
        * Algorithm1.BaseRank 
           Input: A knowledge base K 
           Output: An ordered tuple (R0,...,Rn−1,R∞,n) 
        1  i:=0; 
        2  E0 := − →K; 
        3  repeat 
        4  Ei+1 := { α → β ∈ Ei | Ei |= ¬α}; 
        5  Ri := Ei\Ei+1; 
        6  i := i+1; 
        7  until Ei−1 = Ei; 
        8  R∞ := Ei−1; 
        9  if Ei−1 = ∅then 
        10    n := i−1; 
        11 else 
        12    n := i; 
        13 return (R0,...,Rn−1,R∞,n)
    */


    public BaseRankService() {
        // Default constructor
    }
    
    /**
     * Constructs a base rank given a knowledge base.
     * 
     * @param knowledgeBase The knowledge base for which to construct a base rank.
     * @return The constructed base rank.
     */
    public BaseRank constructBaseRank(KnowledgeBase knowledgeBase) {

        // Initialize the SAT solver and reasoner
        SatSolver.setDefaultSolver(new Sat4jSolver());
        SatReasoner reasoner = new SatReasoner();

        // Separate the knowledge base into defeasible and classical parts
        KnowledgeBase[] knowledgeBases = knowledgeBase.separate();
        KnowledgeBase defeasibleKB = knowledgeBases[0];
        KnowledgeBase classicalKB = knowledgeBases[1];

        KnowledgeBase currentKB = defeasibleKB;
        KnowledgeBase previousKB = new KnowledgeBase();

        Ranking ranking = new Ranking();
        Ranking sequence = new Ranking();

        List<BaseRankStep> traceSteps = new ArrayList<>();

        int i = 0;
        while(!previousKB.equals(currentKB)){ //while Ei-1 != Ei
            previousKB = currentKB;
            currentKB = new KnowledgeBase();

            List<ExceptionalityCheck> exceptionalityChecks = new ArrayList<ExceptionalityCheck>();

            //Ei+1:={a-> B ∈Ei |Ei |=¬a};
            KnowledgeBase exceptionals = getExceptionals(previousKB, classicalKB, reasoner, i, exceptionalityChecks);

            //Ri := Ei\Ei+1;
            Rank rank = new Rank(); //get new rank

            //add formula to rank
            constructRank(rank, previousKB, currentKB, exceptionals);

            if (!rank.getFormulas().isEmpty()) {
                rank.setRankNumber(i);
                ranking.add(rank); 
            }

            sequence.addRank(previousKB.equals(currentKB) ? Integer.MAX_VALUE : i, previousKB);


            traceSteps.add(new BaseRankStep(i, previousKB, exceptionalityChecks, new KnowledgeBase(rank.getFormulas()), new KnowledgeBase(currentKB)));

            i++;
        }

        // Handle the infinite rank
        int n = currentKB.isEmpty() ? i - 1 : i;

        //the infinite rank - classical statements plus anything not placed in a finite rank
        KnowledgeBase rankInfinityFormulas = classicalKB.union(currentKB);
        ranking.addRank(Integer.MAX_VALUE, rankInfinityFormulas);
        return new BaseRank(knowledgeBase, sequence, ranking, n, traceSteps);
    }

    /**
     * Gets the exceptionals from the previous knowledge base.
     * 
     * @param previousKB
     * @param classical
     * @param reasoner
     * @param i
     * @param exceptionalityChecks
     * @return
     */
    private KnowledgeBase getExceptionals(KnowledgeBase previousKB, KnowledgeBase classical, SatReasoner reasoner, int i, List<ExceptionalityCheck> exceptionalityChecks) {
        
        // Build antecedent -> formulas map
        Map<PlFormula, List<PlFormula>> antecedentMap = new LinkedHashMap<>();
        for (PlFormula formula : previousKB) {
            PlFormula ant = ((Implication) formula).getFirstFormula();
            antecedentMap.computeIfAbsent(ant, k -> new ArrayList<>()).add(formula);
        }

        //Ei+1:={a-> B ∈Ei |Ei |=¬a};
        KnowledgeBase exceptionals = new KnowledgeBase();
        KnowledgeBase materialisedDefeasible = previousKB.materialise();
        KnowledgeBase union = materialisedDefeasible.union(classical);
        
        // check each antecedent for exceptionality and create ExceptionalityCheck objects
        for (Map.Entry<PlFormula, List<PlFormula>> entry : antecedentMap.entrySet()) {
            PlFormula antecedent = entry.getKey();
            PlFormula negatedAntecedent = new Negation(antecedent);
            
            boolean isExceptional = reasoner.query(union, negatedAntecedent);

            List<PlFormula> affectedFormulas = entry.getValue();

            // String reason = isExceptional ? union + " entails " + negatedAntecedent : union + " does not entail " + negatedAntecedent;
            String reason = union.toString(); 
            exceptionalityChecks.add(new ExceptionalityCheck(antecedent, isExceptional, reason, i, affectedFormulas));

            if (isExceptional) {
                exceptionals.add(antecedent);
            }
        }

        return exceptionals;
    }

    /**
     * Constructs a rank given the previous knowledge base, the current knowledge base, and the exceptionals.
     * @param rank
     * @param previous
     * @param current
     * @param exceptionals
     */
    private void constructRank(Rank rank, KnowledgeBase previous, KnowledgeBase current, KnowledgeBase exceptionals) {
        // sequential (no shared state / no sync needed)
        // add formula to rank
        for (PlFormula formula : previous) {
            PlFormula antecedent = ((Implication) formula).getFirstFormula();
            if (exceptionals.contains(antecedent)) {
                current.add(formula);
            } else {
                rank.getFormulas().add(formula);
            }
        }
    }
}
