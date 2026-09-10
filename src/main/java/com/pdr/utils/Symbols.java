/*
 * File: Symbols.java
 * Package: com.pdr.utils
 *
 * Original Author: Thabo Vincent Moloi (2024 Honours Project, University of Cape Town)
 * Adapted by: Julia Cotterrell (2025 Honours Project, University of Cape Town)
 * Modified by Nikita Martin (2026 Honours Project, University of Cape Town)
 * Changes: Updated package to com.pdr.utils, changed defeasible implication symbol from ~> to |~, and ensured the class is final with a private constructor to prevent instantiation.
 * Purpose: Educational use only.
 */
package com.pdr.utils;

public final class Symbols {

  private Symbols() {
    // Private constructor to prevent instantiation
  }

  /** 
   * @return String
   */
  public static String IMPLICATION() {
    return "=>";
  }

  /** 
   * @return String
   */
  public static String DISJUNCTION() {
    return "||";
  }

  /** 
   * @return String
   */
  public static String CONJUNCTION() {
    return "&&";
  }

  /** 
   * @return String
   */
  public static String EQUIVALENCE() {
    return "<=>";
  }

  /** 
   * @return String
   */
  public static String NEGATION() {
    return "!";
  }

  /** 
   * @return String
   */
  public static String DEFEASIBLE_IMPLICATION() {
    return "|~";
  }
}