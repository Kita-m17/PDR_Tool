package com.pdr.controllers;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import org.tweetyproject.logics.pl.syntax.PlFormula;

import com.pdr.dtos.BaseRankDTO;
import com.pdr.dtos.KnowledgeBaseDTO;
import com.pdr.models.ErrorResponse;
import com.pdr.models.KnowledgeBase;
import com.pdr.services.KnowledgeBaseService;
import com.pdr.utils.DefeasibleParser;

@RestController //Marks class as a REST Controller
@RequestMapping("/api/knowledge-base") //Base url for the KB endpoints
@CrossOrigin(origins = "http://localhost:3000")
public class KnowledgeBaseController {
    private final KnowledgeBaseService kbService;
    private final DefeasibleParser parser;

    //Constructor injection of the service
    public KnowledgeBaseController(KnowledgeBaseService kbService, DefeasibleParser parser){
        this.kbService = kbService;
        this.parser = parser;
    }

    //Endpoint: GET /api/knowledge-base
    //Returns the current knowledge base as a DTO
    @GetMapping
    public KnowledgeBaseDTO getKnowledgeBase(){
        return new KnowledgeBaseDTO(kbService.getKnowledgeBase().toStringList());
    }

    //Endpoint: POST /api/knowledge-base/create-knowledge-base
    //Creates a new KB from formulas provided in the request body
    @PostMapping("/create-knowledge-base")
    public ResponseEntity<BaseRankDTO> createKb(@RequestBody KnowledgeBaseDTO dto) {
        // DefeasibleParser parser = new DefeasibleParser();
        List<PlFormula> formulas = dto.getFormulas().stream().map(
            f -> {
                try {
                    return (PlFormula) parser.parseFormula(f);
                } catch (Exception e) {
                    throw new RuntimeException("Invalid formula: " + f, e);
                }
            })
            .collect(Collectors.toList());

        //Build kb and save it in the service
        KnowledgeBase kb = new KnowledgeBase(formulas);
        kbService.setKnowledgeBase(kb);

        return ResponseEntity.ok(kbService.getBaseRank().toDTO());
    }

    
    //Endpoint: POST /api/knowledge-base/create-knowledge-base
    //Creates a new KB from formulas provided in the request body
    @PostMapping("/file")
    public ResponseEntity<?> createKbFromFile(@RequestParam("file") MultipartFile file) {
        try {
            if (file == null || file.isEmpty()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(new ErrorResponse(400, "Bad Request", "No file uploaded"));
            }
            
            KnowledgeBase kb = parser.parseInputStream(file.getInputStream());
            kbService.setKnowledgeBase(kb);
            return ResponseEntity.ok(kbService.getBaseRank().toDTO());
            
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(new ErrorResponse(400, "Bad Request", "Invalid knowledge base file."));
        }
    }

}