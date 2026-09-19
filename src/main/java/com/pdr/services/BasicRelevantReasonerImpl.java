package com.pdr.services;
/*
 * Original Author: Liam De Saldanha , Honours Project (2026), University of Cape Town
 *
 * Context: Used in PDR project for relevant closure reasoning.
 * Purpose: Educational use only.
 */
import com.pdr.models.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.tweetyproject.logics.pl.reasoner.SatReasoner;
import org.tweetyproject.logics.pl.sat.Sat4jSolver;
import org.tweetyproject.logics.pl.sat.SatSolver;
import org.tweetyproject.logics.pl.syntax.Implication;
import org.tweetyproject.logics.pl.syntax.Negation;
import org.tweetyproject.logics.pl.syntax.PlFormula;

import java.util.ArrayList;
import java.util.List;
@Data
@NoArgsConstructor
public class BasicRelevantReasonerImpl implements ReasonerService {
    private Partition partition;
    private KnowledgeBase knowledgeBase;


    public BasicRelevantReasonerImpl(Partition partition, KnowledgeBase knowledgeBase) {
        this.partition = partition;
        this.knowledgeBase = knowledgeBase;


    }

    @Override
    public Entailment getEntailment(BaseRank baseRank, PlFormula queryFormula) {
        // Get inputs
        long startTime = System.nanoTime();

        PlFormula antecedent = ((Implication) queryFormula).getFirstFormula();
        PlFormula negation = new Negation(antecedent);
        Ranking baseRanking = baseRank.getRanking();
        Ranking removedRanking = new Ranking();

        //specific input to relevant closure

        KnowledgeBase relevantPartition = partition.getRelevantPartition();
        KnowledgeBase irrelevantPartition = partition.getIrrelevantPartition();
        SatSolver.setDefaultSolver(new Sat4jSolver());
        SatReasoner reasoner = new SatReasoner();

        KnowledgeBase relevantInf = partition.getClassicalStatements();
        List<EntailmentStep> trace= new ArrayList<>();


        // Relevant Closure Algorithm
        int i =0;
        KnowledgeBase relevantPrime = new KnowledgeBase(relevantPartition);

        while(reasoner.query((relevantInf).union(relevantPrime).union(irrelevantPartition),new Negation(((Implication)queryFormula).getFirstFormula())) && relevantPrime.size()!=0){

            KnowledgeBase intersection = relevantPartition.intersection(baseRank.getRanking().getRank(i).getFormulas());
            relevantPrime = relevantPrime.difference(intersection);
            trace.add(new EntailmentStep(i,relevantPrime,true,"",intersection));
            i+=1;
        }
        trace.add(new EntailmentStep(i,relevantPrime,false,"",new KnowledgeBase()));


        List<KnowledgeBase> justifications = DefeasibleJustificationService.getJustificationsForRelevantClosure(knowledgeBase,queryFormula);
        KnowledgeBase smallestJustification = new KnowledgeBase();
        int smallestJustificationSize = Integer.MAX_VALUE;
        for (KnowledgeBase justification : justifications) {

            if (justification.size() < smallestJustificationSize) {
                smallestJustification = new KnowledgeBase();
                smallestJustification.addAll(justification);
                smallestJustificationSize = justification.size();
            }
        }

        boolean entailment = reasoner.query((relevantInf).union(relevantPrime).union(irrelevantPartition),queryFormula);
        if(!entailment){
            smallestJustification = new KnowledgeBase();
        }
        long endTime = System.nanoTime();
        long durationNs = endTime - startTime;

        double durationSeconds = (double) durationNs / 1_000_000_000.0;


        String formattedTime = String.format("%.3fs", durationSeconds);
        return new RelevantEntailment.RelevantEntailmentBuilder()
                .withEntailed(entailment)
                .withTraceSteps(trace)
                .withBaseRanking(baseRanking)
                .withKnowledgeBase(knowledgeBase)
                .withQueryFormula(queryFormula)
                .withClosureExecutionTime(durationSeconds)
                .withBaseRankExecutionTime(baseRank.getExecutionTime())
                .withPartitionExecutionTime(partition.getExecutionTime())
                .withWeakJustification(smallestJustification)
                .build();





    }
}
