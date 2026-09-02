import { EntailmentDTO, EntailmentStepDTO, RankDTO } from '../../../api/api';
import { TexFormula } from '../../ui/TexFormula';

export interface DebuggerStep {
    stepNumber: number;
    totalSteps: number;
    highlightedLines: number[];
    explanation: string;
    workingSet: string[];
    rInfinity: string[];
    rankingState: RankState[];
    isFinalStep: boolean;
    entailed?: boolean;
    materialisedWorking?: string[];
    isInitialStep?: boolean;
    isBaseRank?: boolean;
    isWhileLoopIntersection?: boolean;
    queryAntecedent?: string
    queryConsequent?: string;
    removed: string[];
    currentRankIndex: number;
    currentRPrime: string[];
    // Only set on the dedicated Result step at the very end - the smallest
    // weak justification (proof) for the entailment, straight from the
    // backend's RelevantEntailment.smallestWeakJustification.
    weakJustification?: string[];
    // Marks the dedicated final "Entailed? / Proof" page, distinct from the
    // preceding final classical-entailment-check step.
    isResultStep?: boolean;
}

// A single formula within a rank, with its own removal status - relevant
// closure only removes the relevant formulas of a rank (relevantPartition
// intersected with that rank), not the rank as a whole, so removal has to
// be tracked per-statement rather than per-rank.
export interface RankStatement {
    formula: string;
    isRemoved: boolean;
    isBeingRemoved: boolean;
}

export interface RankState{
    rankName: string;
    rankNumber: number;
    // true when this rank is the one currently being examined (i.e.
    // rank.rankNumber === traceStep.iteration for the active step)
    isCurrent: boolean;
    statements: RankStatement[];
}
function getAntecedent(formula: string): string {
    const stripped = formula.replace(/[()]/g, '');
    return stripped.split(/\|~|~\|/)[0].trim();
}
export function buildDebuggerSteps(entailment: EntailmentDTO): DebuggerStep[] {
    const steps: DebuggerStep[] = [];
    const { traceSteps, baseRanking, entailed, queryFormula, smallestWeakJustification } = entailment;

    // Get R_infinity
    const rInfinity = baseRanking.find(r => r.rankNumber === 2147483647)?.knowledgeBase || [];

    // Get finite ranks
    const finiteRanks = baseRanking.filter(r => r.rankNumber !== 2147483647);

    // Track which individual formulas have been removed so far (relevant
    // closure removes statements out of a rank, not the whole rank - there's
    // no removedRanking on this endpoint's response to match against, but we
    // don't need it: traceStep.iteration tells us which rank is under
    // consideration and traceStep.removed tells us exactly which formulas
    // left R' at that step).
    const removedFormulas = new Set<string>();

    // Reconstruct the starting R' (before any removal happens): remaining ∪
    // removed of the first trace step, since removal only ever takes
    // formulas out of R'. If the loop never actually runs, the only trace
    // step is the final non-exceptional one and its `remaining` already IS
    // the untouched starting R'.
    const firstTraceStep = traceSteps[0];
    let currentRPrime: string[] = firstTraceStep
        ? Array.from(new Set([...firstTraceStep.remaining, ...firstTraceStep.removed]))
        : [];

    // Get antecedent of query
    const queryAntecedent = queryFormula?.replace(/[()]/g, '')?.split('~|')[0]?.split('=>')[0]?.trim() || '';

    // Get consequent of query (handles both ~| and =>)
    const rawConsequent = queryFormula?.replace(/[()]/g, '').includes('~|')
        ? queryFormula?.replace(/[()]/g, '')?.split('~|')[1]
        : queryFormula?.replace(/[()]/g, '')?.split('=>')[1];

    const queryConsequent = rawConsequent?.replace('!', '').trim() || '';

    // Step 1: Show BaseRank and materialisation BEFORE the loop
    steps.push({
        stepNumber: 1,
        totalSteps: 0,
        isBaseRank:true,
        highlightedLines: [3, 3],
        explanation: `We perform the Base Rank Algorithm and use the computed Base Rank Table as part to the Relevant Closure Algorithm `,
        workingSet: finiteRanks.flatMap(r => r.knowledgeBase),
        rInfinity,
        materialisedWorking: finiteRanks.flatMap(r =>
            r.knowledgeBase.map(f => f.replace('~|', '=>'))
        ),
        rankingState: buildRankingState(baseRanking, removedFormulas, new Set(), -1),
        isFinalStep: false,
        isInitialStep: false,
        removed:[],
        queryAntecedent,
        queryConsequent,
        currentRankIndex: -1,
        currentRPrime: currentRPrime.map(f => f.replace('~|', '=>')),
    });

    // Step 2 -Initialise
    steps.push({
        stepNumber: 2,
        totalSteps: 0, //will update at the end
        highlightedLines: [4, 5],
        explanation: `We begin the entailment process by initialising R' to the relevant partition.`,
        workingSet: finiteRanks.flatMap(r => r.knowledgeBase).map(f => f.replace('~|', '=>')),
        rInfinity,
        rankingState: buildRankingState(baseRanking, removedFormulas, new Set(), -1),
        isInitialStep: true,
        removed:[],

        isFinalStep: false,
        queryAntecedent,
        queryConsequent,
        currentRankIndex: -1,
        currentRPrime: currentRPrime.map(f => f.replace('~|', '=>')),
    });

    // Steps for each trace step
    traceSteps.forEach((traceStep, index) => {
        if (traceStep.antecedentExceptional) {
            // Step - check while condition (exceptional). traceStep.iteration
            // is the rank currently under consideration (i in the algorithm).
            // R' shown here is still the value from BEFORE this iteration's
            // removal - nothing has left it yet at check time.
            steps.push({
                stepNumber: steps.length + 1,
                totalSteps: 0,
                highlightedLines: [6],
                explanation: `We are checking if the negation of the query antecedent is entailed w.r.t. R∞ U R- U R' and R' is not empty? If R∞ U R- U R' classically entails the negation of the antecedent. The Running Knowledge Base reflect that ${getAntecedent(queryFormula)} does not exist.\n\nIn this case the Running Knowledge Base DOES entail the antecedent IS exceptional. We must remove the relevant statements in the exceptional ranks, starting from the lowest rank 0.`,
                workingSet: traceStep.remaining.map(f => f.replace('~|', '=>')),
                rInfinity,
                rankingState: buildRankingState(baseRanking, removedFormulas, new Set(), traceStep.iteration),
                removed:[],
                isFinalStep: false,
                queryAntecedent,
                queryConsequent,
                currentRankIndex: traceStep.iteration,
                currentRPrime: currentRPrime.map(f => f.replace('~|', '=>')),
            });

            // Step - remove statements. traceStep.removed is exactly the
            // relevant formulas of rank `traceStep.iteration` that leave R'
            // this iteration; traceStep.remaining is R' immediately after -
            // show that as the new, smaller R'.
            steps.push({
                stepNumber: steps.length + 1,
                totalSteps: 0,
                highlightedLines: [7, 8],
                explanation: `Since the negation of the antecedent is entailed, we remove the relevant statements from the R'. R' skrinks and considers for specific statements relating to the query. We go back to check the while condition again.`,
                workingSet: traceStep.remaining.filter(f => !traceStep.removed.includes(f)).map(f => f.replace('~|', '=>')),
                rInfinity,
                rankingState: buildRankingState(baseRanking, removedFormulas, new Set(traceStep.removed), traceStep.iteration),
                isFinalStep: false,
                isWhileLoopIntersection:true,
                queryAntecedent,
                   removed:traceStep.removed,

                queryConsequent,
                currentRankIndex: traceStep.iteration,
                currentRPrime: traceStep.remaining.map(f => f.replace('~|', '=>')),
            });

            traceStep.removed.forEach(f => removedFormulas.add(f));
            currentRPrime = traceStep.remaining;
        }else {

            // Step - check while condition (not exceptional) - loop is done,
            // no specific rank is under consideration any more.
            steps.push({
                stepNumber: steps.length + 1,
                totalSteps: 0,
                highlightedLines: [6],
                explanation: `Since the negation of the antecedent is NOT entailed, the loop stops. We use the current Running Knowledge Base to check if the query is now entailed`,
                workingSet: traceStep.remaining.map(f => f.replace('~|', '=>')),
                rInfinity,
                rankingState: buildRankingState(baseRanking, removedFormulas, new Set(), -1),
                isFinalStep: false,
                queryAntecedent,
        removed:[],

                queryConsequent,
                currentRankIndex: -1,
                currentRPrime: traceStep.remaining.map(f => f.replace('~|', '=>')),
            });

            // Final classical entailment check - no longer the last page, the
            // dedicated Result step below is.
            steps.push({
                stepNumber: steps.length + 1,
                totalSteps: 0,
                highlightedLines: [10],
                explanation: `We now perform the final classical entailment check.Does R∞ U R- U R' classically entail the materialised query?`,
                workingSet: traceStep.remaining.map(f => f.replace('~|', '=>')),
                rInfinity,
                rankingState: buildRankingState(baseRanking, removedFormulas, new Set(), -1),
                isFinalStep: false,
                entailed,
        removed:[],

                queryAntecedent,
                queryConsequent,
                currentRankIndex: -1,
                currentRPrime: traceStep.remaining.map(f => f.replace('~|', '=>')),
            });

            // Result step (dedicated last page) - states the verdict and,
            // when entailed, the weak justification (proof) for it. Shared by
            // Basic and Minimal Relevant Closure, since both algorithms
            // navigate to this same step-through component and both populate
            // smallestWeakJustification on their RelevantEntailment response.
            steps.push({
                stepNumber: steps.length + 1,
                totalSteps: 0,
                highlightedLines: [10],
                explanation: entailed
                    ? `The query IS entailed under Relevant Closure. R∞ U R- U R' classically entails the materialised query, so the defeasible entailment holds. The justification below is the smallest part of that surviving knowledge which causes the query to be entailed.`
                    : `The query is NOT entailed under Relevant Closure. R∞ U R- U R' does not classically entail the materialised query, so the defeasible entailment does not hold.`,
                workingSet: traceStep.remaining.map(f => f.replace('~|', '=>')),
                rInfinity,
                rankingState: buildRankingState(baseRanking, removedFormulas, new Set(), -1),
                isFinalStep: true,
                isResultStep: true,
                entailed,
                weakJustification: smallestWeakJustification ?? [],
                removed: [],
                queryAntecedent,
                queryConsequent,
                currentRankIndex: -1,
                currentRPrime: traceStep.remaining.map(f => f.replace('~|', '=>')),
            });
        }
    });

    // Update total steps
    const total = steps.length;
    steps.forEach(s => s.totalSteps = total);

    return steps;
}

function buildRankingState(baseRanking: RankDTO[], removedFormulas: Set<string>, beingRemovedFormulas: Set<string>, currentRankNumber: number): RankState[]{
    return baseRanking.map(rank => ({
        rankName: rank.rankName,
        rankNumber: rank.rankNumber,
        isCurrent: rank.rankNumber === currentRankNumber,
        statements: rank.knowledgeBase.map(formula => ({
            formula,
            isRemoved: removedFormulas.has(formula),
            isBeingRemoved: beingRemovedFormulas.has(formula),
        })),
    }));
}
