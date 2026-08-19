package com.pdr.dtos;

import java.util.List;

public class JustificationStepDTO {
    private Integer ID;
    private List<String> set;
    private Boolean isEntailed;
    private Boolean isMinimal;
    private String reason;
    private List<List<String>> justificationsSoFar;

    public Boolean getEntailed() {
        return isEntailed;
    }

    public Boolean getMinimal() {
        return isMinimal;
    }

    public Integer getID() {
        return ID;
    }

    public List<List<String>> getJustificationsSoFar() {
        return justificationsSoFar;
    }

    public List<String> getSet() {
        return set;
    }

    public String getReason() {
        return reason;
    }

    public void setEntailed(Boolean entailed) {
        isEntailed = entailed;
    }

    public void setMinimal(Boolean minimal) {
        isMinimal = minimal;
    }

    public void setID(Integer ID) {
        this.ID = ID;
    }

    public void setJustificationsSoFar(List<List<String>> justificationsSoFar) {
        this.justificationsSoFar = justificationsSoFar;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }

    public void setSet(List<String> set) {
        this.set = set;
    }

}
