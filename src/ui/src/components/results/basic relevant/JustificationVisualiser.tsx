import React from 'react';

interface JustificationVisualiserProps {
    justificationsSoFar: string[][];
    isFinalStep: boolean;
    relevantPartition?: string[];
    irrelevantPartition?: string[];
}

const JustificationVisualiser: React.FC<JustificationVisualiserProps> = ({
    justificationsSoFar,
    isFinalStep,
    relevantPartition,
    irrelevantPartition,
}) => {
    return (
        <div>
            <div className="flex items-center justify-between mb-3">
                <h3 className="text-primary font-semibold flex items-center gap-2">
                    Justifications
                </h3>

                <span className="inline-block rounded-md border border-sky-300 bg-sky-50 px-2 py-0.5 text-xs font-semibold text-sky-900">
                    {justificationsSoFar.length} found
                </span>
            </div>

            <p className="text-xs text-muted-foreground mb-3">
                Minimal subsets of the knowledge base that entail the query, accumulated as the powerset is searched.
            </p>

            <div className="space-y-2 mb-2">
                {justificationsSoFar.length === 0 ? (
                    <p className="text-sm text-muted-foreground italic">No justifications found yet.</p>
                ) : (
                    justificationsSoFar.map((set, i) => (
                        <div key={i} className="rounded-lg border border-sky-200 bg-sky-50 px-3 py-2 font-mono text-sm text-sky-900">
                            J{i + 1} = {`{ ${set.join(', ')} }`}
                        </div>
                    ))
                )}
            </div>

            {isFinalStep && (
                <div className="border-t border-border pt-4 mt-4 space-y-3">
                    <p className="text-sm font-medium text-foreground">Final partition</p>

                    <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">
                            Relevant
                        </p>
                        <div className="rounded-lg border border-border bg-accent p-3 font-mono text-sm text-foreground">
                            {relevantPartition && relevantPartition.length > 0 ? `{ ${relevantPartition.join(', ')} }` : '∅'}
                        </div>
                    </div>

                    <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">
                            Irrelevant
                        </p>
                        <div className="rounded-lg border border-border bg-accent p-3 font-mono text-sm text-foreground">
                            {irrelevantPartition && irrelevantPartition.length > 0 ? `{ ${irrelevantPartition.join(', ')} }` : '∅'}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default JustificationVisualiser;
