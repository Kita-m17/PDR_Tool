package com.pdr.services;
/*
 * Original Author: Liam De Saldanha , Honours Project (2026), University of Cape Town
 *
 * Context: Used in PDR project for relevant closure reasoning.
 * Purpose: Educational use only.
 */
import com.pdr.models.*;
import org.springframework.stereotype.Service;
import org.tweetyproject.logics.pl.reasoner.SatReasoner;
import org.tweetyproject.logics.pl.sat.Sat4jSolver;
import org.tweetyproject.logics.pl.sat.SatSolver;
import org.tweetyproject.logics.pl.syntax.Implication;
import org.tweetyproject.logics.pl.syntax.Negation;
import org.tweetyproject.logics.pl.syntax.PlFormula;

import java.util.ArrayList;
import java.util.List;

public class PartitionUsingComputeAllJustificationImpl implements PartitionService {

    @Override
    public Partition getPartition(KnowledgeBase knowledgeBase, PlFormula query, boolean isMinimalRelevantClosure) {
        BaseRank baseRank = (new BaseRankServiceImp()).constructBaseRank(knowledgeBase);
        List<KnowledgeBase> list = ClassicJust.computeJustification(knowledgeBase,new Negation(((Implication) query).getFirstFormula()));
        List<KnowledgeBase> resList = new ArrayList<>();
        SatSolver.setDefaultSolver(new Sat4jSolver());
        SatReasoner reasoner = new SatReasoner();
        Partition result = new Partition();
        result.setTraceSteps(new ArrayList<>());
        int count =1;

        KnowledgeBase classicalKnowledgeBase = knowledgeBase.separate()[1];

        for(KnowledgeBase combination:list){

            PartitionStep step = new PartitionStep();
            step.setId(count);
            step.setSet(combination);

            if(step.getId()!=1){

                step.setJustificationsSoFar(new ArrayList<>((result.getTraceSteps().get(step.getId()-2)).getJustificationsSoFar()));
            }else{
                step.setJustificationsSoFar(new ArrayList<>());
            }

            boolean minimal = true;
            step.setEntailed(true);
                for(KnowledgeBase justification:list){
                    if(justification.size() <combination.size() && combination.containsAll(justification)){
                        minimal = false;
                    }
                }


                if(minimal){
                    step.setMinimal(true);
                    if (isMinimalRelevantClosure){
                        int lowestRank =Integer.MAX_VALUE;
                        KnowledgeBase minimalJustificationStatement = new KnowledgeBase();
                        for(Rank rank : baseRank.getRanking()){
                            for(PlFormula pl : combination){

                                if(rank.getFormulas().contains(pl) && rank.getRankNumber()<lowestRank){

                                    lowestRank = rank.getRankNumber();
                                    minimalJustificationStatement.add(pl);
                                }
                            }

                        }
                        resList.add(minimalJustificationStatement);
                        step.setMinimalSet(minimalJustificationStatement);

                    }else{
                        resList.add(combination);

                    }

                }



            if(step.isEntailed() && step.isMinimal()){



                if(isMinimalRelevantClosure){
                    step.getJustificationsSoFar().add(step.getMinimalSet());

                }else{
                    step.getJustificationsSoFar().add(step.getSet());

                }


            }
            result.getTraceSteps().add(step);
            count++;
        }




        KnowledgeBase relevantString = new KnowledgeBase();
        KnowledgeBase irrelevantString = new KnowledgeBase(knowledgeBase);
        for(KnowledgeBase kb:resList){
            relevantString = relevantString.union(kb);

        }
        relevantString = relevantString.difference(classicalKnowledgeBase);
       // irrelevantString = irrelevantString.difference(classicalKnowledgeBase);
        result.setClassicalStatements(classicalKnowledgeBase);
        result.setRelevantPartition(relevantString);
        irrelevantString = irrelevantString.difference(relevantString);
        result.setIrrelevantPartition(irrelevantString);
        result.setKnowledgeBase(knowledgeBase);
        return result;
    }




}
