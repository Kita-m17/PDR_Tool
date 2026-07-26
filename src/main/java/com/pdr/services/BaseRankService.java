/*
 * File: BaseRankService.java
 * Package: com.extrc.services
 *
 * Original Author: Thabo Vincent Moloi , Honours Project (2024), University of Cape Town
 * Adapted by: Julia Cotterrell (2025 Honours Project, University of Cape Town)
 * Used by: Nikita Martin (2026 Honours Project, University of Cape Town)
 *
 * Status: Used as it
 * Context: Used in PDR project for closure algorithms.
 * Purpose: Educational use only.
 */
package com.pdr.services;

import com.pdr.models.BaseRank;
import com.pdr.models.KnowledgeBase;

public interface BaseRankService {
  public BaseRank constructBaseRank(KnowledgeBase knowledgeBase);
}
