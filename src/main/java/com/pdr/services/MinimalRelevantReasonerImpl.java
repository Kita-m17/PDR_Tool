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

public class MinimalRelevantReasonerImpl implements ReasonerService {
    private final PartitionService partitionService;
    private final KnowledgeBaseService knowledgeBaseService;

    public MinimalRelevantReasonerImpl(PartitionService partitionService, KnowledgeBaseService knowledgeBaseService) {
        this.partitionService = partitionService;
        this.knowledgeBaseService = knowledgeBaseService;
    }

    @Override
    public Entailment getEntailment(BaseRank baseRank, PlFormula queryFormula) {
        // Get inputs

        PlFormula antecedent = ((Implication) queryFormula).getFirstFormula();
        PlFormula negation = new Negation(antecedent);
        KnowledgeBase knowledgeBase = knowledgeBaseService.getKnowledgeBase();
        Ranking baseRanking = knowledgeBaseService.getBaseRank().getRanking();
        Ranking removedRanking = new Ranking();

        //specific input to relevant closure
        Partition partition = partitionService.getPartition(knowledgeBaseService.getKnowledgeBase(), queryFormula,true);
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



        boolean entailment = reasoner.query((relevantInf).union(relevantPrime).union(irrelevantPartition),queryFormula);

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
        return new RelevantEntailment.RelevantEntailmentBuilder()
                .withEntailed(entailment)
                .withTraceSteps(trace)
                .withBaseRanking(baseRanking)
                .withKnowledgeBase(knowledgeBase)
                .withQueryFormula(queryFormula)
                .withWeakJustification(smallestJustification)
                .build();





    }
}


