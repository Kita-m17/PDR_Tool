package com.pdr.services;

import com.pdr.models.Partition;
import com.pdr.models.KnowledgeBase;
import org.tweetyproject.logics.pl.syntax.PlFormula;

public interface PartitionService {

    public Partition getPartition(KnowledgeBase knowledgeBase, PlFormula query);
}
