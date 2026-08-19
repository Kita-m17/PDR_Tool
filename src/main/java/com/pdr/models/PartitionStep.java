package com.pdr.models;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

import com.pdr.dtos.PartitionStepDTO;
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PartitionStep {
    private Integer id;
    private KnowledgeBase set;
    private boolean isEntailed;
    private boolean isMinimal;
    private String reason;
    private List<KnowledgeBase> justificationsSoFar;

    /**
     * Converts this PartitionStep instance to a PartitionStepDTO for data transfer.
     * @return PartitionStepDTO The DTO representation of this PartitionStep
     */
    public PartitionStepDTO toDTO() {
        PartitionStepDTO dto = new PartitionStepDTO();
        dto.setID(this.id);
        dto.setSet(this.set != null ? this.set.getStringFormulas() : new ArrayList<>());
        dto.setEntailed(this.isEntailed);
        dto.setMinimal(this.isMinimal);
        dto.setReason(this.reason);
        dto.setJustificationsSoFar(this.justificationsSoFar != null
                ? this.justificationsSoFar.stream().map(KnowledgeBase::getStringFormulas).collect(Collectors.toList())
                : new ArrayList<>());
        return dto;
    }
}
