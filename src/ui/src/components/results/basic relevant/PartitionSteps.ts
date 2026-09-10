import { PartitionDTO } from '../../../api/api';

// One entry per powerset subset that PartitionUsingPowersetImpl checked, in
// the order the backend checked them. Each step already carries a snapshot
// of justificationsSoFar as it stood right after that subset was checked,
// so we don't need to reconstruct the running justification list on the
// frontend - we just read it straight off the step.
export interface PartitionDebuggerStep {
    stepNumber: number;
    totalSteps: number;
    currentSet: string[];
    entailed: boolean;
    minimal: boolean;
    reason: string;
    justificationsSoFar: string[][];
    explanation: string;
    isFinalStep: boolean;
    // Only populated on the final step - the completed partition, taken
    // from the top-level PartitionDTO rather than any single trace step.
    relevantPartition?: string[];
    irrelevantPartition?: string[];
    classicalStatements?: string[];
}

export function buildPartitionSteps(partition: PartitionDTO): PartitionDebuggerStep[] {
    const traceSteps = partition.traceSteps || [];
    const total = traceSteps.length;

    return traceSteps.map((step, index) => {
        const isFinalStep = index === total - 1;
        const setLabel = step.set.length > 0 ? `{ ${step.set.join(', ')} }` : '∅';

        let explanation: string;
        if (step.minimal) {
            explanation = `This subset classically entails the negation of the query's antecedent and IS minimal making it a justification, meaning no proper subset of it also entails the query's antecedent. It is added to the set of justifications.`;
        } else if (step.entailed) {
            explanation = `This subset classically entails the negation of the query's antecedent, but it is NOT minimal therefore it is not a justification, meaning a proper subset of it already entails the negation of the query's antecedent, so it is not added ot the set of justification.`;
        } else {
            explanation = `This subset does NOT classically entail the negation of the query's antecedent.`;
        }

        if (isFinalStep) {
            explanation += `\n\nAll subsets of the knowledge base have now been checked. The relevant partition is made up of every statement that appears in at least one justification; everything else is irrelevant to the query.`;
        }

        const debugStep: PartitionDebuggerStep = {
            stepNumber: index + 1,
            totalSteps: total,
            currentSet: step.set,
            entailed: step.entailed,
            minimal: step.minimal,
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
