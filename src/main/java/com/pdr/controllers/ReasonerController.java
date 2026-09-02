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

import com.pdr.dtos.BaseRankDTO;
import com.pdr.models.BaseRank;
import com.pdr.models.ErrorResponse;
import com.pdr.models.KnowledgeBase;
import com.pdr.models.Entailment;
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

@RestController //Marks this as a REST controller
@RequestMapping("/api/entailment") //Base url for the reasoner endpoints
@CrossOrigin(origins = "http://localhost:3000") //Allow cross-origin requests from the frontend
public class ReasonerController {

    private final ReasonerFactory reasonerFactory;
    private final DefeasibleParser parser;
    private final KnowledgeBaseService knowledgeBaseService;

    //Constructor injection of the services
    public ReasonerController(ReasonerFactory reasonerFactory, DefeasibleParser parser, KnowledgeBaseService knowledgeBaseService) {
        this.reasonerFactory = reasonerFactory;
        this.knowledgeBaseService = knowledgeBaseService;
        this.parser = parser;
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
}
