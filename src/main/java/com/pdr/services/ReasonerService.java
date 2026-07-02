/*
 * File: ReasonerService.java
 * Package: com.pdr.services
 *
 * Original Author: Thabo Vincent Moloi , Honours Project (2024), University of Cape Town
 * Adapted by: Julia Cotterrell (2025 Honours Project, University of Cape Town)
 * Adapted by: Nikita Martin (2026 Honours Project, University of Cape Town)
 *
 * Status: Not modified - used as is.
 * Context: Used in PDR project for closure reasoning algorithms.
 * Purpose: Educational use only.
 */
package com.pdr.services;

import org.tweetyproject.logics.pl.syntax.PlFormula;

import com.pdr.models.BaseRankImplementation;
import com.pdr.models.Entailment;

public interface ReasonerService {
    public Entailment getEntailment(BaseRankImplementation baseRank, PlFormula queryFormula, PlFormula antecedent);
}