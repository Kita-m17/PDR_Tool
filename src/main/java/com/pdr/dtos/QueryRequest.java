package com.pdr.dtos;

public class QueryRequest {
    private String formula; //eg. "penguin ~| !flies"
    private String algorithm; //eg. "rational"

    public QueryRequest(){}

    public QueryRequest(String formula, String algorithm){
        this.formula = formula;
        this.algorithm = algorithm;
    }

    public String getFormula() {
        return formula;
    }

    public void setFormula(String formula) {
        this.formula = formula;
    }

    public String getAlgorithm() {
        return algorithm;
    }

    public void setAlgorithm(String algorithm) {
        this.algorithm = algorithm;
    }
}
