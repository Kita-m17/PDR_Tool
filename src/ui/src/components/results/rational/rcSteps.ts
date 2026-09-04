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
    const { traceSteps, baseRanking, removedRanking = [], entailed, queryFormula } = entailment;

    // Get R_infinity
    const rInfinity = baseRanking.find(r => r.rankNumber === 2147483647)?.knowledgeBase || [];
    
    // Get finite ranks
    const finiteRanks = baseRanking.filter(r => r.rankNumber !== 2147483647);

    // Track which ranks have been removed so far
    const removedSoFar = new Set<number>();

    // Get antecedent of query
    const queryAntecedent = queryFormula?.replace(/[()]/g, '')?.split('~|')[0]?.split('=>')[0]?.trim() || '';

    // Get consequent of query (handles both ~| and =>)
    const rawConsequent = queryFormula?.replace(/[()]/g, '').includes('~|')
        ? queryFormula?.replace(/[()]/g, '')?.split('~|')[1]
        : queryFormula?.replace(/[()]/g, '')?.split('=>')[1];

    const queryConsequent = rawConsequent?.replace('!', '').trim() || '';

    // Step 1: Show BaseRank and materialisation BEFORE the loop
    // steps.push({
    //     stepNumber: 1,
    //     totalSteps: 0,
    //     highlightedLines: [2, 3, 4],
    //     explanation: `Before beginning the entailment check, we materialise the ranked knowledge base.\n\nEach defeasible statement α ~| β is converted to a classical implication α → β. This allows us to use classical entailment checking (via a SAT solver) throughout the algorithm.\n\nThe finite ranks form the working set R, while R∞ contains the classical statements that always remain.`,
    //     workingSet: finiteRanks.flatMap(r => r.knowledgeBase),
    //     rInfinity,
    //     materialisedWorking: finiteRanks.flatMap(r => 
    //         r.knowledgeBase.map(f => f.replace('~|', '=>'))
    //     ),
    //     rankingState: buildRankingState(baseRanking, new Set<number>(), -1),
    //     isFinalStep: false,
    //     isInitialStep: true,
    //     queryAntecedent,
    //     queryConsequent,
    // });

    // Step 1 -Initialise
    steps.push({
        stepNumber: 2,
        totalSteps: 0, //will update at the end
        highlightedLines: [2,3,4],
        explanation: `We begin the entailment process by combining all finite ranks into one working set R, alongside R∞ which always remains.\n\nWorking set R contains all defeasible statements. R∞ contains the classical statements that are never removed.`,
        workingSet: finiteRanks.flatMap(r => r.knowledgeBase).map(f => f.replace('~|', '=>')),
        rInfinity,
        rankingState: buildRankingState(baseRanking, removedSoFar, -1),
        isFinalStep: false,
        queryAntecedent,
        queryConsequent,
    });

    // Steps for each trace step
    traceSteps.forEach((traceStep, index) => {
        if (traceStep.antecedentExceptional) {
            const rankBeingRemoved = removedRanking.find(r =>r.knowledgeBase.some(f => traceStep.removed.includes(f)));


            // Step - check while condition (exceptional)
            steps.push({
                stepNumber: steps.length + 1,
                totalSteps: 0,
                highlightedLines: [5],
                explanation: `Checking: is the query antecedent still exceptional w.r.t. R∞ U R?\n\nThe materialised knowledge base classically entails the negation of the antecedent, meaning assuming it is true leads to a contradiction.\n\nResult: YES, the antecedent IS exceptional. We must remove the lowest rank.`,
                workingSet: traceStep.remaining.map(f => f.replace('~|', '=>')),
                rInfinity,
                rankingState: buildRankingState(baseRanking, removedSoFar, rankBeingRemoved?.rankNumber ?? -1),
                isFinalStep: false,
                queryAntecedent,
                queryConsequent,
            });

            // Step - remove rank
            if (rankBeingRemoved) {
                removedSoFar.add(rankBeingRemoved.rankNumber);
            }

            steps.push({
                stepNumber: steps.length + 1,
                totalSteps: 0,
                highlightedLines: [6,7],
                explanation: `Since the antecedent is exceptional, we remove the lowest rank from the working set.\n\nRemoved: { ${traceStep.removed.map(f => f.replace('~|', '=>')).join(', ')} }\n\nThe working set R is now smaller. We go back to check the while condition again.`,
                workingSet: traceStep.remaining.filter(f => !traceStep.removed.includes(f)).map(f => f.replace('~|', '=>')),
                rInfinity,
                rankingState: buildRankingState(baseRanking, removedSoFar, -1),
                isFinalStep: false,
                queryAntecedent,
                queryConsequent,
            });
        }else {

            // Step - check while condition (not exceptional)
            steps.push({
                stepNumber: steps.length + 1,
                totalSteps: 0,
                highlightedLines: [5],
                explanation: `Checking: is the query antecedent still exceptional w.r.t. R∞ U R?\n\nThe materialised knowledge base does NOT classically entail the negation of the antecedent, no contradiction arises.\n\nResult: NO, the antecedent is no longer exceptional. The loop stops.`,
                workingSet: traceStep.remaining.map(f => f.replace('~|', '=>')),
                rInfinity,
                rankingState: buildRankingState(baseRanking, removedSoFar, -1),
                isFinalStep: false,
                queryAntecedent,
                queryConsequent,
            });

            // Final step - return
            steps.push({
                stepNumber: steps.length + 1,
                totalSteps: 0,
                highlightedLines: [8,9],
                explanation: `We now perform the final classical entailment check.\n\nDoes R∞ U R classically entail the materialised query?\n\nRemaining set: { ${traceStep.remaining.map(f => f.replace('~|', '=>')).join(', ')} }`,
                workingSet: traceStep.remaining.map(f => f.replace('~|', '=>')),
                rInfinity,
                rankingState: buildRankingState(baseRanking, removedSoFar, -1),
                isFinalStep: true,
                entailed,
                queryAntecedent,
                queryConsequent,
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