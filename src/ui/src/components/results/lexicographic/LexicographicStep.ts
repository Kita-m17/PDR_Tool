import { LexicographicEntailmentDTO, LexicographicStepDTO, RankDTO, SubKnowledgeBaseCheckDTO } from '../../../api/api';

export interface LexRankState {
    rankName: string;
    rankNumber: number;
    formulas: string[];
    isRemoved: boolean;         // dropped entirely - no subset survived
    isBeingWeakened: boolean;   
    weakenedTo?: string;        // the combined formula that replaced it
}

export interface LexDebuggerStep {
    stepNumber: number;
    totalSteps: number;
    highlightedLines: number[];
    explanation: string;
    workingSet: string[];       // R∞ ∪ R at this point in the algorithm
    rInfinity: string[];
    rankingState: LexRankState[];

    // populated when a rank is being weakened
    rankNumber?: number;
    rankSize?: number;
    subsetSize?: number;
    subKBs?: SubKnowledgeBaseCheckDTO[];
    combinedFormula?: string | null;
    rankRemoved?: boolean;

    // detail panel material
    stepDetails?: string;                        
    survivingSubKBs?: SubKnowledgeBaseCheckDTO[];
    subsetCount?: number;                        

    // populated on the final step
    finalChecks?: SubKnowledgeBaseCheckDTO[];
    isFinalStep: boolean;
    entailed?: boolean;
    weakJustification?: string[];
    isResultStep?: boolean;

    isInitialStep?: boolean;
    queryAntecedent?: string;
    queryConsequent?: string;
}

const R_INFINITY = 2147483647;

export function buildLexicographicSteps(entailment: LexicographicEntailmentDTO): LexDebuggerStep[] {
    const steps: LexDebuggerStep[] = [];
    const { lexicographicSteps = [], baseRanking, finalChecks = [], entailed, queryFormula, smallestWeakJustification } = entailment;

    const rInfinity = baseRanking.find(r => r.rankNumber === R_INFINITY)?.knowledgeBase || [];
    const finiteRanks = baseRanking.filter(r => r.rankNumber !== R_INFINITY);

    // Ranks resolved so far: dropped entirely, or replaced by a combined formula.
    const removedSoFar = new Set<number>();
    const weakenedSoFar = new Map<number, string>();

    // Same query parsing as rcSteps, so the two views read identically.
    const queryAntecedent = queryFormula?.replace(/[()]/g, '')?.split('|~')[0]?.split('=>')[0]?.trim() || '';

    const rawConsequent = queryFormula?.replace(/[()]/g, '').includes('|~')
        ? queryFormula?.replace(/[()]/g, '')?.split('|~')[1]
        : queryFormula?.replace(/[()]/g, '')?.split('=>')[1];

    const queryConsequent = rawConsequent?.replace('!', '').trim() || '';

    const base = { rInfinity, queryAntecedent, queryConsequent };

    // Step 1 - materialise and build the working set.
    steps.push({
        ...base,
        stepNumber: 1,
        totalSteps: 0,
        highlightedLines: [3, 4, 5],
        explanation: `We materialise the ranked knowledge base to perform classical entailment checks.\n\nThe finite ranks make up the working set R. R∞ holds the classical statements, which are never weakened or removed.`,
        workingSet: finiteRanks.flatMap(r => r.knowledgeBase).map(f => f.replace('|~', '=>')),
        rankingState: buildRankingState(baseRanking, removedSoFar, weakenedSoFar, -1),
        isFinalStep: false,
        isInitialStep: true,
    });

    lexicographicSteps.forEach((lexStep: LexicographicStepDTO) => {
        const groups = groupBySubsetSize(lexStep.subKBs);

        //line 6 rank must be weakened.
        steps.push({
            ...base,
            stepNumber: steps.length + 1,
            totalSteps: 0,
            highlightedLines: [6],
            explanation: `Does R∞ ∪ R still entail ¬${queryAntecedent}?\n\nYes, so ${queryAntecedent} is still refuted and Rank ${lexStep.rankNumber} has to be dealt with. Lexicographic Closure keeps as much of the rank as possible.`,
            workingSet: unionOf(lexStep.remainingRanks, lexStep.originalRank),
            rankingState: buildRankingState(baseRanking, removedSoFar, weakenedSoFar, lexStep.rankNumber),
            rankNumber: lexStep.rankNumber,
            rankSize: lexStep.rankSize,
            isFinalStep: false,
        });

        groups.forEach((group, index) => {
            const m = group[0].subsetSize;
            const dropped = lexStep.rankSize - m;
            const first = index === 0;
            const allRefuted = group.every(check => check.holds);

            const opening = first
                ? `Rank ${lexStep.rankNumber} is taken out of R, and we drop one statement: m = |R${lexStep.rankNumber}| − 1 = ${m}.`
                : `Every sub-knowledge base at m = ${m + 1} still refuted ${queryAntecedent}, so we drop one more statement: m = ${m}.`;

            const body = m === 0
                ? `\n\nAt m = 0 nothing is kept from Rank ${lexStep.rankNumber}, so the rank adds nothing back to R and the inner loop stops.`
                : `\n\nR${lexStep.rankNumber},${m} is the disjunction of every subset of Rank ${lexStep.rankNumber} of size ${m}, so we are dropping ${dropped} of its ${lexStep.rankSize} statements. Each subset below is tested on its own to see whether it still refutes ${queryAntecedent}.\n\n${allRefuted ? 'Every subset still refutes it, so we drop another statement.' : 'One of the subsets no longer refutes it, so the inner loop stops at this size.'}`;

            steps.push({
                ...base,
                stepNumber: steps.length + 1,
                totalSteps: 0,
                highlightedLines: first ? [7, 8, 9] : [10, 11, 12],
                explanation: opening + body,
                workingSet: lexStep.remainingRanks,
                rankingState: buildRankingState(baseRanking, removedSoFar, weakenedSoFar, lexStep.rankNumber),
                rankNumber: lexStep.rankNumber,
                rankSize: lexStep.rankSize,
                subsetSize: m,
                subKBs: group,
                subsetCount: group.length,
                //survivingSubKBs: m === lexStep.finalSubsetSize ? lexStep.survivingSubKBs : undefined,
                isFinalStep: false,
            });
        });

        // Line 14 - put the weakened rank back, or leave it out.
        if (lexStep.rankRemoved) {
            removedSoFar.add(lexStep.rankNumber);
        } else {
            weakenedSoFar.set(lexStep.rankNumber, lexStep.combinedFormula || '');
        }

        steps.push({
            ...base,
            stepNumber: steps.length + 1,
            totalSteps: 0,
            highlightedLines: [14, 15],
            explanation: lexStep.rankRemoved
                ? `No subset of Rank ${lexStep.rankNumber} stops refuting ${queryAntecedent}, so the whole rank is dropped and nothing goes back into R.\n\n Same behaviour as Rational Closure.`
                : `Rank ${lexStep.rankNumber} goes back into R as the single combined formula R${lexStep.rankNumber},${lexStep.finalSubsetSize}, which keeps ${lexStep.finalSubsetSize} of its ${lexStep.rankSize} statements.
                \n\nR∞ ∪ R no longer entails ¬${queryAntecedent}, so the outer loop stops here.`,
            workingSet: lexStep.remainingAfter,
            rankingState: buildRankingState(baseRanking, removedSoFar, weakenedSoFar, -1),
            rankNumber: lexStep.rankNumber,
            rankSize: lexStep.rankSize,
            subsetSize: lexStep.finalSubsetSize,
            combinedFormula: lexStep.combinedFormula,
            rankRemoved: lexStep.rankRemoved,
            stepDetails: lexStep.stepDetails,
            survivingSubKBs: lexStep.survivingSubKBs,
            isFinalStep: false,
        });
    });

    // Line 17 final query check
    const lastStep = lexicographicSteps.length > 0
        ? lexicographicSteps[lexicographicSteps.length - 1]
        : undefined;

    const finalWorkingSet = lastStep
        ? lastStep.remainingAfter
        : [...rInfinity, ...finiteRanks.flatMap(r => r.knowledgeBase)].map(f => f.replace('|~', '=>'));

    steps.push({
        ...base,
        stepNumber: steps.length + 1,
        totalSteps: 0,
        highlightedLines: [17],
        explanation: `${queryAntecedent} is no longer refuted, so the loop has stopped.\n\nThe classical entailment check: does R∞ ∪ R entail the materialised query? The query has to hold in every surviving sub-knowledge base.`,
        workingSet: finalWorkingSet,
        rankingState: buildRankingState(baseRanking, removedSoFar, weakenedSoFar, -1),
        finalChecks,
        survivingSubKBs: lastStep?.survivingSubKBs,
        isFinalStep: true,
        isResultStep: true,
        entailed,
        weakJustification: smallestWeakJustification ?? [],
    });

    const total = steps.length;
    steps.forEach(s => (s.totalSteps = total));

    return steps;
}

// The sub-KBs arrive largest subset first.
function groupBySubsetSize(subKBs: SubKnowledgeBaseCheckDTO[]): SubKnowledgeBaseCheckDTO[][] {
    const groups: SubKnowledgeBaseCheckDTO[][] = [];
    let current = -1;

    (subKBs || []).forEach(check => {
        if (check.subsetSize !== current) {
            current = check.subsetSize;
            groups.push([]);
        }
        groups[groups.length - 1].push(check);
    });

    return groups;
}

function unionOf(a: string[], b: string[]): string[] {
    return Array.from(new Set([...(a || []), ...(b || [])]));
}

function buildRankingState(baseRanking: RankDTO[], removedSoFar: Set<number>, weakenedSoFar: Map<number, string>, beingWeakenedNow: number): LexRankState[] {
    return baseRanking.map(rank => ({
        rankName: rank.rankName,
        rankNumber: rank.rankNumber,
        formulas: rank.knowledgeBase,
        isRemoved: removedSoFar.has(rank.rankNumber),
        isBeingWeakened: rank.rankNumber === beingWeakenedNow,
        weakenedTo: weakenedSoFar.get(rank.rankNumber),
    }));
}
