/*
 * File: ReasonerFactory.java
 * Package: com.pdr.services
 *
 * Original Author: Thabo Vincent Moloi , Honours Project (2024), University of Cape Town
 * Adapted by: Nikita Martin (202 Honours Project, University of Cape Town)
 *
 * Status: Modified – Springboot use.
 * Context: Used in PDR's project for closure algorithms.
 * Purpose: Educational use only.
 */

package com.pdr.services;

import org.springframework.stereotype.Component;

@Component
public class ReasonerFactory {
    public static ReasonerService createReasoner(String type) {
        return switch (type) {
            case "rational" -> new RationalReasonerImpl();
            // case "lexical" -> new LexicalReasonerImpl();
            // case "relevant" -> new RelevantReasonerImpl();
            default -> throw new IllegalArgumentException("Unknown reasoner: " + type);
        };
    }
}
