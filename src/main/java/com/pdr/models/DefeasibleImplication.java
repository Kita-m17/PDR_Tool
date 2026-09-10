/*
 * File: DefeasibleImplication.java
 * Package: com.pdr.models
 *
 * Original Author: Thabo Vincent Moloi (2024 Honours Project, University of Cape Town)
 * Adapted by: Julia Cotterrell (2025 Honours Project, University of Cape Town)
 * 
 * Modified by: Nikita Martin (2026 Honours Project, University of Cape Town)
 * Changes: Updated package to com.pdr.models, changed replaceAll() to replace() in toString method
 * 
 * Context: Incorporated as part of PDR's Honours Project (2026).
 * Purpose: Educational use only.
 */
package com.pdr.models;

import org.tweetyproject.commons.util.Pair;
import org.tweetyproject.logics.pl.syntax.Implication;
import org.tweetyproject.logics.pl.syntax.PlFormula;

import com.pdr.utils.Symbols;

/**
    * Represents a defeasible implication in propositional logic.
    * 
    * Example: a |~ b
    * 
    * Extends Tweety's {@link Implication} but overrides the string output
    * to display the custom defeasible implication symbol.
*/
public class DefeasibleImplication extends Implication {

    /**
        * Create a new defeasible implication a |~ b with two given formulas.
        *
        * @param a left-hand formula
        * @param b right-hand formula
    */
    public DefeasibleImplication(PlFormula a, PlFormula b) {
        super(a, b);
    }

    /**
        * Create a new defeasible implication from a pair of formulas.
        *
        * @param formulas a pair (left, right) of propositional formulas
    */
    public DefeasibleImplication(Pair<PlFormula, PlFormula> formulas) {
        super(formulas);
    }

    /**
        * Convert this implication into a string,
        * replacing the standard symbol with the custom defeasible one (|~).
    */
    @Override
    public String toString() {
        return super.toString().replace(Symbols.IMPLICATION(), Symbols.DEFEASIBLE_IMPLICATION());
    }
    public Pair<PlFormula, PlFormula> getFormula()
    {
        return this.getFormulas();
    }

}
