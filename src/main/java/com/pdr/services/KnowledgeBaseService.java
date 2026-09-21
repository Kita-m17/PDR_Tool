/*
 * File: KnowledgeBaseServiceImpl.java
 * Package: com.pdr.services
 *
 * Original Author: Thabo Vincent Moloi , Honours Project (2024), University of Cape Town
 * Adapted by: Julia Cotterrell (2025 Honours Project, University of Cape Town)
 * Modifies by: Nikita Martin (2026 Honours Project, University of Cape Town)
 *
 * Status: Modified - removed the .
 * Context: Used in PDR's project for the closure entailment algorithms.
 * Purpose: Educational use only.
 */
package com.pdr.services;


import com.pdr.dtos.KnowledgeBaseDTO;
import com.pdr.dtos.QueryDTO;
import com.pdr.models.BaseRank;
import com.pdr.models.DefeasibleImplication;
import com.pdr.models.KnowledgeBase;
import com.pdr.utils.DefeasibleParser;
import org.tweetyproject.logics.pl.syntax.PlFormula;

import java.util.List;
import java.util.stream.Collectors;

public interface KnowledgeBaseService{
    /**
     * @return the default knowledgebase
     */
    public KnowledgeBase getKnowledgeBase();
    void setQuery(DefeasibleImplication query);
    DefeasibleImplication getQuery();
    
    /**
     * @param kb
     */
    public void setKnowledgeBase(KnowledgeBase kb);
    void clearKnowledgeBase();
    void clearQuery();
    KnowledgeBase convertFromDTO(KnowledgeBaseDTO knowledgeBaseDTO);
    KnowledgeBaseDTO convertToDTO(KnowledgeBase knowledgeBase);
    DefeasibleImplication convertFromDTO(QueryDTO queryDTO) throws Exception;
    QueryDTO convertToDTO(DefeasibleImplication defeasibleImplication);
}
