import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { BaseRankDTO, EntailmentDTO } from '../../api/api';
import Header from '../layout/Header';
import Footer from '../layout/Footer';
import { baseRankSteps, BaseRankDebuggerStep } from './baseRankSteps';
import StepControls from './StepControls';
import { ArrowRightIcon, ArrowLeftIcon, TriangleRightIcon } from '@radix-ui/react-icons';
import { Button } from '../ui/Buttons';

interface ResultsState {
    baseRank: BaseRankDTO;
    entailment: EntailmentDTO;
    query: string;
    algorithm: string;
}

const BaseRankStepThrough: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { baseRank, entailment, query, algorithm } = location.state as ResultsState;

    const steps = baseRankSteps(baseRank);
    const [currentStep, setCurrentStep] = useState(0);
    const step: BaseRankDebuggerStep = steps[currentStep];

    const pseudocode = [
        { num: 1, code: 'i := 0' },
        { num: 2, code: 'E₀ := K→  (materialise K)' },
        { num: 3, code: 'while Eᵢ₋₁ ≠ Eᵢ:' },
        { num: 4, code: '    Eᵢ₊₁ := { α→β ∈ Eᵢ | Eᵢ |= ¬α }', indent: true },
        { num: 5, code: '    Rᵢ := Eᵢ \\ Eᵢ₊₁', indent: true },
        { num: 6, code: '    i := i + 1', indent: true },
        { num: 7, code: 'R∞ := Eᵢ₋₁' },
        { num: 8, code: 'if Eᵢ₋₁ = ∅ then n := i − 1' },
        { num: 9, code: 'else n := i' },
        { num: 10, code: 'return (R₀, ..., Rₙ₋₁, R∞, n)' },
    ];

    return (
        <div className="min-h-screen bg-accent flex flex-col">
            <Header />
            <main className = "flex-1 px-8 py-6">

                {/* page header */}
                <div className="flex items-start justify-between mb-4">
                    <div>
                        <h1 className="text-2xl font-bold text-foreground">
                            BaseRank Construction
                        </h1>

                        <p className="text-muted-foreground text-sm mt-1">
                            Step-by-step evaluation
                        </p>

                        <p className="text-sm text-foreground mt-2 max-w-2xl">
                            BaseRank partitions the knowledge base into ranked sets based on exceptionality. More exceptional statements receive higher ranks, while classical statements are assigned to Rank ∞.
                        </p>
                    </div>

                    <Button onClick={() => navigate('/')} className="text-sm text-muted-foreground border border-border rounded-lg px-4 py-2 hover:bg-white transition">
                        <span className="flex items-center gap-1">
                            <ArrowLeftIcon className="h-3 w-3" />
                            Edit Query
                        </span>
                    </Button>
                </div>

                {/* final Ranking: full width */}
                <div className="bg-white border border-border rounded-xl p-6 mb-4">
                    <h3 className="text-primary font-semibold mb-3">
                        Current Ranking
                    </h3>

                    <table className="w-full border-collapse">
                        <tbody>

                            {step.rankingState.filter(rank => rank.isAssigned || rank.isCurrentlyBeingAssigned).map((rank) => (

                                <tr key={rank.rankNumber} className={`border-b border-border ${rank.isCurrentlyBeingAssigned ? 'bg-amber-50' : ''}`}>
                                    <td className={`py-3 px-4 font-semibold text-sm w-24 text-primary ${rank.isAssigned ? 'opacity-40' : ''}`}>
                                        Rank {rank.rankName}
                                    </td>

                                    <td className="py-3 px-4">
                                        <div className="flex flex-wrap gap-2">
                                            {rank.formulas.map((f, i) => (
                                                <span key={i} className={`font-mono text-sm ${rank.isCurrentlyBeingAssigned ? 'text-amber-600 font-medium': 'text-foreground'}`}>
                                                    {f}
                                                </span>
                                            ))}
                                        </div>
                                    </td>

                                    {rank.isCurrentlyBeingAssigned && (
                                        <td className="py-3 px-4 text-xs text-amber-600 font-medium">
                                            <span className="flex items-center gap-1">
                                                <ArrowLeftIcon className="h-3 w-3" />
                                                being assigned
                                            </span>
                                        </td>
                                    )}
                                </tr>
                            ))}

                            {step.rankingState.filter(r => r.isAssigned || r.isCurrentlyBeingAssigned).length === 0 && (
                                <tr>
                                    <td colSpan={3} className="py-4 text-center text-xs text-muted-foreground italic">
                                        No ranks assigned yet
                                    </td>
                                </tr>
                            )}

                        </tbody>
                    </table>
                </div>

                {/* algorithm + explanation side by side */}
                <div className="flex gap-4 mb-4">

                    {/* algorithm */}
                    <div className="bg-white border border-border rounded-xl p-6 flex-1">

                        <h3 className="text-primary font-semibold mb-1">
                            Algorithm
                        </h3>

                        <p className="text-xs text-muted-foreground mb-4">
                            BaseRank (pseudocode)
                        </p>

                        <div className="font-mono text-sm space-y-1">

                            {pseudocode.map((line) => {
                                const isHighlighted = step.highlightedLines.includes(line.num);
                                return (
                                    <div key={line.num} className={`flex items-center gap-3 px-3 py-2 rounded-lg ${isHighlighted ? 'bg-amber-50 border border-amber-200' : ''}`}>
                                        {isHighlighted

                                            ? <span className="text-amber-500"> <TriangleRightIcon/></span>
                                            : <span className="w-3" />
                                        }

                                        <span className={`w-5 text-xs rounded px-1 ${
                                            isHighlighted
                                                ? 'bg-amber-400 text-white'
                                                : 'bg-gray-100 text-gray-500'
                                        }`}>
                                            {line.num}
                                        </span>

                                        <span className={isHighlighted
                                            ? 'text-foreground font-medium'
                                            : 'text-muted-foreground'
                                        }>
                                            {line.code}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Explanation */}
                    <div className="bg-white border border-border rounded-xl p-6 flex-1">
                        <h3 className="text-primary font-semibold mb-4">
                            Explanation
                        </h3>

                        <p className="text-sm text-foreground leading-relaxed whitespace-pre-line mb-4">
                            {step.explanation}
                        </p>

                        {/* Materialisation panel */}
                        {step.materialisedFormulas && step.originalFormulas && (
                            <div className="mb-4">

                                <p className="text-sm font-medium text-foreground mb-2">
                                    Materialisation:
                                </p>

                                <div className="space-y-1">
                                    {step.originalFormulas.map((original, i) => (
                                        <div key={i} className="flex items-center gap-3 font-mono text-sm">
                                            <span className="text-foreground">
                                                {original}
                                            </span>

                                            <span className="text-muted-foreground">
                                                <ArrowRightIcon/>
                                            </span>

                                            <span className="text-primary">
                                                {step.materialisedFormulas![i]}
                                            </span>
                                            {!original.includes('~|') && (
                                                <span className="text-xs text-muted-foreground">
                                                    (unchanged)
                                                </span>
                                            )}
                                        </div>
                                    ))}
                                </div>

                                {/* <p className="text-xs text-muted-foreground mt-2">
                                    E₀ = {'{ ' + step.materialisedFormulas.join(', ') + ' }'}
                                </p> */}

                                {/* E₀ in a box */}
                                <p className="mt-8 text-sm font-medium text-foreground mb-2">
                                    E₀ (materialised knowledge base):
                                </p>

                                <div className="bg-accent border border-border rounded-lg p-3 font-mono text-sm text-foreground">
                                    {'{ ' + step.materialisedFormulas.join(', ') + ' }'}
                                </div>

                                <p className="text-xs text-muted-foreground mt-1">
                                    This is the starting point for the BaseRank algorithm.
                                </p>
                            </div>
                        )}

                        {/* Exceptionality checks */}
                        {step.checks.length > 0 && (
                            <div className="mb-4">

                                <p className="text-sm font-medium text-foreground mb-2">
                                    Exceptionality checks:
                                </p>

                                {/* Show materialised KB once above all checks */}
                                <div className="mb-3">
                                    <p className="text-xs text-muted-foreground mb-1">
                                        Materialised KB used for checks:
                                    </p>
                                    
                                    <div className="bg-accent border border-border rounded-lg p-2 font-mono text-xs text-foreground mb-3">
                                        {step.checks[0]?.reason}
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    {step.checks.map((check, i) => (
                                        <div key={i} className={`rounded-lg p-3 border text-sm ${check.isExceptional ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'}`}>
                                            <p className={`font-medium mb-1 ${check.isExceptional ? 'text-red-700' : 'text-green-700'}`}>
                                                '{check.antecedent}' is {check.isExceptional ? 'EXCEPTIONAL' : 'NOT exceptional'}
                                            </p>

                                            {/* <p className="text-xs text-muted-foreground mb-1">
                                                Materialised KB: 
                                                <span className="font-mono">
                                                    {check.reason}
                                                </span>
                                            </p> */}

                                            <p className="text-xs text-muted-foreground">
                                                {check.isExceptional
                                                    ? `→ ${check.affectedRules.join(', ')} carries forward`
                                                    : `→ ${check.affectedRules.join(', ')} assigned to Rank ${check.rankNumber}`
                                                }
                                            </p>
                                            
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}


                        {/* Final ranking */}
                        {step.isFinalStep && (
                            <div className="mt-4 rounded-lg p-4 border bg-green-50 border-green-200">
                                <p className="font-bold text-green-700 mb-1">
                                    ✓ BaseRank Construction Complete
                                </p>

                                <p className="text-sm text-green-600">
                                    All statements have been ranked. The ranking is now ready for use in the Rational Closure entailment algorithm.
                                </p>
                            </div>
                        )}

                    </div>
                </div>

                {/* Step controls */}
                <div className="bg-white border border-border rounded-xl p-4 mb-4">
                    <StepControls
                        current={currentStep}
                        total={steps.length}
                        onStart={() => setCurrentStep(0)}
                        onBack={() => setCurrentStep(prev => Math.max(0, prev - 1))}
                        onNext={() => setCurrentStep(prev => Math.min(steps.length - 1, prev + 1))}
                        onEnd={() => setCurrentStep(steps.length - 1)}
                    />
                </div>

                {/*continue to the algorithm-specific step-through, based on what was actually selected */}
                {step.isFinalStep && (
                    <div className="flex justify-end">
                        <Button variant="primary" size="lg"
                            onClick={() =>
                                navigate(algorithm === 'basic relevant' ? '/results/relevant/basic' : '/results/rational', {
                                    state: { baseRank, entailment, query, algorithm }
                                }
                            )}
                        >
                            {algorithm === 'basic relevant' ? 'Continue to Relevant Closure' : 'Continue to Rational Closure'}
                            <ArrowRightIcon className="ml-2 h-4 w-4" />
                        </Button>
                    </div>
                )}

            </main>
            <Footer/>
        </div>

    );

};

export default BaseRankStepThrough;
