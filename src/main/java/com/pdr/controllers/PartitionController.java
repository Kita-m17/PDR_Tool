package com.pdr.controllers;

import com.pdr.models.ErrorResponse;
import com.pdr.services.PartitionService;
import com.pdr.services.KnowledgeBaseService;
import com.pdr.utils.DefeasibleParser;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.tweetyproject.logics.pl.syntax.PlFormula;

@RestController
@RequestMapping("/api/partition/relevant") // Default mapping
@CrossOrigin(origins = "http://localhost:3000")
public class PartitionController {
    private final PartitionService partitionService;
    private final KnowledgeBaseService kbService;
    private final DefeasibleParser parser;

    public PartitionController(PartitionService partitionService, KnowledgeBaseService kbService, DefeasibleParser parser) {
        this.partitionService = partitionService;
        this.kbService = kbService;
        this.parser = parser;
    }

    @PostMapping("/create/basic")
    public ResponseEntity<?> createBasicPartition(@RequestBody String query) {
        // Parse the incoming formula; return 400 with a helpful message instead of
        // letting a parse failure bubble up as an opaque 500.
        PlFormula formula;
        try {
            formula = parser.parseFormula(query);
        } catch (Exception e) {
            ErrorResponse err = new ErrorResponse(HttpStatus.BAD_REQUEST.value(), "Bad Request", "Invalid query formula: " + query);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(err);
        }

        return ResponseEntity.ok(partitionService.getPartition(kbService.getKnowledgeBase(), formula,false).toDTO());
    }

    @PostMapping("/create/minimal")
    public ResponseEntity<?> createMinimalPartition(@RequestBody String query) {
        // Parse the incoming formula; return 400 with a helpful message instead of
        // letting a parse failure bubble up as an opaque 500.
        PlFormula formula;
        try {
            formula = parser.parseFormula(query);
        } catch (Exception e) {
            ErrorResponse err = new ErrorResponse(HttpStatus.BAD_REQUEST.value(), "Bad Request", "Invalid query formula: " + query);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(err);
        }

        return ResponseEntity.ok(partitionService.getPartition(kbService.getKnowledgeBase(), formula,true).toDTO());
    }




}
