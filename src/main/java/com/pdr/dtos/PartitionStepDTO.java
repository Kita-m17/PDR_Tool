package com.pdr.dtos;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

// Data Transfer Object (DTO) for a single Partition trace step
@Data
@AllArgsConstructor
@NoArgsConstructor
public class PartitionStepDTO {
    private Integer ID;
    private List<String> set;
    private List<String> minimalSet;
    private boolean isEntailed;
    private boolean isMinimal;
    private String reason;
    private List<List<String>> justificationsSoFar;



}
