package com.pdr.controllers;

import com.pdr.models.ErrorResponse;
import com.pdr.models.Justification;
import com.pdr.models.KnowledgeBase;
import com.pdr.services.JustificationService;
import com.pdr.services.KnowledgeBaseService;
import com.pdr.utils.DefeasibleParser;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.tweetyproject.logics.pl.syntax.PlFormula;

@RestController
@RequestMapping("/api/justification/relevant/basic") // Default mapping
@CrossOrigin(origins = "http://localhost:3000")
public class JustificationController {
    private final JustificationService justificationService;
    private final KnowledgeBaseService kbService;
    private final DefeasibleParser parser;

    public JustificationController(JustificationService justificationService, KnowledgeBaseService kbService, DefeasibleParser parser) {
        this.justificationService = justificationService;
        this.kbService = kbService;
        this.parser = parser;
    }

    @PostMapping("/create")
    public ResponseEntity<?> createPartition(@RequestBody String query) {
        // Parse the incoming formula; return 400 with a helpful message instead of
        // letting a parse failure bubble up as an opaque 500.
        PlFormula formula;
        try {
            formula = parser.parseFormula(query);
        } catch (Exception e) {
            ErrorResponse err = new ErrorResponse(HttpStatus.BAD_REQUEST.value(), "Bad Request", "Invalid query formula: " + query);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(err);
        }

        return ResponseEntity.ok(justificationService.getPartition(kbService.getKnowledgeBase(), formula));
    }




}
