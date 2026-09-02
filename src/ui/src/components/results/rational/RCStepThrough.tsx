import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { BaseRankDTO, EntailmentDTO } from '../../../api/api';
import Header from '../../layout/Header';
import AlgorithmProgress from '../../layout/AlgorithmProgress';
import Footer from '../../layout/Footer';
import { buildDebuggerSteps, DebuggerStep } from './rcSteps';
import RankingVisualiser from '../RankingVisualiser';
import AlgorithmView from '../AlgorithmView';
import ExplanationView from '../ExplanationView';
import StepControls from '../StepControls';
import { ArrowLeftIcon, ArrowRightIcon } from '@radix-ui/react-icons';
import { Button } from '../../ui/Buttons';

interface ResultsState {
    baseRank: BaseRankDTO;
    entailment: EntailmentDTO;
    query: string;
    algorithm: string;
}

const RCStepThrough: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
    // const { entailment, query } = location.state as ResultsState;
    const { baseRank, entailment, query, algorithm } = location.state as ResultsState;

    const steps = buildDebuggerSteps(entailment);
    const [currentStep, setCurrentStep] = useState(0);
    const step: DebuggerStep = steps[currentStep];

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
                            Rational Closure
                        </h1>
                        <p className="text-muted-foreground text-sm mt-1">
                            Step-by-step evaluation
                        </p>

                        {/* Brief explanation of the RC algorithm */}
                        <p className="text-sm text-foreground mt-2 max-w-2xl">
                            Rational Closure evaluates whether a query is entailed by 
                            progressively removing exceptional ranks from the knowledge 
                            base until the query antecedent is no longer exceptional.
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
                <div className="bg-white border border-border rounded-xl p-6 mb-4 max-h-52 overflow-y-auto">
                    <RankingVisualiser rankingState={step.rankingState} />
                </div>

                {/* Algorithm + Explanation side by side */}
                <div className="flex gap-4 mb-4">
                    <div className="bg-white border border-border rounded-xl p-6 flex-1 h-[450px] overflow-y-auto">
                        <AlgorithmView highlightedLines={step.highlightedLines} />
                    </div>

                    <div className="bg-white border border-border rounded-xl p-6 flex-1 h-[450px] overflow-y-auto">
                        <ExplanationView step={step}/>
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

export default RCStepThrough;