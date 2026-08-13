import { EntailmentDTO, EntailmentStepDTO, RankDTO } from '../../api/api';

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
}

export interface RankState{
    rankName: string;
    rankNumber: number;
    formulas: string[];
    isRemoved: boolean;
    isBeingRemoved: boolean;
}

export function buildDebuggerSteps(entailment: EntailmentDTO): DebuggerStep[] {
    const steps: DebuggerStep[] = [];
    const { traceSteps, baseRanking, removedRanking, entailed } = entailment;

    // Get R_infinity
    const rInfinity = baseRanking.find(r => r.rankNumber === 2147483647)?.knowledgeBase || [];
    
    // Get finite ranks
    const finiteRanks = baseRanking.filter(r => r.rankNumber !== 2147483647);

    // Track which ranks have been removed so far
    const removedSoFar = new Set<number>();

    // Step 1 -Initialise
    steps.push({
        stepNumber: 1,
        totalSteps: 0, //will update at the end
        highlightedLines: [1, 2],
        explanation: `We begin by combining all finite ranks into one working set R, alongside R∞ which always remains.\n\nWorking set R contains all defeasible statements. R∞ contains the classical statements that are never removed.`,
        workingSet: finiteRanks.flatMap(r => r.knowledgeBase),
        rInfinity,
        rankingState: buildRankingState(baseRanking, removedSoFar, -1),
        isFinalStep: false,
    });

    // Steps for each trace step
    traceSteps.forEach((traceStep, index) => {
        if (traceStep.antecedentExceptional) {
            const rankBeingRemoved = removedRanking.find(r =>r.knowledgeBase.some(f => traceStep.removed.includes(f)));


            // Step - check while condition (exceptional)
            steps.push({
                stepNumber: steps.length + 1,
                totalSteps: 0,
                highlightedLines: [3],
                explanation: `Checking: is the query antecedent still exceptional w.r.t. R∞ U R?\n\nThe materialised knowledge base classically entails the negation of the antecedent, meaning assuming it is true leads to a contradiction.\n\nResult: YES, the antecedent IS exceptional. We must remove the lowest rank.`,
                workingSet: traceStep.remaining,
                rInfinity,
                rankingState: buildRankingState(baseRanking, removedSoFar, rankBeingRemoved?.rankNumber ?? -1),
                isFinalStep: false,
            });

            // Step - remove rank
            if (rankBeingRemoved) {
                removedSoFar.add(rankBeingRemoved.rankNumber);
            }

            steps.push({
                stepNumber: steps.length + 1,
                totalSteps: 0,
                highlightedLines: [4, 5],
                explanation: `Since the antecedent is exceptional, we remove the lowest rank from the working set.\n\nRemoved: { ${traceStep.removed.join(', ')} }\n\nThe working set R is now smaller. We go back to check the while condition again.`,
                workingSet: traceStep.remaining.filter(f => !traceStep.removed.includes(f)),
                rInfinity,
                rankingState: buildRankingState(baseRanking, removedSoFar, -1),
                isFinalStep: false,
            });
        }else {

            // Step - check while condition (not exceptional)
            steps.push({
                stepNumber: steps.length + 1,
                totalSteps: 0,
                highlightedLines: [3],
                explanation: `Checking: is the query antecedent still exceptional w.r.t. R∞ U R?\n\nThe materialised knowledge base does NOT classically entail the negation of the antecedent, no contradiction arises.\n\nResult: NO, the antecedent is no longer exceptional. The loop stops.`,
                workingSet: traceStep.remaining,
                rInfinity,
                rankingState: buildRankingState(baseRanking, removedSoFar, -1),
                isFinalStep: false,
            });

            // Final step - return
            steps.push({
                stepNumber: steps.length + 1,
                totalSteps: 0,
                highlightedLines: [6],
                explanation: `We now perform the final classical entailment check.\n\nDoes R∞ U R classically entail the materialised query?\n\nRemaining set: { ${traceStep.remaining.join(', ')} }`,
                workingSet: traceStep.remaining,
                rInfinity,
                rankingState: buildRankingState(baseRanking, removedSoFar, -1),
                isFinalStep: true,
                entailed,
            });
        }
    });

    // Update total steps
    const total = steps.length;
    steps.forEach(s => s.totalSteps = total);

    return steps;
}

function buildRankingState(baseRanking: RankDTO[], removedSoFar: Set<number>, beingRemovedNow: number):RankState[]{
    return baseRanking.map(rank => ({
        rankName: rank.rankName,
        rankNumber: rank.rankNumber,
        formulas: rank.knowledgeBase,
        isRemoved: removedSoFar.has(rank.rankNumber),
        isBeingRemoved: rank.rankNumber === beingRemovedNow,
    }));
}