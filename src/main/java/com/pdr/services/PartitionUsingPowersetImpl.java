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
@Service
public class PartitionUsingPowersetImpl implements PartitionService {

    private Partition partition;
    @Override
    public Partition getPartition(KnowledgeBase knowledgeBase, PlFormula query, boolean isMinimalRelevantClosure) {
        long startTime = System.nanoTime();
        BaseRank baseRank = (new BaseRankServiceImp()).constructBaseRank(knowledgeBase);

        List<KnowledgeBase> list = getPowerSets(knowledgeBase);

        List<KnowledgeBase> resList = new ArrayList<>();
        SatSolver.setDefaultSolver(new Sat4jSolver());
        SatReasoner reasoner = new SatReasoner();
        List<PartitionStep> traceSteps = new ArrayList<>();
        int count =1;
        boolean isEntailed = false;
        boolean isMinimal = false;

        KnowledgeBase classicalKnowledgeBase = knowledgeBase.separate()[1];

        for(KnowledgeBase combination:list){

            KnowledgeBase minimalJustificationStatement = new KnowledgeBase();
            List<KnowledgeBase> justificationSoFar = new ArrayList<>();
            for(PlFormula pl:classicalKnowledgeBase){
                combination.add(pl);
            }
            if(count!=1){

                justificationSoFar = new ArrayList<>((traceSteps.get(count-2)).getJustificationsSoFar());
            }else{
                justificationSoFar = new ArrayList<>();
            }

            if(reasoner.query(combination,new Negation(((Implication) query).getFirstFormula()))){
                boolean minimal = true;
                isEntailed = true;

                for(int i =0;i<resList.size();i++){
                    if(combination.containsAll(resList.get(i)) ){

                        minimal = false;
                    }
                }


                if(minimal){
                    isMinimal = true;
                    if (isMinimalRelevantClosure){
                        int lowestRank =Integer.MAX_VALUE;
                        for(Rank rank : baseRank.getRanking()){
                            for(PlFormula pl : combination){

                                if(rank.getFormulas().contains(pl) && rank.getRankNumber()<lowestRank){

                                    lowestRank = rank.getRankNumber();
                                    minimalJustificationStatement.add(pl);
                                }
                            }

                        }
                        resList.add(minimalJustificationStatement);

                    }else{
                        resList.add(combination);

                    }

                }


            }
            if(isEntailed && isMinimal){


                if(isMinimalRelevantClosure){
                    justificationSoFar.add(minimalJustificationStatement);

                }else{
                    justificationSoFar.add(combination);

                }


            }
            traceSteps.add(PartitionStep.builder()
                            .withId(count)
                            .withIsEntailed(isEntailed)
                            .withIsMinimal(isMinimal)
                            .withJustificationsSoFar(justificationSoFar)
                            .withMinimalSet(minimalJustificationStatement)
                            .withReason("")
                            .withSet(combination)
                    .build()

            );
            count++;
        }




        KnowledgeBase relevantString = new KnowledgeBase();
        KnowledgeBase irrelevantString = new KnowledgeBase(knowledgeBase);
        for(KnowledgeBase kb:resList){
            relevantString = relevantString.union(kb);

        }
        relevantString = relevantString.difference(classicalKnowledgeBase);
        irrelevantString = irrelevantString.difference(relevantString);
        long endTime = System.nanoTime();
        long durationNs = endTime - startTime;

        double durationSeconds = (double) durationNs / 1_000_000_000.0;


        String formattedTime = String.format("%.3fs", durationSeconds);
        //System.out.println("Execution time: " + formattedTime);
        this.partition = Partition.builder()
                .withIrrelevantPartition(irrelevantString)
                .withRelevantPartition(relevantString)
                .withTraceSteps(traceSteps)
                .withExecutionTime(durationSeconds)


                .withClassicalStatements(classicalKnowledgeBase)
                .withKnowledgeBase(knowledgeBase)
                .build();
        return this.partition;
    }
    public Partition getInstance(){
        return partition;
    }

    public static List<KnowledgeBase> getPowerSets(KnowledgeBase kb){

        List<KnowledgeBase> res = new ArrayList<>();
        res.add(new KnowledgeBase());
        kb = kb.separate()[0];
        List<PlFormula> plFormulas = new ArrayList<>(kb);

        for(PlFormula pl:plFormulas){
            List<KnowledgeBase> temp = new ArrayList<>(res);
            for(KnowledgeBase list: temp){
                KnowledgeBase tmp = new KnowledgeBase(list);
                tmp.add(pl);
                res.add(tmp);
            }
        }

        return res;

    }


}