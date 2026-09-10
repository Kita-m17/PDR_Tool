import React from 'react';

export type PartitionFilter = 'all' | 'entailed' | 'minimal';

const FILTER_OPTIONS: { id: PartitionFilter; label: string }[] = [
    { id: 'all', label: 'All Sets' },
    { id: 'entailed', label: 'Entailed Sets' },
    { id: 'minimal', label: 'Minimal Entailed Sets' },
];

interface PowersetViewProps {
    currentSet: string[];
    entailed: boolean;
    minimal: boolean;
    stepNumber: number;
    totalSteps: number;
    filter: PartitionFilter;
    onFilterChange: (next: PartitionFilter) => void;
}

const PowersetView: React.FC<PowersetViewProps> = ({
    currentSet,
    entailed,
    minimal,
    stepNumber,
    totalSteps,
    filter,
    onFilterChange,
}) => {
    const hasMatch = totalSteps > 0;

    return (
        <div>
            <div className="flex items-center justify-between mb-1">
                <h3 className="text-primary font-semibold flex items-center gap-2">
                    Powerset
                </h3>

                {hasMatch && (
                    <span className="inline-block rounded-md border border-sky-300 bg-sky-50 px-2 py-0.5 text-xs font-semibold text-sky-900">
                        subset {stepNumber} / {totalSteps}
                    </span>
                )}
            </div>

            <p className="text-xs text-muted-foreground mb-4">
                Subsets of the defeasible knowledge base are checked one at a time for entailment and minimality.
            </p>

            {/* Subset filter */}
            <div className="flex gap-4 flex-wrap mb-4 pb-4 border-b border-border">
                {FILTER_OPTIONS.map((option) => (
                    <label key={option.id} className="flex items-center gap-2 cursor-pointer">
                        <input
                            type="radio"
                            name="partitionFilter"
                            value={option.id}
                            checked={filter === option.id}
                            onChange={() => onFilterChange(option.id)}
                            className="accent-primary w-4 h-4"
                        />
                        <span className="text-sm text-foreground">{option.label}</span>
                    </label>
                ))}
            </div>

            {hasMatch ? (
                <>
                    <div className={`rounded-lg border p-4 mb-3 ${
                        entailed && minimal
                            ? 'border-gray-200 bg-gray-100'
                            : entailed
                            ? 'border-gray-200 bg-gray-100'
                            : 'border-gray-200 bg-gray-100'
                    }`}>
                        <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                            Current subset
                        </p>
                        <p className="font-mono text-sm text-foreground">
                            {currentSet.length > 0 ? ` ${currentSet.join(', ')} ` : '\u2205'}
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        <span className={`inline-block rounded-md border px-2 py-0.5 text-xs font-semibold ${
                            entailed
                                ? 'border-amber-300 bg-amber-50 text-amber-700'
                                : 'border-gray-300 bg-gray-50 text-muted-foreground'
                        }`}>
                            {entailed ? 'entailed' : 'not entailed'}
                        </span>

                        {minimal && (
                            <span className="inline-block rounded-md border border-emerald-300 bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-sky-900">
                                minimal
                            </span>
                        )}
                    </div>
                </>
            ) : (
                <p className="text-sm text-muted-foreground italic">
                    No subsets match this filter.
                </p>
            )}
        </div>
    );
};

export default PowersetView;
