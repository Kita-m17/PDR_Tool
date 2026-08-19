package com.pdr.services;

import com.pdr.models.*;
import org.tweetyproject.logics.pl.reasoner.SatReasoner;
import org.tweetyproject.logics.pl.sat.Sat4jSolver;
import org.tweetyproject.logics.pl.sat.SatSolver;
import org.tweetyproject.logics.pl.syntax.Implication;
import org.tweetyproject.logics.pl.syntax.Negation;
import org.tweetyproject.logics.pl.syntax.PlFormula;

import java.util.ArrayList;
import java.util.List;

public class BasicRelevantReasonerImpl implements ReasonerService {
    private final PartitionService partitionService;
    private final KnowledgeBaseService knowledgeBaseService;



    public BasicRelevantReasonerImpl(PartitionService partitionService, KnowledgeBaseService knowledgeBaseService) {
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
        Partition partition = partitionService.getPartition(knowledgeBaseService.getKnowledgeBase(), queryFormula);
        KnowledgeBase relevantPartition = partition.getRelevantPartition();
        KnowledgeBase irrelevantPartition = partition.getIrrelevantPartition();
        SatSolver.setDefaultSolver(new Sat4jSolver());
        SatReasoner reasoner = new SatReasoner();

        KnowledgeBase relevantInf = partition.getClassicalStatements();
        List<EntailmentStep> trace= new ArrayList<>();

        // ModelRelevant mr = new ModelRelevant();
        //List<RelevantTracer> listRelevantTracer = new ArrayList<>();

        // Relevant Closure Algorithm
        int i =0;
        KnowledgeBase relevantPrime = new KnowledgeBase(relevantPartition);

        System.out.println("Entailment check");
        System.out.println("query negation: "+new Negation(((Implication)queryFormula).getFirstFormula()));
        while(reasoner.query((relevantInf).union(relevantPrime).union(irrelevantPartition),new Negation(((Implication)queryFormula).getFirstFormula())) && relevantPrime.size()!=0){

            //rt.setI(i);
            //rt.setBefore(relevantPrime.getStringFormulas());
            System.out.println("before: "+relevantPrime);
            KnowledgeBase intersection = relevantPartition.intersection(baseRank.getRanking().getRank(i).getFormulas());
            //rt.setIntersection(intersection.getStringFormulas());
            System.out.println("intersection: "+"at "+i+" set: "+intersection);
            relevantPrime = relevantPrime.difference(intersection);
            //rt.setCurrent(relevantPrime.getStringFormulas());
            System.out.println("after: "+relevantPrime);
            //listRelevantTracer.add(rt);
            trace.add(new EntailmentStep(i,relevantPrime,true,"",intersection));
            i+=1;
        }
        trace.add(new EntailmentStep(i,relevantPrime,false,"",new KnowledgeBase()));



        System.out.println("final KB: "+(relevantInf).union(relevantPrime).union(irrelevantPartition));
        boolean entailment = reasoner.query((relevantInf).union(relevantPrime).union(irrelevantPartition),queryFormula);

        return new RelevantEntailment.RelevantEntailmentBuilder()
                .withEntailed(entailment)
                .withTraceSteps(trace)
                .withBaseRanking(baseRanking)
                .withKnowledgeBase(knowledgeBase)
                .withQueryFormula(queryFormula)
                .build();





    }
}
