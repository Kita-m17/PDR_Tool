// In production (the CRA build bundled into the Spring Boot jar's static
// resources - see the Dockerfile) the frontend is served from the same
// origin as the backend, so a relative path is correct and works no matter
// what host/port fly.io puts the app on. In development (`npm start`) the
// frontend runs on :3000 and the backend on :8080, so it needs the full URL.
const BASE_URL = process.env.NODE_ENV === 'production' ? '/api' : 'http://localhost:8080/api';

export interface RankDTO {
    rankNumber: number;
    rankName: string;
    knowledgeBase: string[];
}

export interface ExceptionalityCheckDTO {
    antecedant: string;
    reason: string;
    rankNumber: number;
    affectedRules: string[];
    exceptionality: boolean;
}

export interface BaseRankStepDTO {
    iteration: number;
    consideredFormulas: string[];
    assignedRanks: string[];
    carriedForward: string[];
    checks: ExceptionalityCheckDTO[];
}

export interface BaseRankDTO {
    knowledgeBase: string[];
    sequence: RankDTO[];
    ranking: RankDTO[];
    traceSteps: BaseRankStepDTO[];
    executionTime: number;
}

export interface EntailmentStepDTO {
    iteration: number;
    antecedentExceptional: boolean;
    reason: string;
    remaining: string[];
    removed: string[];
}

export interface EntailmentDTO {
    entailed: boolean;
    queryFormula: string;
    knowledgeBase: string[];
    baseRanking: RankDTO[];
    removedRanking: RankDTO[];
    traceSteps: EntailmentStepDTO[];
    // Populated for Basic/Minimal Relevant Closure and for Lexicographic Closure -
    // the smallest weak justification (proof) for the entailment, per
    // RelevantEntailment.java and LexicographicEntailment.java.
    // Empty/undefined when not entailed, since there's nothing to justify.
    smallestWeakJustification?: string[];
    baseRankExecutionTime: number;
    closureExecutionTime: number;
    // Only populated for Basic/Minimal Relevant Closure.
    partitionExecutionTime?: number;
    // Sum of the phases above (baseRank + closure [+ partition]) - see
    // Entailment.getTotalExecutionTime() / RelevantEntailment.getTotalExecutionTime().
    totalExecutionTime: number;
}

export interface PartitionStepDTO {
    ID: number;
    set: string[];
    // Only populated when this step's subset is entailed and minimal AND the
    // partition was built for Minimal Relevant Closure - the single
    // lowest-ranked statement from `set`, which is what actually gets added
    // to justificationsSoFar for that closure (see PartitionUsingPowersetImpl).
    minimalSet: string[];
    entailed: boolean;
    minimal: boolean;
    reason: string;
    justificationsSoFar: string[][];
}

export interface PartitionDTO {
    relevantPartition: string[];
    irrelevantPartition: string[];
    classicalStatements: string[];
    knowledgeBase: string[];
    traceSteps: PartitionStepDTO[];
    executionTime: number;
}

export interface SubKnowledgeBaseCheckDTO {
    rankNumber: number;      
    rankSize: number;
    subsetSize: number;
    subset: string[];
    subsetString: string;
    subKnowledgeBase: string[];
    testedFormula: string;
    holds: boolean;
}
 
export interface LexicographicStepDTO {
    iteration: number;
    rankNumber: number;
    originalRank: string[];
    rankSize: number;
    remainingRanks: string[];
    subKBs: SubKnowledgeBaseCheckDTO[];
    survivingSubKBs: SubKnowledgeBaseCheckDTO[];
    finalSubsetSize: number;
    combinedFormula: string | null;
    rankRemoved: boolean;
    remainingAfter: string[];
    stepDetails: string;
}
 
export interface LexicographicEntailmentDTO extends EntailmentDTO {
    weakenedRanking: RankDTO[];
    lexicographicSteps: LexicographicStepDTO[];
    finalChecks: SubKnowledgeBaseCheckDTO[];
}


export interface AlgorithmEvaluationDTO {
    algorithm: string;
    entailment: EntailmentDTO;
    partition: PartitionDTO | null;
}

// Request body for POST /api/entailment/evaluate. Field names mirror the
// backend's EvaluateAllRequestDTO -> InputDTO -> KnowledgeBaseDTO / QueryDTO.
export interface EvaluateRequestDTO {
    input: {
        knowledgeBaseDTO: { formulas: string[] };
        queryDTO: { formula: string };
    };
    algorithms: string[];
}

export interface EvaluateAllResponseDTO {
    baseRank: BaseRankDTO;
    results: AlgorithmEvaluationDTO[];
}

// Fixed display order for results, regardless of the order the caller (or the
// user) selected algorithms in, so the result button row is always laid out
// the same way. The backend returns results in request order, so we send the
// algorithms in this order and sort the response by it as well.
export const ALGORITHM_ORDER = ['rational', 'lexicographic', 'basic relevant', 'minimal relevant'];

const byCanonicalOrder = (a: string, b: string) => {
    const ia = ALGORITHM_ORDER.indexOf(a);
    const ib = ALGORITHM_ORDER.indexOf(b);
    return (ia === -1 ? ALGORITHM_ORDER.length : ia) - (ib === -1 ? ALGORITHM_ORDER.length : ib);
};

// POST /api/entailment/evaluate
// The single endpoint the frontend uses. It is stateless: the knowledge base,
// query and algorithms travel in the request, and the response carries the
// base rank plus, per algorithm, the entailment result and (for the relevant
// closures) the partition.
export const evaluate = async (
    formulas: string[],
    query: string,
    algorithms: string[]
): Promise<EvaluateAllResponseDTO> => {
    const body: EvaluateRequestDTO = {
        input: {
            knowledgeBaseDTO: { formulas },
            queryDTO: { formula: query },
        },
        algorithms: [...algorithms].sort(byCanonicalOrder),
    };

    const response = await fetch(`${BASE_URL}/entailment/evaluate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
    });

    if (!response.ok)
        throw new Error('Failed to evaluate selected algorithms');

    const data: EvaluateAllResponseDTO = await response.json();
    data.results = [...data.results].sort((a, b) => byCanonicalOrder(a.algorithm, b.algorithm));
    return data;
};
