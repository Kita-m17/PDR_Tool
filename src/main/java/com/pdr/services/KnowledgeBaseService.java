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


import com.pdr.models.BaseRank;
import com.pdr.models.KnowledgeBase;

public interface KnowledgeBaseService{
    /**
     * @return the default knowledgebase
     */
    public KnowledgeBase getKnowledgeBase();

    /**
     * @return the base rank
     */
    public BaseRank getBaseRank();

}
