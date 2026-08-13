package com.pdr.dtos;

import java.util.List;

//Data Transfer Object (DTO) for the base rank step trace
public class BaseRankStepDTO {
    private int iteration; //iteration number of the base rank step
    private List<String> consideredFormulas; //the formulas from the knowledge base that are considered in this step
    private List<String> assignedRanks; //the formulas from the knowledge base that are assigned a rank in this step
    private List<String> carriedForward; //the formulas from the knowledge base that are carried forward to the next step
    private List<ExceptionalityCheckDTO> checks; //the exceptionality checks performed in this step

    /**
     * Default Constructor
     */
    public BaseRankStepDTO(){}

    /**
     * Parameterised Constructor
     * @param iteration
     * @param consideredFormulas
     * @param assignedRanks
     * @param carriedForward
     * @param checks
     */
    public BaseRankStepDTO(int iteration, List<String> consideredFormulas, List<String> assignedRanks, List<String> carriedForward, List<ExceptionalityCheckDTO> checks){
        this.iteration = iteration;
        this.consideredFormulas = consideredFormulas;
        this.assignedRanks = assignedRanks;
        this.carriedForward = carriedForward;
        this.checks = checks;
    }

    /**
     * @return int iteration number
     */
    public int getIteration(){
        return this.iteration;
    }

    /**
     * @param iteration
     */
    public void setIteration(int iteration){
        this.iteration = iteration;
    }

    /**
     * @return List<String> considered formulas
     */
    public List<String> getConsideredFormulas(){
        return this.consideredFormulas;
    }

    /**
     * @param consideredFormulas
     */
    public void setConsideredFormulas(List<String> consideredFormulas){
        this.consideredFormulas = consideredFormulas;
    }

    /**
     * @return List<String> assigned ranks
     */
    public List<String> getAssignedRanks(){
        return this.assignedRanks;
    }

    /**
     * @param assignedRanks
     */
    public void setAssignedRanks(List<String> assignedRanks){
        this.assignedRanks = assignedRanks;
    }

    /**
     * @return List<String> carried forward formulas
     */
    public List<String> getCarriedForward(){
        return this.carriedForward;
    }

    /**
     * @param carriedForward
     */
    public void setCarriedForward(List<String> carriedForward){
        this.carriedForward = carriedForward;
    }

    /**
     * @return List<ExceptionalityCheckDTO> checks
     */
    public List<ExceptionalityCheckDTO> getChecks(){
        return this.checks;
    }

    /**
     * @param checks
     */
    public void setChecks(List<ExceptionalityCheckDTO> checks){
        this.checks = checks;
    }

}
