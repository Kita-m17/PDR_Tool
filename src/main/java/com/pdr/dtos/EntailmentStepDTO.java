package com.pdr.dtos;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder(setterPrefix = "with")
public class EntailmentStepDTO {
    private int iteration; // The iteration number of this entailment step
    private List<String> remaining; // The remaining knowledge base after this entailment step
    private boolean antecedentExceptional; // True if the antecedent is exceptional, false otherwise
    private String reason; // Reason for the exceptionality result, e.g., "Exceptional because it leads to a contradiction."
    private List<String> removed; // The removed knowledge base after this entailment step


}
