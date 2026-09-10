/*
 * File: ReasonerFactory.java
 * Package: com.pdr.services
 *
 * Original Author: Thabo Vincent Moloi , Honours Project (2024), University of Cape Town
 * Adapted by: Julia Cotterrell (2025 Honours Project, University of Cape Town)
 * Adapted by: Nikita Martin (2026 Honours Project, University of Cape Town)
 *
 * Status: Modified – replaced BaseRankService with KnowledgeBaseService.
 * Context: Used in PDT project for the entailment algorithms.
 * Purpose: Educational use only.
 */
package com.pdr.controllers;

import com.pdr.dtos.AlgorithmEvaluationDTO;
import com.pdr.dtos.BaseRankDTO;
import com.pdr.dtos.EvaluateAllRequestDTO;
import com.pdr.dtos.EvaluateAllResponseDTO;
import com.pdr.dtos.PartitionDTO;
import com.pdr.models.BaseRank;
import com.pdr.models.ErrorResponse;
import com.pdr.models.KnowledgeBase;
import com.pdr.models.Entailment;
import com.pdr.models.Partition;
import com.pdr.services.PartitionService;
import com.pdr.services.ReasonerFactory;
import com.pdr.services.ReasonerService;
import com.pdr.services.KnowledgeBaseService;
import com.pdr.utils.DefeasibleParser;
import com.pdr.dtos.QueryRequest;

import org.tweetyproject.logics.pl.syntax.PlFormula;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.ByteArrayInputStream;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;

@RestController //Marks this as a REST controller
@RequestMapping("/api/entailment") //Base url for the reasoner endpoints
@CrossOrigin(origins = "http://localhost:3000") //Allow cross-origin requests from the frontend
public class ReasonerController {

    private final ReasonerFactory reasonerFactory;
    private final DefeasibleParser parser;
    private final KnowledgeBaseService knowledgeBaseService;
    private final PartitionService partitionService;

    // Fixed display order for the combined evaluate-all endpoint, regardless of
    // what order the user selected algorithms in - so the resulting button row
    // is always laid out the same way, left to right.
    private static final List<String> ALGORITHM_ORDER = List.of("rational", "lexicographic", "basic relevant", "minimal relevant");

    //Constructor injection of the services
    public ReasonerController(ReasonerFactory reasonerFactory, DefeasibleParser parser, KnowledgeBaseService knowledgeBaseService, PartitionService partitionService) {
        this.reasonerFactory = reasonerFactory;
        this.knowledgeBaseService = knowledgeBaseService;
        this.parser = parser;
        this.partitionService = partitionService;
    }

    //Endpoint:POST /api/entailment/{reasoner}
    @PostMapping("/{reasoner}")
    public ResponseEntity<?> getEntailment(
            @PathVariable String reasoner, //chosen reasoner type (e.g., "rational")
            @RequestBody String queryFormula //the formula to be queried for entailment
            )
    { //KB provided in the request body

        // 1) build the KB from the request body
        // KnowledgeBase kb;
        // try{
        //     String joined = String.join("\n", dto.getKnowledgeBase());
        //     ByteArrayInputStream inputStream = new ByteArrayInputStream(joined.getBytes(StandardCharsets.UTF_8));
        //     kb = parser.parseInputStream(inputStream);
        // } catch (Exception e) {
        //     return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(new ErrorResponse( HttpStatus.BAD_REQUEST.value(), "Bad Request", "Invalid request body or knowledge base"));
        // }

        // 2a) construct the base rank model from the KB
        BaseRank baseRank = knowledgeBaseService.getBaseRank();

        //2b) resolve the request reasoner
        ReasonerService svc;
        try{
            svc = reasonerFactory.createReasoner(reasoner);
        } catch (IllegalArgumentException e){
            ErrorResponse err = new ErrorResponse( HttpStatus.BAD_REQUEST.value(), "Bad Request", "Invalid reasoner: " + reasoner);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(err);
        }

        // 3) parse the query formula into a PlFormula object
        PlFormula formula;
        try{
            formula = parser.parseFormula(queryFormula);
        } catch (Exception e){
            ErrorResponse err = new ErrorResponse( HttpStatus.BAD_REQUEST.value(), "Bad Request", "Invalid query formula: " + queryFormula);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(err);
        }

        // 4) get the entailment result from the reasoner service
        Entailment result = svc.getEntailment(baseRank, formula);
        System.out.println("Entailment result: " + result);
        // 5) return the result to the client
        return ResponseEntity.ok(result);
    }

    // Endpoint: POST /api/entailment/evaluate-all
    // Evaluates the query under every algorithm the user selected in one call,
    // reusing the single already-cached base rank (knowledgeBaseService.getBaseRank())
    // for all of them instead of recomputing it per algorithm.
    @PostMapping("/evaluate-all")
    public ResponseEntity<?> evaluateAll(@RequestBody EvaluateAllRequestDTO request) {

        if (request.getAlgorithms() == null || request.getAlgorithms().isEmpty()) {
            ErrorResponse err = new ErrorResponse(HttpStatus.BAD_REQUEST.value(), "Bad Request", "Select at least one algorithm to evaluate");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(err);
        }

        PlFormula formula;
        try {
            formula = parser.parseFormula(request.getQuery());
        } catch (Exception e) {
            ErrorResponse err = new ErrorResponse(HttpStatus.BAD_REQUEST.value(), "Bad Request", "Invalid query formula: " + request.getQuery());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(err);
        }

        // Already-cached - not recomputed here, and not recomputed again inside
        // partitionService.getPartition() below either (see PartitionUsingPowersetImpl).
        BaseRank baseRank = knowledgeBaseService.getBaseRank();
        KnowledgeBase knowledgeBase = knowledgeBaseService.getKnowledgeBase();

        List<AlgorithmEvaluationDTO> results = new ArrayList<>();
        for (String algorithm : ALGORITHM_ORDER) {
            if (!request.getAlgorithms().contains(algorithm)) {
                continue;
            }

            ReasonerService svc;
            try {
                svc = reasonerFactory.createReasoner(algorithm);
            } catch (IllegalArgumentException e) {
                ErrorResponse err = new ErrorResponse(HttpStatus.BAD_REQUEST.value(), "Bad Request", "Invalid reasoner: " + algorithm);
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(err);
            }

            PartitionDTO partitionDTO = null;
            if (algorithm.equals("basic relevant") || algorithm.equals("minimal relevant")) {

                boolean isMinimalRelevantClosure = algorithm.equals("minimal relevant");
                Partition partition = partitionService.getPartition(knowledgeBase, formula, isMinimalRelevantClosure);
                partitionDTO = partition.toDTO();
            }

            Entailment entailment = svc.getEntailment(baseRank, formula);
            results.add(new AlgorithmEvaluationDTO(algorithm, entailment, partitionDTO));
        }

        return ResponseEntity.ok(new EvaluateAllResponseDTO(baseRank.toDTO(), results));
    }
}
