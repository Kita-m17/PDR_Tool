package com.pdr.services;

import com.pdr.models.Justification;
import com.pdr.models.KnowledgeBase;
import org.tweetyproject.logics.pl.syntax.PlFormula;

public interface JustificationService {

    public Justification getPartition(KnowledgeBase knowledgeBase, PlFormula query);
}
