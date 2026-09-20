package com.pdr.services;
/*
 * Original Author: Liam De Saldanha , Honours Project (2026), University of Cape Town
 *
 * Context: Used in PDR project for relevant closure reasoning.
 */
import com.pdr.models.BaseRank;
import com.pdr.models.KnowledgeBase;
import com.pdr.models.Rank;
import org.tweetyproject.logics.pl.reasoner.SatReasoner;
import org.tweetyproject.logics.pl.sat.Sat4jSolver;
import org.tweetyproject.logics.pl.sat.SatSolver;
import org.tweetyproject.logics.pl.syntax.Implication;
import org.tweetyproject.logics.pl.syntax.Negation;
import org.tweetyproject.logics.pl.syntax.PlFormula;

import java.util.List;

public class DefeasibleJustificationService {

    /*
    Algorithm used to efficiently compute weak justifications for Relevant Closure.
    @link https://doi.org/10.1007/978-3-030-95070-5_13
     */
    public static List<KnowledgeBase> getJustificationsForRelevantClosure(KnowledgeBase knowledgeBase, PlFormula query){
        SatSolver.setDefaultSolver(new Sat4jSolver());//Future contributors can use dependency injection
        SatReasoner reasoner = new SatReasoner();
        KnowledgeBase materialisedKnowledgeBase = knowledgeBase.materialisedKnowledgeBase();
        List<KnowledgeBase> justifications = ClassicalJustificationService.computeJustification(materialisedKnowledgeBase,query);
        KnowledgeBase relevantPartition = new KnowledgeBase();
        KnowledgeBase classicalStatements = knowledgeBase.separate()[1];

        for(KnowledgeBase justification:justifications){
            relevantPartition = relevantPartition.union((justification.difference(classicalStatements)));
        }
        KnowledgeBase irrelaventPartition = knowledgeBase.difference(relevantPartition);
        BaseRank baseRank = (new BaseRankServiceImp()).constructBaseRank(knowledgeBase);
        KnowledgeBase R = new KnowledgeBase();
        for(Rank rank : baseRank.getRanking()){
            R = R.union(rank.getFormulas());
        }
        int i=0;
        while( reasoner.query(classicalStatements.union(R),new Negation(((Implication) query).getFirstFormula()))&& R.size()>0 ){
            KnowledgeBase rankToRemove = baseRank.getRanking().get(i).getFormulas();
            R = R.difference(rankToRemove);
            i=i+1;
        }

        return ClassicalJustificationService.computeJustification(R.union(irrelaventPartition),query);
    }


}
