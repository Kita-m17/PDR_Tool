import React from 'react';

interface PowersetViewProps {
    currentSet: string[];
    entailed: boolean;
    minimal: boolean;
    stepNumber: number;
    totalSteps: number;
}

const PowersetView: React.FC<PowersetViewProps> = ({ currentSet, entailed, minimal, stepNumber, totalSteps }) => {
    return (
        <div>
            <div className="flex items-center justify-between mb-1">
                <h3 className="text-primary font-semibold flex items-center gap-2">
                    Powerset
                </h3>

                <span className="inline-block rounded-md border border-sky-300 bg-sky-50 px-2 py-0.5 text-xs font-semibold text-sky-900">
                    subset {stepNumber} / {totalSteps}
                </span>
            </div>

            <p className="text-xs text-muted-foreground mb-4">
                Subsets of the defeasible knowledge base are checked one at a time for entailment and minimality.
            </p>

            <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 mb-3">
                <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Current subset
                </p>
                <p className="font-mono text-sm text-foreground">
                    {currentSet.length > 0 ? `{ ${currentSet.join(', ')} }` : '∅'}
                </p>
            </div>

            <div className="flex items-center gap-2">
                <span className={`inline-block rounded-md border px-2 py-0.5 text-xs font-semibold ${
                    entailed
                        ? 'border-green-300 bg-green-50 text-green-700'
                        : 'border-gray-300 bg-gray-50 text-muted-foreground'
                }`}>
                    {entailed ? 'entailed' : 'not entailed'}
                </span>

                {minimal && (
                    <span className="inline-block rounded-md border border-sky-300 bg-sky-50 px-2 py-0.5 text-xs font-semibold text-sky-900">
                        minimal
                    </span>
                )}
            </div>
        </div>
    );
};

export default PowersetView;
