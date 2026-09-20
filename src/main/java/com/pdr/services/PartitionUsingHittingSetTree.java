package com.pdr.services;

import com.pdr.models.*;
import com.pdr.utils.Utils;
import org.springframework.stereotype.Service;
import org.tweetyproject.logics.pl.reasoner.SatReasoner;
import org.tweetyproject.logics.pl.sat.Sat4jSolver;
import org.tweetyproject.logics.pl.sat.SatSolver;
import org.tweetyproject.logics.pl.syntax.Implication;
import org.tweetyproject.logics.pl.syntax.Negation;
import org.tweetyproject.logics.pl.syntax.PlBeliefSet;
import org.tweetyproject.logics.pl.syntax.PlFormula;

import java.util.ArrayList;
import java.util.LinkedList;
import java.util.List;
import java.util.Queue;

import static com.pdr.services.ClassicalJustificationService.computeSingleJustification;
@Service
public class PartitionUsingHittingSetTree implements PartitionService{
    /**
     * Exposes internal states of Steve Wangs Classical Justification implementation
     * @link http://hdl.handle.net/11427/39922
     *Original
     * @author stevewang
     * Modified by
     * @author Liam De Saldanha
     * @param baseRank, query ,knowledgeBase,isMinimalRelevantClosure
     * @return Partition
     */
    @Override
    public Partition getPartition(KnowledgeBase knowledgeBase, PlFormula query,BaseRank baseRank, boolean isMinimalRelevantClosure) {
        query = new Negation(((Implication) query).getFirstFormula());
        long startTime = System.nanoTime();

        SatSolver.setDefaultSolver(new Sat4jSolver());
        SatReasoner reasoner = new SatReasoner();

        // Construct root node
        List<PlFormula> rootJustification = ClassicalJustificationService.computeSingleJustification(knowledgeBase, query, reasoner);
        Node rootNode = new Node(knowledgeBase, rootJustification);

        // Create a queue to keep track of nodes
        Queue<Node> queue = new LinkedList<Node>();
        queue.add(rootNode);
        HittingSetTree tree = new HittingSetTree(rootNode);
        List<PartitionStep> traceSteps = new ArrayList<>();
        int count =1;

        while(!queue.isEmpty())
        {
            Node node = queue.poll();

            for( PlFormula formula : node.getJustification())
            {
                PlBeliefSet childKnowledgeBase = Utils.remove(node.getKnowledgeBase(), formula);
                List<PlFormula> childJustification = computeSingleJustification(childKnowledgeBase, query, reasoner);
                Node childNode = new Node(childKnowledgeBase, childJustification);

                node.addChildNode(formula, childNode);
                tree.addNode(childNode);

                if (childJustification != null || childJustification.isEmpty())
                {
                    traceSteps.add(PartitionStep.builder()
                            .withId(count)
                            .withIsEntailed(true)
                            .withIsMinimal(false)
                            .withJustificationsSoFar(new ArrayList<>())
                            .withMinimalSet(new KnowledgeBase())
                            .withReason("")
                            .withSet(new KnowledgeBase(childKnowledgeBase) )
                            .build()

                    );
                    count++;


                    queue.add(childNode);
                }
            }
        }

        //System.out.println("Tree:");
        //System.out.println(rootNode.toString());

        List<List<PlFormula>> justifications = rootNode.getAllJustifications();

        List<KnowledgeBase> justificationSoFar = new ArrayList<>();
        List<KnowledgeBase> allJustifications = new ArrayList<>();
        KnowledgeBase relevantString = new KnowledgeBase();

        for (List<PlFormula> justification : justifications) {
            KnowledgeBase just = new KnowledgeBase();
            KnowledgeBase minimalJustificationStatement = new KnowledgeBase();
            if (isMinimalRelevantClosure){
                int lowestRank =Integer.MAX_VALUE;
                for(Rank rank : baseRank.getRanking()){
                    for(PlFormula pl : justification){

                        if(rank.getFormulas().contains(pl) && rank.getRankNumber()<lowestRank){

                            lowestRank = rank.getRankNumber();
                            minimalJustificationStatement.add(pl);
                        }
                    }

                }
                just.addAll(minimalJustificationStatement);

            }else{
                just.addAll(justification);

            }


            if(!allJustifications.contains(just)){

                justificationSoFar.add(just);

                traceSteps.add(PartitionStep.builder()
                        .withId(count)
                        .withIsEntailed(true)
                        .withIsMinimal(true)
                        .withJustificationsSoFar(new ArrayList<>(justificationSoFar))
                        .withMinimalSet(new KnowledgeBase(minimalJustificationStatement))
                        .withReason("")
                        .withSet(new KnowledgeBase( justification))
                        .build()

                );
                count++;
            }
            allJustifications.add(just);
            relevantString = relevantString.union(just);


        }

        KnowledgeBase irrelevantString = new KnowledgeBase(knowledgeBase);

        KnowledgeBase classicalKnowledgeBase = knowledgeBase.separate()[1];


        relevantString = relevantString.difference(classicalKnowledgeBase);
        irrelevantString = irrelevantString.difference(relevantString);
        long endTime = System.nanoTime();
        long durationNs = endTime - startTime;

        double durationSeconds = (double) durationNs / 1_000_000_000.0;


        String formattedTime = String.format("%.3fs", durationSeconds);

        return  Partition.builder()
                .withIrrelevantPartition(irrelevantString)
                .withRelevantPartition(relevantString)
                .withTraceSteps(traceSteps)
                .withExecutionTime(durationSeconds)


                .withClassicalStatements(classicalKnowledgeBase)
                .withKnowledgeBase(knowledgeBase)
                .build();

    }
}
