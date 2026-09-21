/*
 * File: ExplanationView.tsx
 * Author: Nikita Martin (2026 Honours Project, University of Cape Town)
 * Status: Original work.
 * Context: explanation view of rc closure - contains actual explanations
 * Purpose: Educational use only.
 */
import React, {useState} from 'react';
import { DebuggerStep } from './rcSteps';
import { InfoCircledIcon, ChevronDownIcon, ChevronUpIcon } from '@radix-ui/react-icons';
import {Button} from '../../ui/Buttons'

//explanation steps
interface ExplanationViewProps {
    step: DebuggerStep;
}

const ExplanationView: React.FC<ExplanationViewProps> = ({ step }) => {
    const [showDetails, setShowDetails] = useState(false);

    //reset showDetails when the step changes
    React.useEffect(() =>{
        setShowDetails(false);
    }, [step.stepNumber]);
    
    const isWhileStep = step.highlightedLines.includes(5) && !step.isInitialStep;

    return(
        <div className="h-full flex flex-col"> 
            
            <h3 className="text-primary font-semibold mb-4 flex items-center gap-2">
                Explanation
            </h3>

            <div className="flex-1 min-h-0 pr-1 overflow-y-auto">

                <p className="text-sm text-foreground leading-relaxed whitespace-pre-line mb-4">
                    {step.explanation}
                </p>

                {/* drowning-problem-only: the removed rank, split into what actually caused the contradiction vs. what was innocent and just drowned alongside it for sharing a rank. */}
                {step.drowningHighlight && (
                    <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4">
                        <p className="text-sm font-semibold text-red-700 mb-3">
                            {step.drowningHighlight.rankLabel} - removed in full
                        </p>
 
                        <div className="space-y-2">
                            <div className="flex flex-wrap items-center gap-2">
                                <span className="text-red-600 font-bold">✗</span>
                                <span className="font-mono text-sm text-foreground line-through decoration-red-400">
                                    {step.drowningHighlight.culprit}
                                </span>

                                <span className="text-xs font-medium text-red-700 bg-red-100 rounded-full px-2 py-0.5">
                                    caused the contradiction
                                </span>
                            </div>
 
                            {step.drowningHighlight.innocent.map((formula, i) => (
                                <div key={i} className="flex flex-wrap items-center gap-2">
                                    <span className="text-amber-500 font-bold">✗</span>
                                    <span className="font-mono text-sm text-foreground line-through decoration-amber-400">
                                        {formula}
                                    </span>
                                    
                                    <span className="text-xs font-medium text-amber-700 bg-amber-100 rounded-full px-2 py-0.5">
                                        drowned - unrelated
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* shpw details button - only on while condition steps */}
                {isWhileStep && (
                    <Button onClick={() => setShowDetails(!showDetails)} className="flex items-center gap-2 text-xs border border-gray-300 text-gray-500 rounded-lg px-3 py-1.5 hover:border-primary hover:text-primary transition-colors mt-2 mb-4">
                        <InfoCircledIcon className="h-3 w-3" />
                        {showDetails ? 'Hide details' : 'Show details'}
                        {showDetails ? <ChevronUpIcon className="h-3 w-3" /> : <ChevronDownIcon className="h-3 w-3" />}
                    </Button>
                )}

                {/* details panel */}
                {isWhileStep && showDetails && (
                    <div className="mb-4 border border-border rounded-lg p-4 bg-accent">
                        <p className="text-sm font-medium text-foreground mb-2">
                            Justification - formulas that caused the contradiction:
                        </p>

                        <div className="font-mono text-sm text-foreground bg-white border border-border rounded p-2 mb-3">
                            {step.justification && step.justification.length > 0
                                ? '{ ' + step.justification.join(', ') + ' }'
                                : 'No justification computed for this step.'}
                        </div>

                        <p className="text-sm text-muted-foreground">
                            {step.justification && step.justification.length > 0
                                ? `This is the unsatisfiable core: the smallest set of formulas that, together with '${step.queryAntecedent}', leads to a contradiction.`
                                : ''}
                        </p>
                    </div>
                )}

                {/* show initial step */}
                {step.isInitialStep && step.materialisedWorking && (
                    <div className="mb-4">
                        <p className="text-sm font-medium text-foreground mb-2">
                            Materialised working set R (for entailment checks):
                        </p>

                        <div className="bg-accent border border-border rounded-lg p-3 font-mono text-sm text-foreground">
                            {'{ ' + step.materialisedWorking.join(', ') + ' }'}
                        </div>
                        
                        <p className="text-xs text-muted-foreground mt-2">
                            Note: |~ (defeasible) becomes =&gt; (classical) for SAT checking
                        </p>
                    </div>
                )}

                {/* show the working set */}
                {!step.isInitialStep && step.workingSet.length > 0 && (
                    <div className="mb-4">
                        <p className="text-sm font-medium text-foreground mb-2">
                            {step.workingSetIncludesRInfinity ? 'R ∪ R∞:' : 'Working set R:'}
                        </p>

                        <div className="bg-accent border border-border rounded-lg p-3 font-mono text-sm text-foreground">
                            {'{ ' + step.workingSet.join(', ') + ' }'}
                        </div>
                    </div>
                )}

                {/* show rank infinity*/}
                {!step.workingSetIncludesRInfinity && step.rInfinity.length > 0 && (
                    <div className="mb-4">
                        <p className="text-sm font-medium text-foreground mb-2">
                            R∞:
                        </p>

                        <div className="bg-accent border border-border rounded-lg p-3 font-mono text-sm text-foreground">
                            {'{ ' + step.rInfinity.join(', ') + ' }'}
                        </div>
                    </div>
                )}

                {/* show the final step*/}
                {step.isFinalStep && (
                    <div className={`mt-4 rounded-lg p-4 border ${step.entailed ? 'bg-green-50 border-green-200': 'bg-red-50 border-red-200'}`}>
                        <p className={`font-bold text-lg ${step.entailed ? 'text-green-700' : 'text-red-700'}`}>
                            {step.entailed ? '✓ ENTAILED' : '✗ NOT ENTAILED'}
                        </p>

                        <p className={`text-sm mt-1 ${step.entailed ? 'text-green-600' : 'text-red-600'}`}>
                            {step.entailed ? 
                                'The query is in the Rational Closure of K'
                                : 'The query is not in the Rational Closure of K'
                            }
                        </p>
                    </div>
                )}

                {/* Justification for why the query is entailed, on the successful final step */}
                {step.isFinalStep && step.entailed && step.weakJustification && step.weakJustification.length > 0 && (
                    <div className="mt-4">
                        <p className="text-md font-medium text-foreground mb-2">
                            Justification:
                        </p>
                        <div className="flex flex-wrap gap-2">
                            {step.weakJustification.map((formula, i) => (
                                <span key={i} className="font-mono text-sm text-green-700 bg-green-100 border border-green-200 rounded-full px-3 py-1">
                                    {formula}
                                </span>
                            ))}
                        </div>
                        <p className="text-sm text-muted-foreground mt-2">
                            The smallest set of statements in the surviving R∞ ∪ R that entails the query on its own.
                        </p>
                    </div>
                )}

                {/* Make the absence of a justification explicit, instead of showing nothing */}
                {step.isFinalStep && step.entailed === false && (
                    <div className="mt-4">
                        <p className="text-md font-medium text-foreground mb-2">
                            Justification:
                        </p>

                        <p className="text-sm text-muted-foreground">
                            No justification, as nothing in the remaining working set entails the query, which is why it is not entailed.
                        </p>
                    </div>
                )}

                {/* Drowning problem */}
                {step.isFinalStep && (
                    <div className="mt-4 rounded-lg p-4 border bg-blue-50 border-blue-200">
                        <p className="font-semibold text-blue-700 mb-1">
                            Note: Limitation of the Rational Closure
                        </p>

                        <p className="text-sm text-blue-600">
                            Since the Rational Closure removes the entire rank, it may remove rules that are unrelated to the conflict. This is known as the "drowning problem". Lexicographic and Relevant Closure address this limitation.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ExplanationView;