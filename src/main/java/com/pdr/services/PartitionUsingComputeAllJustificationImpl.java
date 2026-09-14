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

    private Partition partition;

    @Override
    public Partition getPartition(KnowledgeBase knowledgeBase, PlFormula query, boolean isMinimalRelevantClosure) {

        return null;
    }

    @Override
    public Partition getInstance() {
        return partition;
    }


}
