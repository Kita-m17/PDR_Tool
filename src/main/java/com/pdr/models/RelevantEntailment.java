package com.pdr.models;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.pdr.dtos.RankDTO;

import java.util.List;
import java.util.stream.Collectors;

public class RelevantEntailment extends Entailment{
    /**
     * Constructor using the builder pattern
     *
     * @param builder
     */
    protected RelevantEntailment(EntailmentBuilder<?> builder) {
        super(builder);
    }
    public static RationalEntailment.RationalEntailmentBuilder builder(){
        return new RationalEntailment.RationalEntailmentBuilder();
    }




    // builer class for rational entailment
    public static class RelevantEntailmentBuilder extends EntailmentBuilder<RelevantEntailment.RelevantEntailmentBuilder>{
        private Ranking removedRanking;



        @Override
        protected RelevantEntailment.RelevantEntailmentBuilder self(){
            return this;
        }

        @Override
        public RelevantEntailment build(){
            return new RelevantEntailment(this);
        }
    }




}
