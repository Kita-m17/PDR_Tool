/**
 * File: Entailment.java
 * Package: com.pdr.models
 * 
 * Original Author: Thabo Vincent Moloi (2024 Honours Project, University of Cape Town)
 * Modified by: Nikita Martin (2026 Honours Project, University of Cape Town)
 * Context: Used in PDR project for defeasible reasoning algorithms.
 * Purpose: Used for educational purposes
 */

package com.pdr.models;

import org.tweetyproject.logics.pl.syntax.PlFormula;
import java.util.List;

// Base class for Entailment results
public abstract class Entailment {
    protected final KnowledgeBase knowledgeBase; // The knowledge base from which the entailment is derived
    protected final PlFormula queryFormula; // The formula being queried for entailment
    protected final Ranking baseRanking; // The ranking of the knowledge base used for defeasible reasoning
    protected final boolean entailed; // Whether the query is entailed
    protected final List<EntailmentStep> traceSteps; // Trace of the algorithm


    /**
     * Constructor using the builder pattern
     */
    protected Entailment(EntailmentBuilder<?> builder) {
        this.knowledgeBase = builder.knowledgeBase;
        this.queryFormula = builder.queryFormula;
        this.baseRanking = builder.baseRanking;
        this.entailed = builder.entailed;
        this.traceSteps = builder.traceSteps;
    }

    // --- Getters ---

    /**
     * @return KnowledgeBase
     */
    public KnowledgeBase getKnowledgeBase() {
        return knowledgeBase;
    }

    /**
     * @return PlFormula
     */
    public PlFormula getQueryFormula() {
        return queryFormula;
    }

    /**
     * @return Ranking
     */
    public Ranking getBaseRanking() {
        return baseRanking;
    }

    /**
     * @return boolean
     */
    public boolean getEntailed() {
        return entailed;
    }

    /**
     * @return List<EntailmentStep>  The trace of the algorithm, detailing each step of the base rank construction.
     */
    public List<EntailmentStep> getTraceSteps() {
        return traceSteps;
    }

    // Builder for Entailment
    public static abstract class EntailmentBuilder<T extends EntailmentBuilder<T>> {
        private KnowledgeBase knowledgeBase;
        private PlFormula queryFormula;
        private Ranking baseRanking;
        private boolean entailed;
        private List<EntailmentStep> traceSteps;

        /**
         * 
         */
        public T withKnowledgeBase(KnowledgeBase knowledgeBase) {
            this.knowledgeBase = knowledgeBase;
            return self();
        }

        public T withQueryFormula(PlFormula queryFormula) {
            this.queryFormula = queryFormula;
            return self();
        }

        public T withBaseRanking(Ranking baseRanking) {
            this.baseRanking = baseRanking;
            return self();
        }

        public T withEntailed(boolean entailed) {
            this.entailed = entailed;
            return self();
        }

        public T withTraceSteps(List<EntailmentStep> traceSteps) {
            this.traceSteps = traceSteps;
            return self();
        }

        protected abstract T self();

        public abstract Entailment build();
    }
}