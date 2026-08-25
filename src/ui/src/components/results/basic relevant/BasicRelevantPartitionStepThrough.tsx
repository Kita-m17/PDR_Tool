import React, { useState, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { BaseRankDTO, EntailmentDTO, PartitionDTO } from '../../../api/api';
import Header from '../../layout/Header';
import Footer from '../../layout/Footer';
import { buildPartitionSteps, PartitionDebuggerStep } from './PartitionSteps';
import PowersetView, { PartitionFilter } from './PowersetView';
import JustificationVisualiser from './JustificationVisualiser';
import StepControls from './BasicRelevantStepControls';
import { ArrowLeftIcon, ArrowRightIcon } from '@radix-ui/react-icons';
import { Button } from '../../ui/Buttons';

interface ResultsState {
    baseRank: BaseRankDTO;
    entailment: EntailmentDTO;
    partition: PartitionDTO;
    query: string;
    algorithm: string;
}

const BasicRelevantPartitionStepThrough: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { baseRank, entailment, partition, query, algorithm } = location.state as ResultsState;

    const steps = buildPartitionSteps(partition);
    const [filter, setFilter] = useState<PartitionFilter>('all');

    // Filtering only changes which subsets you page through - the underlying
    // data (justificationsSoFar per step, and the completed relevantPartition/
    // irrelevantPartition on `partition` itself) is unaffected, so the number
    // of Next/Back clicks needed to reach the end matches whatever's filtered
    // in, not the full unfiltered powerset.
    const filteredSteps = useMemo(() => {
        switch (filter) {
            case 'entailed': return steps.filter(s => s.entailed);
            case 'minimal': return steps.filter(s => s.entailed && s.minimal);
            default: return steps;
        }
    }, [steps, filter]);

    const [currentStep, setCurrentStep] = useState(0);
    const step: PartitionDebuggerStep | undefined = filteredSteps[currentStep];
    const isLastInView = filteredSteps.length > 0 && currentStep === filteredSteps.length - 1;

    const handleFilterChange = (next: PartitionFilter) => {
        setFilter(next);
        setCurrentStep(0);
    };

    return (
        <div className="min-h-screen bg-accent flex flex-col">
            <Header />

            <main className="flex-1 px-8 py-6">

                {/* Page header */}
                <div className="flex items-start justify-between mb-4">
                    <div>
                        <h1 className="text-2xl font-bold text-foreground">
                            Relevant Partition
                        </h1>
                        <p className="text-muted-foreground text-sm mt-1">
                            Step-by-step justification search
                        </p>

                        <p className="text-sm text-foreground mt-2 max-w-2xl">
                            Every subset of the knowledge base is checked for classical entailment of the query.
                            Minimal entailing subsets become justifications; the statements that appear in at
                            least one justification form the relevant partition, everything else is irrelevant.
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

                {/* Justification visualiser, full width - only meaningful once a step exists */}
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
                    + Explanation (right) side by side */}
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

                                {isLastInView && (
                                    <div className="mt-4 rounded-lg p-4 border bg-green-50 border-green-200">
                                        <p className="font-bold text-green-700 mb-1">
                                            ✓ Partition Complete
                                        </p>
                                        <p className="text-sm text-green-600">
                                            {filter === 'all'
                                                ? 'Every subset has been checked. The relevant and irrelevant partitions are shown above.'
                                                : "You've reached the end of this filtered view. The relevant and irrelevant partitions - computed from the full search, not just what's filtered in - are shown above."}
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

export default BasicRelevantPartitionStepThrough;
