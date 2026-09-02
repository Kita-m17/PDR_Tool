import { PartitionDTO } from '../../../api/api';

// One entry per powerset subset that PartitionUsingPowersetImpl checked, in
// the order the backend checked them - same trace shape as Basic Relevant
// Closure's PartitionSteps.ts, but for Minimal Relevant Closure.
//
// The difference only matters once a subset is entailed AND minimal: the
// backend (see PartitionUsingPowersetImpl.getPartition, isMinimalRelevantClosure
// branch) doesn't add the whole subset to the justification list. Instead it
// walks the base ranking and keeps only the single statement from that
// subset with the lowest rank - `minimalSet` - and it's that minimalSet,
// not the full subset, which is what actually gets pushed into
// justificationsSoFar for Minimal Relevant Closure.
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
    // Only populated on the final step - the completed partition, taken
    // from the top-level PartitionDTO rather than any single trace step.
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

                `This DOES subset classically entails the negation of the query's antecedent and is IS minimal making it a justification. No proper subset of it also entails the query. ` +
                `Minimal Justification doesn't keep every statement in this justification, only the one that matters most for the entailment. We look at the rank of each statement  and take only the statement with the LOWEST rank.`


        } else if (step.entailed) {
            explanation =

                `This subset DOES classically entails the negation of the query's antecedent, but it is NOT minimal therefore it is not a justification. A proper subset of it already entails the query, so it is not added ot the set of justification`;
        } else {
            explanation = `This subset does NOT classically entail the negation of the query's antecedent.`;
        }

        /** if (isFinalStep) {
            explanation +=
                `\n\nAll subsets of the knowledge base have now been checked. The relevant partition is made up of every statement that was picked as a minimalSet along the way - the lowest-ranked statement out of each justification; everything else, including the higher-ranked statements from those same justifications, is irrelevant to the query.`;
        }*/

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
