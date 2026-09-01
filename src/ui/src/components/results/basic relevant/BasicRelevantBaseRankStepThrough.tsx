import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { BaseRankDTO, EntailmentDTO, PartitionDTO } from '../../../api/api';
import Header from '../../layout/Header';
import AlgorithmProgress, { AlgorithmPhase } from '../../layout/AlgorithmProgress';
import Footer from '../../layout/Footer';
import { baseRankSteps, BaseRankDebuggerStep } from './BasicRelevantbaseRankSteps';
import StepControls from './BasicRelevantStepControls';
import { ArrowRightIcon, ArrowLeftIcon, TriangleRightIcon } from '@radix-ui/react-icons';
import { Button } from '../../ui/Buttons';
import { TexFormula } from '../../ui/TexFormula';

interface ResultsState {
    baseRank: BaseRankDTO;
    entailment: EntailmentDTO;
    partition: PartitionDTO;
    query: string;
    algorithm: string;
}
const BaseRankStepThrough: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { baseRank, entailment,partition, query, algorithm } = location.state as ResultsState;
    // 'basic relevant' and 'minimal relevant' both feed the same generic relevant-partition
    // step-through - only which partition endpoint populated `partition` differs.
    const isRelevantClosure = algorithm === 'basic relevant' || algorithm === 'minimal relevant';
    // Basic/Minimal Relevant Closure route through a Partition phase; Rational
    // and Lexicographic Closure go straight from Base Rank to Closure.
    const progressPhases: AlgorithmPhase[] = isRelevantClosure
        ? ['baserank', 'partition', 'closure']
        : ['baserank', 'closure'];

    const steps = baseRankSteps(baseRank);
    const [currentStep, setCurrentStep] = useState(0);
    const step: BaseRankDebuggerStep = steps[currentStep];

    // Authored as LaTeX and rendered through TexFormula, same convention as
    // BasicRelevantAlgorithmView.tsx. NOTE: this is a more detailed 0-15
    // line numbering than the 1-10 scheme BasicRelevantbaseRankSteps.ts's
    // highlightedLines currently targets, so the highlighted line won't line
    // up 1:1 with the old scheme until that file's highlightedLines values
    // are remapped to match.
    const pseudocode: { num: number; tex: string; indent?: boolean }[] = [
        { num: 0, tex: "\\text{Input: A knowledge base } \\mathcal{K}" },
        { num: 1, tex: "\\text{Output: An ordered tuple } (\\mathcal{R}_0, \\dots, \\mathcal{R}_{n-1}, \\mathcal{R}_\\infty, n)" },
        { num: 2, tex: "i := 0" },
        { num: 3, tex: "\\mathcal{E}_0 := \\mathcal{\\overrightarrow{K}}" },
        { num: 4, tex: "\\textbf{while}\\ \\mathcal{E}_{i-1} \\neq \\mathcal{E}_i\\ \\textbf{do}" },
        { num: 5, tex: "\\mathcal{E}_{i+1} := \\{\\alpha \\to \\beta \\in \\mathcal{E}_i \\mid \\mathcal{E}_i \\models \\neg\\alpha\\}", indent: true },
        { num: 6, tex: "\\mathcal{R}_i := \\mathcal{E}_i \\setminus \\mathcal{E}_{i+1}", indent: true },
        { num: 7, tex: "i := i + 1", indent: true },
        { num: 8, tex: "\\textbf{end while}" },
        { num: 9, tex: "\\mathcal{R}_\\infty := \\mathcal{E}_{i-1}" },
        { num: 10, tex: "\\textbf{if}\\ \\mathcal{E}_{i-1} = \\varnothing\\ \\textbf{then}" },
        { num: 11, tex: "n := i - 1", indent: true },
        { num: 12, tex: "\\textbf{else}" },
        { num: 13, tex: "n := i", indent: true },
        { num: 14, tex: "\\textbf{end if}" },
        { num: 15, tex: "\\textbf{return}\\ (\\mathcal{R}_0, \\dots, \\mathcal{R}_{n-1}, \\mathcal{R}_\\infty, n)" },
    ];

    return (
        <div className="min-h-screen bg-accent flex flex-col">
            <Header />
            <main className = "flex-1 px-8 py-6">

                <AlgorithmProgress currentPhase="baserank" phases={progressPhases} />

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

                        <div className="text-sm space-y-1">

                            {pseudocode.map((line) => {
                                const isHighlighted = step.highlightedLines.includes(line.num);
                                return (
                                    <div
                                        key={line.num}
                                        className={`flex items-center gap-3 px-3 py-2 rounded-lg ${isHighlighted ? 'bg-amber-50 border border-amber-200' : ''} ${line.indent ? 'pl-8' : ''}`}
                                    >
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
                                            <TexFormula>{line.tex}</TexFormula>
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

                        {step.isInitialStep &&(
                            <div className="mb-4">
                                                <p className="text-sm font-medium text-foreground mb-2">
                                                    In this knowledge base:
                                                </p>
                                                   <p className="text-sm font-medium text-foreground m-4">
                                                    Defeasible:
                                                    </p>
                                                <div className="bg-accent border border-border rounded-lg p-3 font-mono text-sm text-foreground">
                                                    { step.consideredFormulas.filter(f => f.includes('~|')).join(", ") }
                                                </div>

                                                   <p className="text-sm font-medium text-foreground m-4">
                                                    Classical:
                                                    </p>
                                                <div className="bg-accent border border-border rounded-lg p-3 font-mono text-sm text-foreground">
                                                    {step.consideredFormulas.filter(f => !f.includes('~|')).join(", ") }
                                                </div>

                                            </div>

                            )
                            }



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
                                    { step.materialisedFormulas.join(', ') }
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

                {/*continue to rc */}
                {step.isFinalStep && (
                                    <div className="flex justify-end">
                                        <Button variant="primary" size="lg"
                                                                                    onClick={() => {
                                                                                        const route =
                                                                                            algorithm === 'basic relevant' ? '/results/relevant/basic/partition' :
                                                                                            algorithm === 'lexicographic' ? '/results/lexicographic' :
                                                                                            algorithm === 'minimal relevant' ? '/results/relevant/minimal/partition' :
                                                                                            algorithm === 'rational' ? '/results/rational' :
                                                                                            '/results/rational';

                                                                                        navigate(route, { state: { baseRank, entailment, partition, query, algorithm } });

                                                                                    }}
                                                                                >
                                                                        {algorithm === 'basic relevant' ? 'Continue to Relevant Partition' :algorithm === 'minimal relevant' ? 'Continue to Relevant Partition' : algorithm === 'lexicographic' ? 'Continue to Lexicographical Closure': algorithm === 'rational' ? 'Continue to Rational Closure': 'Continue to Rational Closure'}

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
