import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { BaseRankDTO, LexicographicEntailmentDTO } from '../../../api/api';
import Header from '../../layout/Header';
import AlgorithmProgress from '../../layout/AlgorithmProgress';
import Footer from '../../layout/Footer';
import { buildLexicographicSteps, LexDebuggerStep } from './LexicographicStep';
import LexicographicRankingVisualiser from './LexiRankingVis';
import LexicographicAlgorithmView from './LexiAlgorithmView';
import LexicographicExplanationView from './LexicographicExplanationView';
import StepControls from '../StepControls';
import { ArrowLeftIcon, ArrowRightIcon } from '@radix-ui/react-icons';
import { Button } from '../../ui/Buttons';

interface ResultsState {
    baseRank: BaseRankDTO;
    entailment: LexicographicEntailmentDTO;
    query: string;
    algorithm: string;
}

const LexicographicStepThrough: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { baseRank, entailment, query, algorithm } = location.state as ResultsState;

    const steps = buildLexicographicSteps(entailment);
    const [currentStep, setCurrentStep] = useState(0);
    const step: LexDebuggerStep = steps[currentStep];

    return (
        <div className="min-h-screen bg-accent flex flex-col">
            <Header />

            {/* Page Body */}
            <main className="flex-1 px-8 py-6">

                <AlgorithmProgress currentPhase="closure" phases={['baserank', 'closure']} />

                {/* Page header */}
                <div className="flex items-start justify-between mb-4">
                    <div>
                        <h1 className="text-2xl font-bold text-foreground">
                            Lexicographic Closure
                        </h1>
                        <p className="text-muted-foreground text-sm mt-1">
                            Step-by-step evaluation
                        </p>

                        {/* Brief explanation of the LexC algorithm */}
                        <p className="text-sm text-foreground mt-2 max-w-2xl">
                            Lexicographic Closure weakens an exceptional rank rather than
                            discarding it, keeping as many of its statements as possible and
                            dropping one more only when every remaining sub-knowledge base
                            still refutes the query antecedent.
                        </p>
                    </div>

                    <Button className="text-sm text-muted-foreground border border-border rounded-lg px-4 py-2 hover:bg-white transition"
                        onClick={() => navigate('/baserank', {
                            state: { baseRank, entailment, query, algorithm }
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

                {/* Ranking visualiser, full width */}
                <div className="bg-white border border-border rounded-xl p-6 mb-4">
                    <LexicographicRankingVisualiser rankingState={step.rankingState} />
                </div>

                {/* Algorithm + Explanation side by side */}
                <div className="flex gap-4 mb-4">
                    <div className="bg-white border border-border rounded-xl p-6 flex-1">
                        <LexicographicAlgorithmView highlightedLines={step.highlightedLines} />
                    </div>

                    <div className="bg-white border border-border rounded-xl p-6 flex-1">
                        <LexicographicExplanationView step={step} />
                    </div>
                </div>

                {/* Step controls */}
                <div className="bg-white border border-border rounded-xl p-4">
                    <StepControls
                        current={currentStep}
                        total={steps.length}
                        onStart={() => setCurrentStep(0)}
                        onBack={() => setCurrentStep(prev => Math.max(0, prev - 1))}
                        onNext={() => setCurrentStep(prev => Math.min(steps.length - 1, prev + 1))}
                        onEnd={() => setCurrentStep(steps.length - 1)}
                    />
                </div>

                {/* Done button, only on final step */}
                {step.isFinalStep && (
                    <div className="flex justify-end mt-4">
                        <Button variant="primary" size="lg" onClick={() => navigate('/')}>
                            Done
                            <ArrowRightIcon className="ml-2 h-4 w-4" />
                        </Button>
                    </div>
                )}

            </main>

            <Footer />
        </div>
    );
};

export default LexicographicStepThrough;
