import { LexicographicEntailmentDTO, LexicographicStepDTO, RankDTO, SubKnowledgeBaseCheckDTO } from '../../../api/api';

export interface LexRankState {
    rankName: string;
    rankNumber: number;
    formulas: string[];
    isRemoved: boolean;         // dropped entirely - no subset survived
    isBeingWeakened: boolean;   // currently under consideration
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

    // populated while a rank is being weakened
    rankNumber?: number;
    rankSize?: number;
    subsetSize?: number;
    subKBs?: SubKnowledgeBaseCheckDTO[];
    combinedFormula?: string | null;
    rankRemoved?: boolean;

    // populated on the final step
    finalChecks?: SubKnowledgeBaseCheckDTO[];
    isFinalStep: boolean;
    entailed?: boolean;

    isInitialStep?: boolean;
    queryAntecedent?: string;
    queryConsequent?: string;
}

const R_INFINITY = 2147483647;

export function buildLexicographicSteps(entailment: LexicographicEntailmentDTO): LexDebuggerStep[] {
    const steps: LexDebuggerStep[] = [];
    const { lexicographicSteps = [], baseRanking, finalChecks = [], entailed, queryFormula } = entailment;

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
        highlightedLines: [1, 2],
        explanation: `Before beginning the entailment check, we materialise the ranked knowledge base.\n\nEach defeasible statement α |~ β is converted to a classical implication α → β, so classical entailment checking can be used throughout.\n\nThe finite ranks form the working set R, while R∞ contains the classical statements that always remain.`,
        workingSet: finiteRanks.flatMap(r => r.knowledgeBase).map(f => f.replace('|~', '=>')),
        rankingState: buildRankingState(baseRanking, removedSoFar, weakenedSoFar, -1),
        isFinalStep: false,
        isInitialStep: true,
    });

    lexicographicSteps.forEach((lexStep: LexicographicStepDTO) => {
        const groups = groupBySubsetSize(lexStep.subKBs);

        // Line 3 - the antecedent is still refuted, so this rank must be weakened.
        steps.push({
            ...base,
            stepNumber: steps.length + 1,
            totalSteps: 0,
            highlightedLines: [3],
            explanation: `Checking: does R∞ ∪ R still entail ¬${queryAntecedent}?\n\nResult: YES, the antecedent is still refuted. Rational Closure would discard Rank ${lexStep.rankNumber} entirely. Lexicographic Closure instead keeps as much of it as it can.`,
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
                ? `Rank ${lexStep.rankNumber} is taken out of R, and we start by dropping one statement: m = |R${lexStep.rankNumber}| − 1 = ${m}.`
                : `Every sub-knowledge base at m = ${m + 1} still refuted the antecedent, so we drop one more statement: m = ${m}.`;

            const body = m === 0
                ? `\n\nAt m = 0 nothing is kept from Rank ${lexStep.rankNumber}, so the rank contributes nothing and the inner loop stops.`
                : `\n\nR${lexStep.rankNumber},${m} is the disjunction of every subset of Rank ${lexStep.rankNumber} of size ${m} (dropping ${dropped} of ${lexStep.rankSize}). Each subset below is tested to see whether it still refutes ${queryAntecedent}.\n\nResult: ${allRefuted ? 'every subset still refutes the antecedent, so we continue.' : 'at least one subset does not refute the antecedent, so the inner loop stops here.'}`;

            steps.push({
                ...base,
                stepNumber: steps.length + 1,
                totalSteps: 0,
                highlightedLines: first ? [4, 5, 6] : [7, 8, 9],
                explanation: opening + body,
                workingSet: lexStep.remainingRanks,
                rankingState: buildRankingState(baseRanking, removedSoFar, weakenedSoFar, lexStep.rankNumber),
                rankNumber: lexStep.rankNumber,
                rankSize: lexStep.rankSize,
                subsetSize: m,
                subKBs: group,
                isFinalStep: false,
            });
        });

        // Line 10 - put the weakened rank back, or leave it out.
        if (lexStep.rankRemoved) {
            removedSoFar.add(lexStep.rankNumber);
        } else {
            weakenedSoFar.set(lexStep.rankNumber, lexStep.combinedFormula || '');
        }

        steps.push({
            ...base,
            stepNumber: steps.length + 1,
            totalSteps: 0,
            highlightedLines: [10, 11],
            explanation: lexStep.rankRemoved
                ? `No subset of Rank ${lexStep.rankNumber} survives, so the whole rank is dropped and nothing is added back to R.\n\nThis is the point where Lexicographic Closure and Rational Closure agree.`
                : `Rank ${lexStep.rankNumber} is added back to R as the single combined formula R${lexStep.rankNumber},${lexStep.finalSubsetSize}, keeping ${lexStep.finalSubsetSize} of its ${lexStep.rankSize} statements.\n\nThe antecedent is no longer refuted by this rank, so the outer loop moves on.`,
            workingSet: lexStep.remainingAfter,
            rankingState: buildRankingState(baseRanking, removedSoFar, weakenedSoFar, -1),
            rankNumber: lexStep.rankNumber,
            rankSize: lexStep.rankSize,
            subsetSize: lexStep.finalSubsetSize,
            combinedFormula: lexStep.combinedFormula,
            rankRemoved: lexStep.rankRemoved,
            isFinalStep: false,
        });
    });

    // Line 12 - the loop has stopped, ask the query.
    const finalWorkingSet = lexicographicSteps.length > 0
        ? lexicographicSteps[lexicographicSteps.length - 1].remainingAfter
        : [...rInfinity, ...finiteRanks.flatMap(r => r.knowledgeBase)].map(f => f.replace('|~', '=>'));

    steps.push({
        ...base,
        stepNumber: steps.length + 1,
        totalSteps: 0,
        highlightedLines: [12],
        explanation: `${queryAntecedent} is no longer refuted, so the loop stops.\n\nWe now perform the final classical entailment check: does R∞ ∪ R entail the materialised query?\n\nThe query must hold in every surviving sub-knowledge base for it to be entailed.`,
        workingSet: finalWorkingSet,
        rankingState: buildRankingState(baseRanking, removedSoFar, weakenedSoFar, -1),
        finalChecks,
        isFinalStep: true,
        entailed,
    });

    const total = steps.length;
    steps.forEach(s => (s.totalSteps = total));

    return steps;
}

// The sub-KBs arrive largest subset first, so grouping in order gives one group per m.
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
