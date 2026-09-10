package com.pdr.services;
/*
 * Original Author: Liam De Saldanha , Honours Project (2026), University of Cape Town
 *
 * Context: Used in PDR project for relevant closure reasoning.
 * Purpose: Educational use only.
 */
import com.pdr.models.Partition;
import com.pdr.models.KnowledgeBase;
import org.tweetyproject.logics.pl.syntax.PlFormula;

public interface PartitionService {

    public Partition getPartition(KnowledgeBase knowledgeBase, PlFormula query,boolean isMinimalRelevantClosure);

    Partition getInstance();
}
