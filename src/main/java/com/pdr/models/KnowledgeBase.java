/*
 * File: KnowledgeBase.java
 * Package: com.pdr.models
 *
 * Original Author: Thabo Vincent Moloi , Honours Project (2024), University of Cape Town
 * Adapted by: Julia Cotterrell (2025 Honours Project, University of Cape Town)
 * 
 * Modified by: Nikita Martin (2026 Honours Project, University of Cape Town)
 * Changes: Updated package to com.pdr.models
 * 
 * Context: Incorporated as part of PDR's Honours Project (2026).
 * Purpose: Educational use only.
 */

package com.pdr.models;

import java.util.ArrayList;
import java.util.Collection;
import java.util.List;

import org.tweetyproject.logics.pl.syntax.Implication;
import org.tweetyproject.logics.pl.syntax.PlBeliefSet;
import org.tweetyproject.logics.pl.syntax.PlFormula;

/**
 * This class represents a defeasible knowledge base of propositional formulae.
 */
public class KnowledgeBase extends PlBeliefSet {

    // --- Constructors ---

    // Create an empty knowledge base
    public KnowledgeBase() {
        super();
    }

    // Create a knowledge base from a given set of formulas
    public KnowledgeBase(Collection<? extends PlFormula> formulas) {
        super(formulas);
    }

    // --- Operations on knowledge bases ---
    /** 
        * Return union of this KB and another KB
        * @param knowledgeBase
        * @return KnowledgeBase
    */
    public KnowledgeBase union(KnowledgeBase knowledgeBase) {
        KnowledgeBase result = new KnowledgeBase(this);
        result.addAll(knowledgeBase);
        return result;
    }

    /** 
        * Return union of this KB with a collection of KBs
        * @param knowledgeBases
        * @return KnowledgeBase
    */
    public KnowledgeBase union(Collection<KnowledgeBase> knowledgeBases) {
        KnowledgeBase result = new KnowledgeBase();
        knowledgeBases.forEach(result::addAll);
        return result;
    }

    /** 
        * Return intersection of this KB and another KB
        * @param knowledgeBase
        * @return KnowledgeBase
    */
    public KnowledgeBase intersection(KnowledgeBase knowledgeBase) {
        KnowledgeBase result = new KnowledgeBase();
        this.forEach(formula -> {
            if (knowledgeBase.contains(formula)) {
                result.add(formula);
            }
        });
        return result;
    }

    /** 
        * Return set difference of this KB and another KB
        * @param knowledgeBase
        * @return KnowledgeBase
    */
    public KnowledgeBase difference(KnowledgeBase knowledgeBase) {
        KnowledgeBase result = new KnowledgeBase(this);
        result.removeAll(knowledgeBase);
        return result;
    }

    /** 
        * Collect all antecedents from implication formulas (left-hand side formulas) from 
        * all implications in this KB, including defeasible ones.
        * Used during BaseRank to check which antecedents are 
        * exceptional with respect to the current knowledge base.
        * 
        * @return KnowledgeBase
    */
    public KnowledgeBase antecedents() {
        KnowledgeBase antecedents = new KnowledgeBase();
        this.forEach(formula -> {
            if (formula instanceof Implication implication) {
                antecedents.add(implication.getFirstFormula());
            }
        });
        return antecedents;
    }

    // --- Defeasible vs classical transformations ---

    /** 
        * Convert defeasible implications (~>) to classical implications (=>)
        * 
        * @return KnowledgeBase
    */
    public KnowledgeBase materialise() {
        KnowledgeBase result = new KnowledgeBase();
        this.forEach(formula -> {
            if (formula instanceof DefeasibleImplication defeasibleImplication) {
                result.add(new Implication(defeasibleImplication.getFormulas()));
            }
        });
        return result;
    }

    /** 
        * Convert classical implications (=>) to defeasible implications (~>)
        * 
        * @return KnowledgeBase
    */
    public KnowledgeBase dematerialise() {
        KnowledgeBase result = new KnowledgeBase();
        this.forEach(formula -> {
            if ((formula instanceof Implication implication) && !(formula instanceof DefeasibleImplication)) {
                result.add(new DefeasibleImplication(implication.getFormulas()));
            }
        });
        return result;
    }

    /** 
        * Separate into [0] defeasible formulas, [1] classical formulas
        * Especially useful in the base rank 0 classical formulas go to rank infinity
        * 
        * @return KnowledgeBase[]
    */
    public KnowledgeBase[] separate() {
        KnowledgeBase defeasible = new KnowledgeBase();
        KnowledgeBase classical = new KnowledgeBase();
        this.forEach(formula -> {
            if (formula instanceof DefeasibleImplication) {
                defeasible.add(formula);
            } else {
                classical.add(formula);
            }
        });
        return new KnowledgeBase[] { defeasible, classical };
    }

    /** 
        * Return all formulas as strings
        * 
        * @return List<String>
    */
    public List<String> toStringList() {
        return this.stream().map(PlFormula::toString).toList();
    }
  
    // --- Static helpers for single formulas ---

    /** 
        * Materialise a single formula (defeasible -> classical)
        * 
        * @param formula
        * @return PlFormula
    */
    public static PlFormula materialise(PlFormula formula) {
        if (formula instanceof DefeasibleImplication defeasibleImplication) {
            return new Implication(defeasibleImplication.getFormulas());
        }
        return formula;
    }

    /** 
        * Dematerialise a single formula (classical -> defeasible)
        * 
        * @param formula
        * @return PlFormula
    */
    public static PlFormula dematerialise(PlFormula formula) {
        if (formula instanceof Implication implication && !(formula instanceof DefeasibleImplication)) {
            return new DefeasibleImplication(implication.getFormulas());
        }
        return formula;
    }


    public boolean contains(PlFormula pl) {
        KnowledgeBase tmp = new KnowledgeBase();
        tmp.add(pl);
        return (this.union(tmp)).size() == this.size();


    }
    public List<String> getStringFormulas(){
        List<PlFormula> list= new ArrayList<PlFormula>(this);
        List<String> result = new ArrayList<>();
        for(PlFormula pl:list){
            result.add(pl.toString());
        }
        return result;
    }

}
