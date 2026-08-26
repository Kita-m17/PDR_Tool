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
}

export interface PartitionStepDTO {
    ID: number;
    set: string[];
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


// POST /api/knowledge-base/create-knowledge-base
export const submitKnowledgeBase = async (formulas: string[]): Promise<BaseRankDTO> => {
    const response = await fetch(`${BASE_URL}/knowledge-base/create-knowledge-base`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ formulas }),
    });
    
    if (!response.ok) 
        throw new Error('Failed to submit knowledge base');
    return response.json();
};

// POST /api/entailment/{algorithm}
export const submitQuery = async (algorithm: string, query: string): Promise<EntailmentDTO> => {
    const response = await fetch(`${BASE_URL}/entailment/${algorithm}`, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain' },
        body: query,
    });

    if (!response.ok)
        throw new Error('Failed to submit query');
    return response.json();
};

// POST /api/partition/relevant/basic/create
export const submitPartitionQuery = async (query: string): Promise<PartitionDTO> => {
    const response = await fetch(`${BASE_URL}/partition/relevant/basic/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain' },
        body: query,
    });

    if (!response.ok)
        throw new Error('Failed to submit partition query');
    return response.json();
};