package com.pdr.services;
/*
 * Original Author: Liam De Saldanha , Honours Project (2026), University of Cape Town
 *
 * Context: Used in PDR project for relevant closure reasoning.
 * Purpose: Educational use only.
 */
import com.pdr.models.*;
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
        List<KnowledgeBase> list = DefeasibleJustificationService.getJustificationsForRelevantClosure(knowledgeBase,  query);
        System.out.println("Justifications:"+list);
        List<KnowledgeBase> resList = new ArrayList<>();
        Partition result = new Partition();
        result.setTraceSteps(new ArrayList<>());
        int count =1;

        KnowledgeBase classicalKnowledgeBase = knowledgeBase.separate()[1];

        for(KnowledgeBase justification:list){

            PartitionStep step = new PartitionStep();
            step.setId(count);
            step.setSet(justification);

            if(step.getId()!=1){

                step.setJustificationsSoFar(new ArrayList<>((result.getTraceSteps().get(step.getId()-2)).getJustificationsSoFar()));
            }else{
                step.setJustificationsSoFar(new ArrayList<>());
            }

            boolean minimal = true;
            step.setEntailed(true);



                if(minimal){
                    step.setMinimal(true);
                    if (isMinimalRelevantClosure){
                        int lowestRank =Integer.MAX_VALUE;
                        KnowledgeBase minimalJustificationStatement = new KnowledgeBase();
                        for(Rank rank : baseRank.getRanking()){
                            for(PlFormula pl : justification){

                                if(rank.getFormulas().contains(pl) && rank.getRankNumber()<lowestRank){

                                    lowestRank = rank.getRankNumber();
                                    minimalJustificationStatement.add(pl);
                                }
                            }

                        }
                        resList.add(minimalJustificationStatement);
                        step.setMinimalSet(minimalJustificationStatement);

                    }else{
                        resList.add(justification);

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
        DefeasibleJustificationService.getJustificationsForRelevantClosure(knowledgeBase, query);
        relevantString = relevantString.difference(classicalKnowledgeBase);
        result.setClassicalStatements(classicalKnowledgeBase);
        result.setRelevantPartition(relevantString);
        irrelevantString = irrelevantString.difference(relevantString);
        result.setIrrelevantPartition(irrelevantString);
        result.setKnowledgeBase(knowledgeBase);
        return result;
    }






}
