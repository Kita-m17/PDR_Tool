import { PartitionDTO } from '../../../api/api';


export interface MinimalPartitionDebuggerStep {
    stepNumber: number;
    totalSteps: number;
    currentSet: string[];
    entailed: boolean;
    minimal: boolean;
    minimalSet: string[];
    reason: string;
    justificationsSoFar: string[][];
    explanation: string;
    isFinalStep: boolean;
    relevantPartition?: string[];
    irrelevantPartition?: string[];
    classicalStatements?: string[];
}

export function buildMinimalPartitionSteps(partition: PartitionDTO): MinimalPartitionDebuggerStep[] {
    const traceSteps = partition.traceSteps || [];
    const total = traceSteps.length;

    return traceSteps.map((step, index) => {
        const isFinalStep = index === total - 1;
        const setLabel = step.set.length > 0 ? `{ ${step.set.join(', ')} }` : '∅';
        const minimalSet = step.minimalSet || [];
        const minimalSetLabel = minimalSet.length > 0 ? `{ ${minimalSet.join(', ')} }` : '∅';

        let explanation: string;
        if (step.minimal) {
            explanation =

                `This subset DOES classically entail the negation of the query's antecedent and IS minimal, making it a justification. No proper subset of it also entails the negation of the query's antecedent. ` +
                `Minimal Justifications don't keep every statement in a justification, only the one that matters most for the entailment. We look at the rank of each statement and take only the statement with the LOWEST rank.`


        } else if (step.entailed) {
            explanation =

                `This subset DOES classically entail the negation of the query's antecedent, but it is NOT minimal, therefore it is not a justification. A proper subset of it already entails the negation of the query's antecedent, so it is not added to the set of justifications.`;
        } else {
            explanation = `This subset does NOT classically entail the negation of the query's antecedent.`;
        }


        const debugStep: MinimalPartitionDebuggerStep = {
            stepNumber: index + 1,
            totalSteps: total,
            currentSet: step.set,
            entailed: step.entailed,
            minimal: step.minimal,
            minimalSet,
            reason: step.reason,
            justificationsSoFar: step.justificationsSoFar || [],
            explanation,
            isFinalStep,
        };

        if (isFinalStep) {
            debugStep.relevantPartition = partition.relevantPartition;
            debugStep.irrelevantPartition = partition.irrelevantPartition;
            debugStep.classicalStatements = partition.classicalStatements;
        }

        return debugStep;
    });
}
