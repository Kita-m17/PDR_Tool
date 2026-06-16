/*
 * Original Author: Thabo Vincent Moloi (2024 Honours Project, University of Cape Town)
 * Status: Extended and modified for use in this project.
 * Context: Used as part of the PDR project
 * Purpose: Educational use - Provides a centralized class for defining and managing logical symbols used in the project.
 */

package com.pdr.utils;

public final class Symbols {

    /**
        * Get the string representation of the implication symbol.
        * @return
    */
    public static String IMPLICATION() {
        return "->";
    }

    /**
        * Get the string representation of the disjunction symbol.
        * @return
    */
    public static String DISJUNCTION() {
        return "||";
    }

    /**
        * Get the string representation of the conjunction symbol.
        * @return
    */
    public static String CONJUNCTION() {
        return "&&";
    }

    /**
        * Get the string representation of the equivalence symbol.
        * @return
    */
    public static String EQUIVALENCE() {
        return "<=>";
    }

    /**
        * Get the string representation of the negation symbol.
        * @return
    */
    public static String NEGATION() {
        return "!";
    }

    /**
        * Get the string representation of the defeasible implication symbol.
        * @return
    */
    public static String DEFEASIBLE_IMPLICATION() {
        return "~|";
    }
}