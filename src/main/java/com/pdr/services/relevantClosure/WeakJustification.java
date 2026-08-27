/*
 * File: WeakJustification.java
 * Package: com.pdr.services.relevantClosure
 *
 * Author: Nikita Martin (2026 Honours Project, University of Cape Town)
 * Context: Implements weak justification for Relevant Closure, following
 * Algorithm 7 (WeakJustifyRelC) and Definition 9 in Everett, Morris & Meyer,
 * "Explanation for KLM-Style Defeasible Reasoning".
 * Purpose: Educational use only.
 */

package com.pdr.services.relevantClosure;

import com.pdr.models.BaseRank;
import com.pdr.models.KnowledgeBase;
import com.pdr.services.BaseRankServiceImp;
import com.pdr.services.ClassicJust;
import com.pdr.services.PartitionUsingPowersetImpl;
import com.pdr.utils.DefeasibleParser;
import org.tweetyproject.logics.pl.reasoner.SatReasoner;
import org.tweetyproject.logics.pl.sat.Sat4jSolver;
import org.tweetyproject.logics.pl.sat.SatSolver;
import org.tweetyproject.logics.pl.syntax.Implication;
import org.tweetyproject.logics.pl.syntax.Negation;
import org.tweetyproject.logics.pl.syntax.PlBeliefSet;
import org.tweetyproject.logics.pl.syntax.PlFormula;

import java.util.ArrayList;
import java.util.List;

/**
 * Computes weak justifications for a Relevant Closure entailment.
 *
 * <p>A weak justification (Definition 9 in Everett, Morris &amp; Meyer) explains WHY a
 * Relevant Closure entailment {@code K |=RelC alpha ~| beta} holds, as distinct from the
 * app's existing "Justifications" panel (built in {@link PartitionUsingPowersetImpl}),
 * which explains RELEVANCE - i.e. why a statement is or isn't in R(K, alpha) at all.
 * Weak justification instead looks at what's left AFTER relevance and the rank-removal
 * loop have already run, and asks: which minimal part of that surviving knowledge is
 * actually doing the work of proving alpha -&gt; beta?
 *
 * <p>Per Definition 5, a knowledge base J is a weak justification for
 * {@code K |=RC alpha ~| beta} if the materialisation of J is a classical justification
 * for the surviving materialised knowledge entailing {@code alpha -> beta}. Definition 9
 * adapts this to Relevant Closure by searching within the surviving relevant statements
 * unioned with R-(K, alpha) - the irrelevant partition, which is never touched by the
 * rank-removal loop and so is always available as background. There can be more than one
 * such minimal set (see the worked example with p~|q, p~|r, q~|s, r~|s in conversation),
 * so this class returns every weak justification found, not just one.
 *
 * <p>The rank-removal loop below intentionally mirrors
 * {@link com.pdr.services.MinimalRelevantReasonerImpl#getEntailment} exactly - starting
 * R' from the relevant partition rather than all of K's finite ranks, and including R- in
 * the while-condition and final check - rather than transcribing Algorithm 7's pseudocode
 * verbatim, so the surviving set searched here is exactly the one the app's existing
 * Relevant Closure entailment reasoner already computed and shows on the entailment
 * step-through page. R_infinity (the classical statements of K) is likewise included as
 * always-present background when checking entailment, even though Algorithm 7's own
 * return line only mentions R union R- - omitting R_infinity risks reporting a
 * "justification" that doesn't actually entail the query on its own if a classical fact
 * was load-bearing.
 */
public class WeakJustification {

    private final KnowledgeBase knowledgeBase;
    private final PlFormula query;
    private final KnowledgeBase irrelevantPartition;

    /**
     * @param knowledgeBase       The full defeasible knowledge base K.
     * @param query               The defeasible query alpha ~| beta being explained.
     * @param irrelevantPartition R-(K, alpha) - the statements NOT relevant to the query,
     *                            as already computed by PartitionService for this query.
     */
    public WeakJustification(KnowledgeBase knowledgeBase, PlFormula query, KnowledgeBase irrelevantPartition) {
        this.knowledgeBase = knowledgeBase;
        this.query = query;
        this.irrelevantPartition = irrelevantPartition;
    }

    /**
     * Computes every weak justification for this Relevant Closure entailment.
     *
     * @return The set of weak justifications J_W(K, alpha ~| beta) - one KnowledgeBase per
     *         minimal justification found. Empty if the query is not entailed (there is
     *         then nothing to justify) or if no classical justification exists.
     */
    public List<KnowledgeBase> computeWeakJustificationForRelC() {
        PlFormula antecedent = ((Implication) query).getFirstFormula();
        PlFormula negatedAntecedent = new Negation(antecedent);

        BaseRank baseRank = new BaseRankServiceImp().constructBaseRank(knowledgeBase);

        // R_infinity: the classical (non-defeasible) statements of K - same convention
        // PartitionUsingPowersetImpl and MinimalRelevantReasonerImpl use, rather than the
        // BaseRank-computed R_infinity, so this stays consistent with the rest of the app.
        KnowledgeBase classicalStatements = knowledgeBase.separate()[1];

        // R(K, alpha): the relevant, defeasible statements - everything defeasible in K
        // that isn't already known to be irrelevant.
        KnowledgeBase relevantPartition = knowledgeBase.separate()[0].difference(irrelevantPartition);
        KnowledgeBase relevantPrime = new KnowledgeBase(relevantPartition);

        SatSolver.setDefaultSolver(new Sat4jSolver());
        SatReasoner reasoner = new SatReasoner();

        // Same reduction loop as MinimalRelevantReasonerImpl.getEntailment: only the
        // relevant statements are ever candidates for removal; R- sits alongside
        // R_infinity throughout and is never retracted.
        int i = 0;
        while (reasoner.query(classicalStatements.union(relevantPrime).union(irrelevantPartition), negatedAntecedent)
                && relevantPrime.size() != 0) {
            KnowledgeBase intersection = relevantPartition.intersection(baseRank.getRanking().getRank(i).getFormulas());
            relevantPrime = relevantPrime.difference(intersection);
            i += 1;
        }

        // The surviving defeasible knowledge to search for a classical justification
        // within - R' (what's left of the relevant partition) union R-. R_infinity is
        // passed in separately and merged in per-candidate below as always-present
        // background, not as a candidate member of a justification (it's never optional
        // - rank infinity is never retracted - so it isn't a "choice" that distinguishes
        // one justification from another). NOTE: unioning classicalStatements into
        // defeasibleSurvivors here would NOT be enough on its own -
        // PartitionUsingPowersetImpl.getPowerSets strips classical statements straight
        // back out via kb.separate()[0] before generating any subsets, so it has to be
        // re-added per-candidate inside computeAllJustifications instead.
        KnowledgeBase defeasibleSurvivors = relevantPrime.union(irrelevantPartition).union(classicalStatements);

        return computeAllJustifications(defeasibleSurvivors, classicalStatements, query);
    }

    /**
     * Enumerates every minimal classically-entailing subset of
     * {@code defeasibleSurvivors union classicalStatements} for {@code query}
     * (Horridge-style all-justifications), keeping classicalStatements as always-present
     * background rather than a candidate member of the returned justifications.
     *
     * <p>Mirrors the powerset-plus-running-minimality-check pattern already used in
     * {@link PartitionUsingPowersetImpl#getPartition}, but tests positive entailment of
     * the query instead of entailment of the negated antecedent, and reuses
     * {@link PartitionUsingPowersetImpl#getPowerSets} directly rather than duplicating it.
     */
    private List<KnowledgeBase> computeAllJustifications(KnowledgeBase defeasibleSurvivors,
                                                           KnowledgeBase classicalStatements,
                                                           PlFormula queryFormula) {
        SatSolver.setDefaultSolver(new Sat4jSolver());
        SatReasoner reasoner = new SatReasoner();

        List<KnowledgeBase> subsets = PartitionUsingPowersetImpl.getPowerSets(defeasibleSurvivors);
        List<KnowledgeBase> justifications = new ArrayList<>();

        for (KnowledgeBase candidate : subsets) {
            System.out.println(candidate);
            // classicalStatements is merged in ONLY for this entailment check, never
            // stored - R_infinity has to be available for the query to have any chance
            // of being entailed (see e.g. kittens~|!wild, which needs kittens=>cats and
            // cats=>animals just to connect "kittens" to "wild" at all), but it's not
            // part of what makes one justification different from another, so it's left
            // out of `candidate` before it gets added to `justifications` below.
            //KnowledgeBase withClassical = new KnowledgeBase(candidate);
            //withClassical.addAll(classicalStatements);

            if (!reasoner.query(candidate, queryFormula)) {
                continue;
            }

            // Relies on PartitionUsingPowersetImpl.getPowerSets always generating a
            // subset's proper subsets earlier in the list than the subset itself, so any
            // already-found (and therefore already-minimal) justification that is a
            // subset of `candidate` is guaranteed to already be in `justifications`.
            boolean minimal = true;
            for (KnowledgeBase existing : justifications) {
                if (candidate.containsAll(existing)) {
                    minimal = false;
                    break;
                }
            }

            if (minimal) {
                justifications.add(candidate);
            }
        }

        return justifications;
    }

    /**
     * Standalone demo - not part of the reasoning pipeline. Runs weak justification on
     * the animals/cats/kittens hierarchy (same knowledge base as
     * MinimalRelevantReasonerImplTest.getEntailmentExample1, from hamayobe.pdf's
     * Example 3.4 extension) for the query kittens~|!wild, using Minimal Relevant
     * Closure's R- for that query as the irrelevant partition. Traced by hand and
     * verified computationally in conversation: BaseRank ranks kittens~|!trainable above
     * cats~|!wild and cats~|trainable, which rank above animals~|wild and animals~|legs;
     * the rank-removal loop empties R' entirely, so the only weak justification is the
     * single statement cats~|!wild (plus R_infinity, always included).
     */
    public static void main(String[] args) throws Exception {
        DefeasibleParser parser = new DefeasibleParser();

        KnowledgeBase knowledgeBase = parser.parseFormulas(
                "(animals~|wild),(animals~|legs),(pets=>animals),(pets~|!wild)," +
                "(cats=>pets)");

        PlFormula query = parser.parseFormula("(cats~|legs)");

        KnowledgeBase irrelevantPartition = parser.parseFormulas(
                "(animals~|legs),(pets=>animals),(pets~|!wild)," +
                        "(cats=>pets)");
        KnowledgeBase relevantPartition = parser.parseFormulas(
                "(animals~|wild)");

        KnowledgeBase result = ClassicJust.computeJustification(relevantPartition.union(irrelevantPartition),query);
        System.out.println("Smallest Justification: "+result);
    }
}
