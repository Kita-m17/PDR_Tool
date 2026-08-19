package com.pdr.models;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
@Data
@NoArgsConstructor
@AllArgsConstructor
public class JustificationStep {
    private Integer id;
    private List<String> set;
    private boolean isEntailed;
    private boolean isMinimal;
    private String reason;
    private List<List<String>> justificationsSoFar;
}
