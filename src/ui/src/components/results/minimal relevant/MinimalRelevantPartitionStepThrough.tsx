import React, { useState, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { BaseRankDTO, EntailmentDTO, PartitionDTO } from '../../../api/api';
import Header from '../../layout/Header';
import Footer from '../../layout/Footer';
import { buildMinimalPartitionSteps, MinimalPartitionDebuggerStep } from './MinimalRelevantPartitionSteps';
import PowersetView, { PartitionFilter } from '../basic relevant/PowersetView';
import JustificationVisualiser from '../basic relevant/JustificationVisualiser';
import StepControls from '../basic relevant/BasicRelevantStepControls';
import { ArrowLeftIcon, ArrowRightIcon } from '@radix-ui/react-icons';
import { Button } from '../../ui/Buttons';

interface ResultsState {
    baseRank: BaseRankDTO;
    entailment: EntailmentDTO;
    partition: PartitionDTO;
    query: string;
    algorithm: string;
}

// Mirrors BasicRelevantPartitionStepThrough.tsx's structure exactly - same
// Powerset + Explanation + Justifications layout - but for Minimal Relevant
// Closure. The powerset view is fed the same full subset the backend
// checked, unchanged, same as Basic Relevant Closure. Only the explanation
// (via MinimalRelevantPartitionSteps.ts) and the justification entries
// (already reduced to `minimalSet` server-side for this algorithm) reflect
// the extra lowest-rank reduction step.
const MinimalRelevantPartitionStepThrough: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
    // location.state is only populated when this page is reached via
    // navigate(path, { state }) - a refresh, pasted URL, or bookmark lands
    // here with state === null. Guarded below instead of crashing - but ALL
    // hooks still have to run on every render regardless of resultsState, so
    // the guard's early return comes after them, not before.
    const resultsState = location.state as ResultsState | null;

    const [filter, setFilter] = useState<PartitionFilter>('all');
    const [currentStep, setCurrentStep] = useState(0);

    // Plain derived value, not a hook - fine to compute conditionally.
    const steps = resultsState ? buildMinimalPartitionSteps(resultsState.partition) : [];

    // Filtering only changes which subsets you page through - the underlying
    // data (justificationsSoFar per step, and the completed relevantPartition/
    // irrelevantPartition on `partition` itself) is unaffected.
    const filteredSteps = useMemo(() => {
        switch (filter) {
            case 'entailed': return steps.filter(s => s.entailed);
            case 'minimal': return steps.filter(s => s.entailed && s.minimal);
            default: return steps;
        }
    }, [steps, filter]);

    const step: MinimalPartitionDebuggerStep | undefined = filteredSteps[currentStep];
    const isLastInView = filteredSteps.length > 0 && currentStep === filteredSteps.length - 1;

    const handleFilterChange = (next: PartitionFilter) => {
        setFilter(next);
        setCurrentStep(0);
    };

    if (!resultsState) {
        return (
            <div className="min-h-screen bg-accent flex flex-col">
                <Header />
                <main className="flex-1 px-8 py-6 flex items-center justify-center">
                    <div className="bg-white border border-border rounded-xl p-8 text-center max-w-md">
                        <h2 className="text-lg font-semibold text-foreground mb-2">
                            No query data found
                        </h2>
                        <p className="text-sm text-muted-foreground mb-6">
                            This page needs data from a submitted query. It looks like it was reached
                            directly - for example a page refresh, a pasted link, or a bookmark - which
                            doesn't carry that data along. Start a new query instead.
                        </p>
                        <Button variant="primary" onClick={() => navigate('/')}>
                            Back to start
                        </Button>
                    </div>
                </main>
                <Footer />
            </div>
        );
    }

    const { baseRank, entailment, partition, query, algorithm } = resultsState;

    return (
        <div className="min-h-screen bg-accent flex flex-col">
            <Header />

            <main className="flex-1 px-8 py-6">

                {/* Page header */}
                <div className="flex items-start justify-between mb-4">
                    <div>
                        <h1 className="text-2xl font-bold text-foreground">
                            Minimal Relevant Partition
                        </h1>
                        <p className="text-muted-foreground text-sm mt-1">
                            Step-by-step justification search
                        </p>

                        <p className="text-sm text-foreground mt-2 max-w-2xl">
                            Every subset of the knowledge base is checked for classical entailment of the query,
                            same as Basic Relevant Closure. But once a subset is found to be a minimal
                            justification, Minimal Relevant Closure keeps only its lowest-ranked statement -
                            the minimalSet - rather than the whole subset. The relevant partition is built from
                            these minimalSets, not the full justifications.
                        </p>
                    </div>

                    <Button className="text-sm text-muted-foreground border border-border rounded-lg px-4 py-2 hover:bg-white transition"
                        onClick={() => navigate('/baserank', {
                            state: { baseRank, entailment, partition, query, algorithm }
                        })}
                    >
                        <span className="flex items-center gap-1">
                            <ArrowLeftIcon className="h-3 w-3" />
                            Back to BaseRank
                        </span>
                    </Button>
                </div>

                {/* Query banner */}
                <div className="bg-white border border-border rounded-xl p-4 mb-4 flex items-center gap-3">
                    <span className="text-primary font-bold text-sm">Query</span>
                    <span className="font-mono text-foreground">{query}</span>
                </div>

                {/* Justification visualiser, full width - only meaningful once a step exists.
                    justificationsSoFar already holds minimalSet entries (not full subsets)
                    for this algorithm, straight from the backend. */}
                {step && (
                    <div className="bg-white border border-border rounded-xl p-6 mb-4">
                        <JustificationVisualiser
                            justificationsSoFar={step.justificationsSoFar}
                            isFinalStep={isLastInView}
                            relevantPartition={partition.relevantPartition}
                            irrelevantPartition={partition.irrelevantPartition}
                        />
                    </div>
                )}

                {/* Powerset (left, owns the subset filter so it's always reachable)
                    + Explanation (right) side by side. PowersetView is fed the full
                    subset (step.currentSet) unchanged - it always shows the set being
                    checked as normal, the same way it does for Basic Relevant Closure.
                    The lowest-rank reduction to minimalSet is explained in the
                    Explanation panel, not in the powerset display itself. */}
                <div className="flex gap-4 mb-4">
                    <div className="bg-white border border-border rounded-xl p-6 flex-1">
                        <PowersetView
                            currentSet={step?.currentSet ?? []}
                            entailed={step?.entailed ?? false}
                            minimal={step?.minimal ?? false}
                            stepNumber={step ? currentStep + 1 : 0}
                            totalSteps={filteredSteps.length}
                            filter={filter}
                            onFilterChange={handleFilterChange}
                        />
                    </div>

                    <div className="bg-white border border-border rounded-xl p-6 flex-1">
                        <h3 className="text-primary font-semibold mb-4 flex items-center gap-2">
                            Explanation
                        </h3>

                        {step ? (
                            <>
                                <p className="text-sm text-foreground leading-relaxed whitespace-pre-line mb-4">
                                    {step.explanation}
                                </p>

                                {/* Only meaningful once a subset has actually been reduced
                                    to a minimalSet - not shown for non-minimal or
                                    non-entailed subsets. */}
                                {step.minimal && step.minimalSet.length > 0 && (
                                    <div className="rounded-lg border border-sky-200 bg-sky-50 p-3 mb-4">
                                        <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-sky-900">
                                            Minimal Justification
                                        </p>
                                        <p className="font-mono text-sm text-sky-900">
                                            {`{ ${step.minimalSet.join(', ')} }`}
                                        </p>
                                    </div>
                                )}

                                {isLastInView && (
                                    <div className="mt-4 rounded-lg p-4 border bg-green-50 border-green-200">
                                        <p className="font-bold text-green-700 mb-1">
                                            ✓ Partition Complete
                                        </p>
                                    </div>
                                )}
                            </>
                        ) : (
                            <p className="text-sm text-muted-foreground italic">
                                {steps.length === 0
                                    ? 'No partition trace data was returned for this query.'
                                    : 'No subsets match this filter - try a different option on the left.'}
                            </p>
                        )}
                    </div>
                </div>

                {/* Step controls + continue, only once a step exists */}
                {step && (
                    <>
                        <div className="bg-white border border-border rounded-xl p-4">
                            <StepControls
                                current={currentStep}
                                total={filteredSteps.length}
                                onStart={() => setCurrentStep(0)}
                                onBack={() => setCurrentStep(prev => Math.max(0, prev - 1))}
                                onNext={() => setCurrentStep(prev => Math.min(filteredSteps.length - 1, prev + 1))}
                                onEnd={() => setCurrentStep(filteredSteps.length - 1)}
                            />
                        </div>

                        {isLastInView && (
                            <div className="flex justify-end mt-4">
                                <Button variant="primary" size="lg"
                                    onClick={() => navigate('/results/relevant/basic', {
                                        state: { baseRank, entailment, partition, query, algorithm }
                                    })}
                                >
                                    Continue to Relevant Closure
                                    <ArrowRightIcon className="ml-2 h-4 w-4" />
                                </Button>
                            </div>
                        )}
                    </>
                )}

            </main>

            <Footer />
        </div>
    );
};

export default MinimalRelevantPartitionStepThrough;
