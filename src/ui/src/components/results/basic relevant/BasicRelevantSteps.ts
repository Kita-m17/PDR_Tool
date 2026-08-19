import { EntailmentDTO, EntailmentStepDTO, RankDTO } from '../../../api/api';

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
    queryAntecedent?: string
    queryConsequent?: string;
    // i - which rank is currently under consideration for removal, -1 when
    // the loop isn't actively checking/removing a specific rank right now.
    currentRankIndex: number;
    // Live snapshot of R' at this point in the trace, so the visualiser can
    // show it shrinking step by step.
    currentRPrime: string[];
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

export function buildDebuggerSteps(entailment: EntailmentDTO): DebuggerStep[] {
    const steps: DebuggerStep[] = [];
    const { traceSteps, baseRanking, entailed, queryFormula } = entailment;

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
        highlightedLines: [3, 3],
        explanation: `Before beginning the entailment check, we materialise the ranked knowledge base.\n\nEach defeasible statement α ~| β is converted to a classical implication α → β. This allows us to use classical entailment checking (via a SAT solver) throughout the algorithm.\n\nThe finite ranks form the sets Ri, while R∞ contains the classical statements that always remain.`,
        workingSet: finiteRanks.flatMap(r => r.knowledgeBase),
        rInfinity,
        materialisedWorking: finiteRanks.flatMap(r =>
            r.knowledgeBase.map(f => f.replace('~|', '=>'))
        ),
        rankingState: buildRankingState(baseRanking, removedFormulas, new Set(), -1),
        isFinalStep: false,
        isInitialStep: true,
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
        explanation: `We begin the entailment process by initialising R' to the relevant partition and R- to the irrelevant partition.\n\nR∞ contains the classical statements that are never removed.`,
        workingSet: finiteRanks.flatMap(r => r.knowledgeBase).map(f => f.replace('~|', '=>')),
        rInfinity,
        rankingState: buildRankingState(baseRanking, removedFormulas, new Set(), -1),
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
                explanation: `Checking: is the query antecedent still exceptional w.r.t. R∞ U R- U R' and R' is not empty?\n\nR∞ U R- U R' classically entails the negation of the antecedent, meaning assuming it is true leads to a contradiction.\n\nResult: YES, the antecedent IS exceptional. We must remove the relevant statements in the exceptional ranks, starting from the lowest rank 0.`,
                workingSet: traceStep.remaining.map(f => f.replace('~|', '=>')),
                rInfinity,
                rankingState: buildRankingState(baseRanking, removedFormulas, new Set(), traceStep.iteration),
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
                explanation: `Since the antecedent is exceptional, we remove the relevant statements from the R'.\n\nRemoved: { ${traceStep.removed.map(f => f.replace('~|', '=>')).join(', ')} }\n\nR' is now smaller. We go back to check the while condition again.`,
                workingSet: traceStep.remaining.filter(f => !traceStep.removed.includes(f)).map(f => f.replace('~|', '=>')),
                rInfinity,
                rankingState: buildRankingState(baseRanking, removedFormulas, new Set(traceStep.removed), traceStep.iteration),
                isFinalStep: false,
                queryAntecedent,
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
                explanation: `Checking: is the query antecedent still exceptional w.r.t. R∞ U R- U R'?\n\nR∞ U R- U R' does NOT classically entail the negation of the antecedent, no contradiction arises.\n\nResult: NO, the antecedent is no longer exceptional. The loop stops.`,
                workingSet: traceStep.remaining.map(f => f.replace('~|', '=>')),
                rInfinity,
                rankingState: buildRankingState(baseRanking, removedFormulas, new Set(), -1),
                isFinalStep: false,
                queryAntecedent,
                queryConsequent,
                currentRankIndex: -1,
                currentRPrime: traceStep.remaining.map(f => f.replace('~|', '=>')),
            });

            // Final step - return
            steps.push({
                stepNumber: steps.length + 1,
                totalSteps: 0,
                highlightedLines: [10],
                explanation: `We now perform the final classical entailment check.\n\nDoes R∞ U R- U R' classically entail the materialised query?\n\nRemaining set: { ${traceStep.remaining.map(f => f.replace('~|', '=>')).join(', ')} }`,
                workingSet: traceStep.remaining.map(f => f.replace('~|', '=>')),
                rInfinity,
                rankingState: buildRankingState(baseRanking, removedFormulas, new Set(), -1),
                isFinalStep: true,
                entailed,
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
