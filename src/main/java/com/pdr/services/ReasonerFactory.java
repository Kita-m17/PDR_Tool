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
    private final PartitionService partitionService;
    private final KnowledgeBaseService knowledgeBaseService;

    public ReasonerFactory(PartitionService partitionService, KnowledgeBaseService knowledgeBaseService) {
        this.partitionService = partitionService;
        this.knowledgeBaseService = knowledgeBaseService;
    }

    public ReasonerService createReasoner(String type) {

        return switch (type) {
            case "rational" -> new RationalReasonerImpl();
            case "lexicographic" -> new LexicographicReasonerImpl();
            case "basic relevant" -> new BasicRelevantReasonerImpl(partitionService,knowledgeBaseService);
            default -> throw new IllegalArgumentException("Unknown reasoner: " + type);
        };
    }
}
