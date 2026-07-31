/*
 * File: KnowledgeBaseDTO.java
 * Package: com.pdr.dtos
 *
 * Author: Julia Cotterrell (2025 Honours Project, University of Cape Town)
 * Status: Unmodified - used as is
 * 
 * Context: Used for PDR project to support entailment algorithm
 * and encrypted communication.
 * Purpose: Educational use only.
 */
package com.pdr.dtos;
import java.util.List;

// Data Transfer Object (DTO) for carrying a knowledge base between backend and frontend
public class KnowledgeBaseDTO {
    private List<String> formulas;

    /**
     * Default Constructor
     */
    public KnowledgeBaseDTO(){}

    /**
     * Constructor to set the formulas
     * @param formulas
     */
    public KnowledgeBaseDTO(List<String> formulas){
        this.formulas = formulas;
    }

    /**
     * @return List<String>
     */
    public List<String> getFormulas(){
        return this.formulas;
    }

    /**
     * @param formulas
     */
    public void setFormulas(List<String> formulas){
        this.formulas = formulas;
    }
    
}
