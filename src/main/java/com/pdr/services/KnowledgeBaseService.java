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

import org.tweetyproject.logics.pl.syntax.Implication;
import org.tweetyproject.logics.pl.syntax.Negation;
import org.tweetyproject.logics.pl.syntax.Proposition;

import com.pdr.models.DefeasibleImplication;
import com.pdr.models.KnowledgeBase;

import jakarta.annotation.PostConstruct;

import com.pdr.models.BaseRank;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class KnowledgeBaseService{

    @Autowired
    private BaseRankService baseRankService;

    private KnowledgeBase knowledgeBase;
    private BaseRank baseRank;

    @PostConstruct
    public void init(){
        this.knowledgeBase = buildDefault();
        this.baseRank = baseRankService.constructBaseRank(this.knowledgeBase);
    }
    

    private KnowledgeBase buildDefault() {
        Proposition p = new Proposition("p");
        Proposition b = new Proposition("b");
        Proposition f = new Proposition("f");
        Proposition w = new Proposition("w");

        KnowledgeBase kb = new KnowledgeBase();
        kb.add(new Implication(p, b));
        kb.add(new DefeasibleImplication(b, f));
        kb.add(new DefeasibleImplication(b, w));
        kb.add(new DefeasibleImplication(p, new Negation(f)));

        return kb;
    }

    /**
     * @return the default knowledgebase
     */
    public KnowledgeBase getKnowledgeBase() {
        return this.knowledgeBase;
    }

    /**
     * @param kb
     */
    public void setKnowledgeBase(KnowledgeBase kb) {
        this.knowledgeBase = kb;
        this.baseRank = baseRankService.constructBaseRank(kb);
    }

    public BaseRank getBaseRank(){
        return this.baseRank;
    }

}
