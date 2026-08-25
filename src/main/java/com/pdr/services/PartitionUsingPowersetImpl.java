package com.pdr.services;

import com.pdr.models.Partition;
import com.pdr.models.PartitionStep;
import com.pdr.models.KnowledgeBase;
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

    @Override
    public Partition getPartition(KnowledgeBase knowledgeBase, PlFormula query) {
        List<KnowledgeBase> list = getPowerSets(knowledgeBase);
        int min = Integer.MAX_VALUE;
        List<KnowledgeBase> resList = new ArrayList<>();
        KnowledgeBase res = new KnowledgeBase();
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
            for(PlFormula pl:classicalKnowledgeBase){
                combination.add(pl);
            }
            if(step.getId()!=1){

                step.setJustificationsSoFar(new ArrayList<>((result.getTraceSteps().get(step.getId()-2)).getJustificationsSoFar()));
            }else{
                step.setJustificationsSoFar(new ArrayList<>());
            }

            if(reasoner.query(combination,new Negation(((Implication) query).getFirstFormula()))){
                boolean minimal = true;
                step.setEntailed(true);
                for(int i =0;i<resList.size();i++){
                    if(combination.containsAll(resList.get(i)) ){

                        minimal = false;
                    }
                }


                if(minimal){
                    step.setMinimal(true);
                    resList.add(combination);

                }


            }
            if(step.isEntailed() && step.isMinimal()){




                step.getJustificationsSoFar().add(step.getSet());


            }
            result.getTraceSteps().add(step);
            count++;
        }




        KnowledgeBase relevantString = new KnowledgeBase();
        KnowledgeBase irrelevantString = new KnowledgeBase(knowledgeBase);
        for(KnowledgeBase kb:resList){
            relevantString = relevantString.union(kb);
            irrelevantString = irrelevantString.difference(kb);
        }
        relevantString = relevantString.difference(classicalKnowledgeBase);
        irrelevantString = irrelevantString.difference(classicalKnowledgeBase);
        result.setClassicalStatements(classicalKnowledgeBase);
        result.setRelevantPartition(relevantString);
        result.setIrrelevantPartition(irrelevantString);
        result.setKnowledgeBase(knowledgeBase);
        return result;
    }

    public static List<KnowledgeBase> getPowerSets(KnowledgeBase kb){

        List<KnowledgeBase> res = new ArrayList<>();
        res.add(new KnowledgeBase());
        kb = kb.separate()[0];
        List<PlFormula> plFormulas = new ArrayList<>(kb);

        for(PlFormula pl:plFormulas){
            List<KnowledgeBase> snapshot = new ArrayList<>(res);
            for(KnowledgeBase list: snapshot){
                KnowledgeBase tmp = new KnowledgeBase(list);
                tmp.add(pl);
                res.add(tmp);
            }
        }

        return res;

    }


}
