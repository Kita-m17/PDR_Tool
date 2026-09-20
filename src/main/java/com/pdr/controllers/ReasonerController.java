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
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.ArrayList;
import java.util.List;

@RestController //Marks this as a REST controller
@RequestMapping("/api/entailment") //Base url for the reasoner endpoints
@CrossOrigin(origins = "http://localhost:3000") //Allow cross-origin requests from the frontend
public class ReasonerController {
    private final BaseRankService baseRankService;
    private final ReasonerFactory reasonerFactory;
    private final DefeasibleParser parser;
    private final KnowledgeBaseService knowledgeBaseService;
    private final PartitionService partitionService;

    // List of defeasible entailment algorithms handled by services
    private static final List<String> ALGORITHM_ORDER = List.of("rational", "lexicographic", "basic relevant", "minimal relevant");

    //Constructor injection of the services
    public ReasonerController(BaseRankService baseRankService, ReasonerFactory reasonerFactory, DefeasibleParser parser, KnowledgeBaseService knowledgeBaseService, PartitionService partitionService) {
        this.baseRankService = baseRankService;
        this.reasonerFactory = reasonerFactory;
        this.knowledgeBaseService = knowledgeBaseService;
        this.parser = parser;
        this.partitionService = partitionService;
    }



    /**
     * Uses a list of defeasible entailment algorithms to query check
     * @param request
     * @return intermediate computations of query checking EvaluateAllResponseDTO
     *
     */
    @PostMapping("/evaluate")
    public ResponseEntity<?> evaluateAll(@RequestBody EvaluateAllRequestDTO request) throws Exception {

        if (request.getAlgorithms() == null || request.getAlgorithms().isEmpty()) {
            ErrorResponse err = new ErrorResponse(HttpStatus.BAD_REQUEST.value(), "Bad Request", "Select at least one algorithm to evaluate");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(err);
        }

        InputDTO inputDTO = request.getInput();

        // Extract KnowledgeBase and Query information
        KnowledgeBaseDTO knowledgeBaseDTO = inputDTO.getKnowledgeBaseDTO();
        QueryDTO queryDTO = inputDTO.getQueryDTO();

        //Build kb and query from DTOs
        KnowledgeBase knowledgeBase = knowledgeBaseService.convertFromDTO(knowledgeBaseDTO);
        DefeasibleImplication query = knowledgeBaseService.convertFromDTO(queryDTO);

        //Compute BaseRank (shared if multiple algorithms)
        BaseRank baseRank = baseRankService.constructBaseRank(knowledgeBase);

        //iterate through all algorithms in list
        List<String> algorithms = request.getAlgorithms();
        List<AlgorithmEvaluationDTO> results = new ArrayList<>();
        for (String algorithm : algorithms) {
            if (!request.getAlgorithms().contains(algorithm)) {
                continue;
            }

            ReasonerService reasonerService;
            try {
                //FInd service to handle algorithm
                reasonerService = reasonerFactory.createReasoner(algorithm);
            } catch (IllegalArgumentException e) {
                ErrorResponse err = new ErrorResponse(HttpStatus.BAD_REQUEST.value(), "Bad Request", "Invalid reasoner: " + algorithm);
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(err);
            }
            //if Relevant Closure compute the partition
            PartitionDTO partitionDTO = null;
            if (algorithm.equals("basic relevant") || algorithm.equals("minimal relevant")) {
                //check if Minimal Relevant Closure
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
            //Check Query
            Entailment entailment = reasonerService.getEntailment(baseRank, query);
            //Append to result list
            results.add(new AlgorithmEvaluationDTO(algorithm, entailment, partitionDTO));
        }

        return ResponseEntity.ok(new EvaluateAllResponseDTO(baseRank.toDTO(), results));
    }
}
