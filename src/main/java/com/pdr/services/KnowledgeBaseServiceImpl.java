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
import com.pdr.utils.DefeasibleParser;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.tweetyproject.logics.pl.syntax.Implication;
import org.tweetyproject.logics.pl.syntax.Negation;
import org.tweetyproject.logics.pl.syntax.PlFormula;
import org.tweetyproject.logics.pl.syntax.Proposition;

import com.pdr.models.BaseRank;
import com.pdr.models.DefeasibleImplication;
import com.pdr.models.KnowledgeBase;

import jakarta.annotation.PostConstruct;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class KnowledgeBaseServiceImpl implements KnowledgeBaseService{


    private KnowledgeBase knowledgeBase;
    private DefeasibleImplication query;

    @PostConstruct
    public void init(){
        this.knowledgeBase = buildDefault();
    }
    /**
     * Build the default knowledge base
     * @return
     */
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
    @Override
    public KnowledgeBase getKnowledgeBase() {
        return this.knowledgeBase;
    }

    @Override
    public void setQuery(DefeasibleImplication query) {
        this.query = new DefeasibleImplication(query.getFormula());
    }

    @Override
    public DefeasibleImplication getQuery() {
        return new DefeasibleImplication(query.getFormula());
    }

    /**
     * @param kb set the kb and construct the base rank
     */
    @Override
    public void setKnowledgeBase(KnowledgeBase kb) {
        this.knowledgeBase = kb;
    }

    @Override
    public void clearKnowledgeBase() {
        this.knowledgeBase =null;
    }

    @Override
    public void clearQuery() {
this.query=null;
    }
    public KnowledgeBase convertFromDTO(KnowledgeBaseDTO knowledgeBaseDTO){
        DefeasibleParser parser = new DefeasibleParser();

        List<PlFormula> formulas = knowledgeBaseDTO.getFormulas().stream().map(
                        f -> {
                            try {
                                return (PlFormula) parser.parseFormula(f);
                            } catch (Exception e) {
                                throw new RuntimeException("Invalid formula: " + f, e);
                            }
                        })
                .collect(Collectors.toList());
        return new KnowledgeBase(formulas);
    }

    /**
     * @Author Liam De Saldanha
     */
    public KnowledgeBaseDTO convertToDTO(KnowledgeBase knowledgeBase){
        List<PlFormula> list= new ArrayList<PlFormula>(knowledgeBase);
        List<String> result = new ArrayList<>();
        for(PlFormula pl:list){
            result.add(pl.toString());
        }
        return new KnowledgeBaseDTO(result);
    }
    
    @Override
    public DefeasibleImplication convertFromDTO(QueryDTO queryDTO) throws Exception {
        DefeasibleParser parser = new DefeasibleParser();
        Implication formula = (Implication) parser.parseFormula(queryDTO.getFormula());
        return new DefeasibleImplication(formula.getFormulas());
    }

    @Override
    public QueryDTO convertToDTO(DefeasibleImplication defeasibleImplication) {
            QueryDTO result = new QueryDTO();
            result.setFormula(defeasibleImplication.toString());
            return result;
    }
}
