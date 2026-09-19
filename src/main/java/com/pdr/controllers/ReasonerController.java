/*
 * File: ReasonerFactory.java
 * Package: com.pdr.services
 *
 * Original Author: Thabo Vincent Moloi , Honours Project (2024), University of Cape Town
 * Adapted by: Julia Cotterrell (2025 Honours Project, University of Cape Town)
 * Adapted by: Nikita Martin, Liam De Saldanha (2026 Honours Project, University of Cape Town)
 *
 * Status: Modified – replaced BaseRankService with KnowledgeBaseService.
 * Context: Used in PDT project for the entailment algorithms.
 * Purpose: Educational use only.
 */
package com.pdr.controllers;

import com.pdr.dtos.*;
import com.pdr.models.*;
import com.pdr.services.*;
import com.pdr.utils.DefeasibleParser;

import org.tweetyproject.logics.pl.syntax.Implication;
import org.tweetyproject.logics.pl.syntax.PlFormula;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.ByteArrayInputStream;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@RestController //Marks this as a REST controller
@RequestMapping("/api/entailment") //Base url for the reasoner endpoints
@CrossOrigin(origins = "http://localhost:3000") //Allow cross-origin requests from the frontend
public class ReasonerController {
    private final BaseRankService baseRankService;
    private final ReasonerFactory reasonerFactory;
    private final DefeasibleParser parser;
    private final KnowledgeBaseService knowledgeBaseService;
    private final PartitionService partitionService;

    // Fixed display order for the combined evaluate-all endpoint, regardless of
    // what order the user selected algorithms in - so the resulting button row
    // is always laid out the same way, left to right.
    private static final List<String> ALGORITHM_ORDER = List.of("rational", "lexicographic", "basic relevant", "minimal relevant");

    //Constructor injection of the services
    public ReasonerController(BaseRankService baseRankService, ReasonerFactory reasonerFactory, DefeasibleParser parser, KnowledgeBaseService knowledgeBaseService, PartitionService partitionService) {
        this.baseRankService = baseRankService;
        this.reasonerFactory = reasonerFactory;
        this.knowledgeBaseService = knowledgeBaseService;
        this.parser = parser;
        this.partitionService = partitionService;
    }



    // Endpoint: POST /api/entailment/evaluate-all
    // Evaluates the query under every algorithm the user selected in one call,
    // reusing the single already-cached base rank (knowledgeBaseService.getBaseRank())
    // for all of them instead of recomputing it per algorithm.
    @PostMapping("/evaluate")
    public ResponseEntity<?> evaluateAll(@RequestBody EvaluateAllRequestDTO request) throws Exception {

        if (request.getAlgorithms() == null || request.getAlgorithms().isEmpty()) {
            ErrorResponse err = new ErrorResponse(HttpStatus.BAD_REQUEST.value(), "Bad Request", "Select at least one algorithm to evaluate");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(err);
        }

        InputDTO inputDTO = request.getInput();

        // 1) build the KB from the request body
        KnowledgeBaseDTO knowledgeBaseDTO = inputDTO.getKnowledgeBaseDTO();
        QueryDTO queryDTO = inputDTO.getQueryDTO();

        //Build kb and save it in the service
        KnowledgeBase knowledgeBase = knowledgeBaseService.convertFromDTO(knowledgeBaseDTO);
        DefeasibleImplication query = knowledgeBaseService.convertFromDTO(queryDTO);

        // 2a) construct the base rank model from the KB
        BaseRank baseRank = baseRankService.constructBaseRank(knowledgeBase);

        List<String> algorithms = request.getAlgorithms();
        List<AlgorithmEvaluationDTO> results = new ArrayList<>();
        for (String algorithm : algorithms) {
            if (!request.getAlgorithms().contains(algorithm)) {
                continue;
            }

            ReasonerService reasonerService;
            try {
                reasonerService = reasonerFactory.createReasoner(algorithm);
            } catch (IllegalArgumentException e) {
                ErrorResponse err = new ErrorResponse(HttpStatus.BAD_REQUEST.value(), "Bad Request", "Invalid reasoner: " + algorithm);
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(err);
            }

            PartitionDTO partitionDTO = null;
            if (algorithm.equals("basic relevant") || algorithm.equals("minimal relevant")) {

                boolean isMinimalRelevantClosure = algorithm.equals("minimal relevant");
                Partition partition = partitionService.getPartition(knowledgeBase, query,baseRank, isMinimalRelevantClosure); //Note for Future Contributors: This can be shared by Basic and Minimal Relevant Closure
                partitionDTO = partition.toDTO();
                if (reasonerService instanceof BasicRelevantReasonerImpl){
                    ((BasicRelevantReasonerImpl) reasonerService).setPartition(partition);
                    ((BasicRelevantReasonerImpl) reasonerService).setKnowledgeBase(knowledgeBase);
                }

                if (reasonerService instanceof MinimalRelevantReasonerImpl){
                    ((MinimalRelevantReasonerImpl) reasonerService).setPartition(partition);
                    ((MinimalRelevantReasonerImpl) reasonerService).setKnowledgeBase(knowledgeBase);
                }


            }

            Entailment entailment = reasonerService.getEntailment(baseRank, query);
            results.add(new AlgorithmEvaluationDTO(algorithm, entailment, partitionDTO));
        }

        return ResponseEntity.ok(new EvaluateAllResponseDTO(baseRank.toDTO(), results));
    }
}
