import { BaseRankDTO, BaseRankStepDTO } from '../../api/api';

export interface BaseRankDebuggerStep {
    stepNumber: number;
    totalSteps: number;
    highlightedLines: number[];
    explanation: string;
    consideredFormulas: string[];
    checks: CheckDisplay[];
    assignedToRank: string[];
    carriedForward: string[];
    rankingState: BaseRankState[];
    isFinalStep: boolean;
    isInfinityStep: boolean;
    materialisedFormulas?: string[]; //for materialisation step
    originalFormulas?: string[]; //for materialisation step
}

export interface CheckDisplay {
    antecedent: string;
    isExceptional: boolean;
    reason: string;
    affectedRules: string[];
    rankNumber: number;
}

export interface BaseRankState {
    rankName: string;
    rankNumber: number;
    formulas: string[];
    isAssigned: boolean;
    isCurrentlyBeingAssigned: boolean;
}

export function baseRankSteps(baseRank: BaseRankDTO): BaseRankDebuggerStep[]{
    const steps: BaseRankDebuggerStep[] = [];
    const {traceSteps, ranking, knowledgeBase} = baseRank;

    //filter out the empty steps
    const validSteps = traceSteps.filter(s => s.consideredFormulas.length > 0);

    //track which ranks have been assigned so far
    const assignedSoFar = new Set<number>();

    //separate classical and defeasible from KB
    const defeasible = knowledgeBase.filter(f => f.includes('~|'));
    const classical = knowledgeBase.filter(f => !f.includes('~|'));

    //step 1: show original KB
    steps.push({
        stepNumber: 1,
        totalSteps: 0,
        highlightedLines: [1],
        explanation: `We start with the knowledge base K, which contains both defeasible and classical statements.\n\nDefeasible statements (α ~| β) express typical cases that can have exceptions.\nClassical statements (α => β) are strict rules that always hold.\n\nDefeasible statements: ${defeasible.join(', ') || 'none'}\nClassical statements: ${classical.join(', ') || 'none'}`,
        consideredFormulas: knowledgeBase,
        checks: [],
        assignedToRank: [],
        carriedForward: knowledgeBase,
        rankingState: buildBaseRankState(ranking, assignedSoFar, -1),
        isFinalStep: false,
        isInfinityStep: false,
        originalFormulas: knowledgeBase,
    });

    //step 2: materialise the KB
    const materialisedFormulas = knowledgeBase.map(f => f.replace('~|', '=>'));
    steps.push({
        stepNumber: 2,
        totalSteps: 0,
        highlightedLines: [2],
        explanation: `We materialise the knowledge base by converting all defeasible statements α ~| β into classical implications α → β.\n\nThis gives us E₀: the starting point for the BaseRank algorithm.\n\nClassical entailment checking (via a SAT solver) can now be used to determine which statements are exceptional.`,
        consideredFormulas: validSteps[0]?.consideredFormulas || [],
        checks: [],
        assignedToRank: [],
        carriedForward: validSteps[0]?.consideredFormulas || [],
        rankingState: buildBaseRankState(ranking, assignedSoFar, -1),
        isFinalStep: false,
        isInfinityStep: false,
        originalFormulas: knowledgeBase,
        materialisedFormulas,
    });

    //Steps for each trace step
    validSteps.forEach((traceStep) => {
        const isInfinityStep = traceStep.iteration === 2147483647;

        if (isInfinityStep) {
            assignedSoFar.add(2147483647);

            //R_infinity step
            steps.push({
                stepNumber: steps.length + 1,
                totalSteps: 0,
                highlightedLines: [7, 8, 9, 10],
                explanation: `The loop has terminated, as no more exceptional statements remain.\n\nAll classical statements are assigned to Rank ∞. These statements are never exceptional, as they hold true in all worlds and are never removed during the Rational Closure entailment process.\n\nR∞ = { ${traceStep.assignedRanks.join(', ')} }`,
                consideredFormulas: traceStep.consideredFormulas,
                checks: [],
                assignedToRank: traceStep.assignedRanks,
                carriedForward: [],
                rankingState: buildBaseRankState(ranking, assignedSoFar, 2147483647),
                isFinalStep: false,
                isInfinityStep: true,
            });

            //final summary step
            steps.push({
                stepNumber: steps.length + 1,
                totalSteps: 0,
                highlightedLines: [10],
                explanation: `BaseRank construction is complete.\n\nThe knowledge base has been partitioned into ranked sets based on exceptionality. Lower ranks contain more general defaults, higher ranks contain more specific exceptions, and Rank ∞ contains classical facts that always hold.`,
                consideredFormulas: [],
                checks: [],
                assignedToRank: [],
                carriedForward: [],
                rankingState: buildBaseRankState(ranking, assignedSoFar, -1),
                isFinalStep: true,
                isInfinityStep: false,
            });
            return;
        }

        //exceptionality check step
        steps.push({
            stepNumber: steps.length + 1,
            totalSteps: 0,
            highlightedLines: [3, 4],
            explanation: `Iteration ${traceStep.iteration}: Checking exceptionality.\n\nFor each antecedent α in the current set, we ask: does the materialised KB classically entail ¬α?\n\nIf yes, assuming α is true leads to a contradiction, α is exceptional and its rules carry forward to the next iteration.\nIf no, α is not exceptional and its rules are assigned to Rank ${traceStep.iteration}.`,
            consideredFormulas: traceStep.consideredFormulas,
            checks: traceStep.checks.map(c => ({
                antecedent: c.antecedant,
                isExceptional: c.exceptionality,
                reason: c.reason,
                affectedRules: c.affectedRules,
                rankNumber: c.rankNumber,
            })),
            assignedToRank: [],
            carriedForward: [],
            rankingState: buildBaseRankState(ranking, assignedSoFar, -1),
            isFinalStep: false,
            isInfinityStep: false,
        });

        //mark this rank as assigned
        if (traceStep.assignedRanks.length > 0) {
            assignedSoFar.add(traceStep.iteration);
        }

        steps.push({
            stepNumber: steps.length + 1,
            totalSteps: 0,
            highlightedLines: [5, 6],
            explanation: `Assigning Rank ${traceStep.iteration}.\n\nNon-exceptional statements are assigned to Rank ${traceStep.iteration}:\n${traceStep.assignedRanks.join(', ') || 'none'}\n\nExceptional statements carry forward to the next iteration:\n${traceStep.carriedForward.join(', ') || 'none, loop will terminate'}`,
            consideredFormulas: traceStep.consideredFormulas,
            checks: [],
            assignedToRank: traceStep.assignedRanks,
            carriedForward: traceStep.carriedForward,
            rankingState: buildBaseRankState(ranking, assignedSoFar, traceStep.iteration),
            isFinalStep: false,
            isInfinityStep: false,
        });
    });

    //Update total steps
    const total = steps.length;
    steps.forEach(s => s.totalSteps = total);

    return steps;

}

function buildBaseRankState(ranking: any[], assignedSoFar: Set<number>, currentIteration: number): BaseRankState[] {
    return ranking.map(rank => ({
        rankName: rank.rankName,
        rankNumber: rank.rankNumber,

        // only show formulas if rank has been assigned or is being assigned now
        formulas: assignedSoFar.has(rank.rankNumber) || rank.rankNumber === currentIteration ? rank.knowledgeBase : [],  // ← empty until assigned

        isAssigned: assignedSoFar.has(rank.rankNumber),
        isCurrentlyBeingAssigned: rank.rankNumber === currentIteration,
    }));
}