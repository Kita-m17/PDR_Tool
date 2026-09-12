import React, { useState } from 'react';
import { LexDebuggerStep } from './LexicographicStep';
import { SubKnowledgeBaseCheckDTO } from '../../../api/api';
import { CheckCircledIcon, CrossCircledIcon, InfoCircledIcon, ChevronDownIcon, ChevronUpIcon } from '@radix-ui/react-icons';
import { Button } from '../../ui/Buttons';

interface LexicographicExplanationViewProps {
    step: LexDebuggerStep;
}

const LexicographicExplanationView: React.FC<LexicographicExplanationViewProps> = ({ step }) => {
    const [showDetails, setShowDetails] = useState(false);

    // reset showDetails when the step changes, same as the Rational Closure view
    React.useEffect(() => {
        setShowDetails(false);
    }, [step.stepNumber]);

    // Details are offered on the steps where the algorithm is actually doing
    // something - weakening a rank, or asking the final query. The opening
    // materialisation step has nothing extra to say.
    const hasDetails = !step.isInitialStep &&
        (!!step.stepDetails || !!step.subKBs?.length || step.isFinalStep);

    // The formal definition only makes sense while a rank is being weakened.
    const isSubsetStep = step.subsetSize !== undefined && !!step.subKBs?.length;

    const renderChips = (values: string[]) => (
        <div className="flex flex-wrap gap-2">
            {values.map((value, i) => (
                <span key={i} className="font-mono text-xs text-foreground bg-white border border-border rounded px-2 py-1">
                    {value}
                </span>
            ))}
        </div>
    );

    const renderSet = (formulas: string[]) => (
        <div className="bg-accent border border-border rounded-lg p-3 font-mono text-sm text-foreground">
            {'{ ' + formulas.join(', ') + ' }'}
        </div>
    );

    const renderChecks = (checks: SubKnowledgeBaseCheckDTO[], testedLabel: string) => (
        <table className="w-full border-collapse">
            <thead>
                <tr className="border-b border-border">
                    <th className="py-2 px-3 text-left text-xs font-medium text-muted-foreground">Kept from rank</th>
                    <th className="py-2 px-3 text-left text-xs font-medium text-muted-foreground">Sub-knowledge base</th>
                    <th className="py-2 px-3 text-left text-xs font-medium text-muted-foreground">{testedLabel}</th>
                </tr>
            </thead>

            <tbody>
                {checks.map((check, i) => (
                    <tr key={i} className={`border-b border-border ${check.holds ? '' : 'bg-green-50'}`}>
                        <td className="py-2 px-3 font-mono text-sm text-foreground">
                            {check.subsetSize === 0 ? '{ }' : check.subsetString}
                        </td>

                        <td className="py-2 px-3 font-mono text-xs text-muted-foreground">
                            {'{ ' + check.subKnowledgeBase.join(', ') + ' }'}
                        </td>

                        <td className="py-2 px-3 text-sm">
                            <span className={`flex items-center gap-1 ${check.holds ? 'text-amber-600' : 'text-green-700'}`}>
                                {check.holds ? <CheckCircledIcon className="h-3 w-3" /> : <CrossCircledIcon className="h-3 w-3" />}
                                {check.holds ? 'Yes' : 'No'}
                            </span>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    );

    return (
        <div>
            <h3 className="text-primary font-semibold mb-4 flex items-center gap-2">
                Explanation
            </h3>

            <p className="text-sm text-foreground leading-relaxed whitespace-pre-line mb-4">
                {step.explanation}
            </p>

            {/* Show details button - on the weakening steps and the final step */}
            {hasDetails && (
                <Button onClick={() => setShowDetails(!showDetails)} className="flex items-center gap-2 text-xs border border-gray-300 text-gray-500 rounded-lg px-3 py-1.5 hover:border-primary hover:text-primary transition-colors mt-2 mb-4">
                    <InfoCircledIcon className="h-3 w-3" />
                    {showDetails ? 'Hide details' : 'Show details'}
                    {showDetails ? <ChevronUpIcon className="h-3 w-3" /> : <ChevronDownIcon className="h-3 w-3" />}
                </Button>
            )}

            {/* Details panel */}
            {hasDetails && showDetails && (
                <div className="mb-4 border border-border rounded-lg p-4 bg-accent">

                    {/* How the combined formula for this subset size is built */}
                    {isSubsetStep && (
                        <div className="mb-3">
                            <p className="text-xs font-medium text-foreground mb-2">
                                How R{step.rankNumber},{step.subsetSize} is built:
                            </p>

                            <div className="font-mono text-xs text-foreground bg-white border border-border rounded p-2 mb-2">
                                R{step.rankNumber},{step.subsetSize} = ⋁ over X ∈ Subsets(R{step.rankNumber}, {step.subsetSize}) of ⋀ over x ∈ X of x
                            </div>

                            <p className="text-xs text-muted-foreground">
                                There are C({step.rankSize}, {step.subsetSize}) = {step.subsetCount} subsets of this size.
                                Each one is tested on its own, and the rank survives at this size if at least one of
                                them stops refuting {step.queryAntecedent}.
                            </p>
                        </div>
                    )}

                    {/* The sub-knowledge bases that stopped refuting the antecedent */}
                    {step.survivingSubKBs && step.survivingSubKBs.length > 0 && (
                        <div className="mb-3">
                            <p className="text-xs font-medium text-foreground mb-2">
                                Surviving sub-knowledge bases:
                            </p>

                            {renderChips(step.survivingSubKBs.map(check =>
                                check.subsetSize === 0 ? '{ }' : check.subsetString
                            ))}

                            <p className="text-xs text-muted-foreground mt-2">
                                These subsets of Rank {step.survivingSubKBs[0].rankNumber} no longer
                                refute {step.queryAntecedent}. They are the ones the combined formula keeps.
                            </p>
                        </div>
                    )}

                    {/* The trace the algorithm recorded while it ran */}
                    {step.stepDetails && (
                        <div>
                            <p className="text-xs font-medium text-foreground mb-2">
                                Algorithm trace:
                            </p>

                            <div className="font-mono text-xs text-foreground whitespace-pre-line bg-white border border-border rounded p-2">
                                {step.stepDetails}
                            </div>
                        </div>
                    )}

                    {/* The final step has no rank of its own to describe */}
                    {step.isFinalStep && (
                        <p className="text-xs text-muted-foreground">
                            The query is asked of every sub-knowledge base that survived the weakening loop.
                            It is only entailed if all of them answer yes.
                        </p>
                    )}
                </div>
            )}

            {/* The working set, shown on every step so R∞ U R is always visible */}
            <div className="mb-4">
                <p className="text-sm font-medium text-foreground mb-2">
                    R∞ U R:
                </p>
                {renderSet(step.workingSet)}
            </div>

            {/* Sub-knowledge bases tested at the current subset size */}
            {step.subKBs && step.subKBs.length > 0 && (
                <div className="mb-4">
                    <p className="text-sm font-medium text-foreground mb-2">
                        Sub-knowledge bases at m = {step.subsetSize}:
                    </p>
                    {renderChecks(step.subKBs, 'Refutes antecedent?')}
                </div>
            )}

            {/* The combined formula the rank was replaced by */}
            {step.combinedFormula && (
                <div className="mb-4">
                    <p className="text-sm font-medium text-foreground mb-2">
                        R{step.rankNumber},{step.subsetSize}:
                    </p>
                    <div className="bg-accent border border-border rounded-lg p-3 font-mono text-sm text-green-700">
                        {step.combinedFormula}
                    </div>
                </div>
            )}

            {/* The final check, one row per surviving sub-knowledge base */}
            {step.isFinalStep && step.finalChecks && step.finalChecks.length > 0 && (
                <div className="mb-4">
                    <p className="text-sm font-medium text-foreground mb-2">
                        Final check:
                    </p>
                    {renderChecks(step.finalChecks, 'Entails query?')}
                </div>
            )}

            {/* Result */}
            {step.isFinalStep && (
                <div className={`border rounded-lg p-4 ${step.entailed ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                    <p className={`text-sm font-semibold ${step.entailed ? 'text-green-700' : 'text-red-700'}`}>
                        {step.entailed ? 'The query IS entailed under Lexicographic Closure.' : 'The query is NOT entailed under Lexicographic Closure.'}
                    </p>

                    {/* Justification (proof) - only meaningful when the query is
                        entailed, since there's nothing to justify otherwise. Shown
                        the same way Basic and Minimal Relevant Closure show theirs. */}
                    {step.isResultStep && step.entailed && (
                        <div className="mt-3">
                            <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-green-800">
                                Justification
                            </p>

                            <p className="mb-2 text-xs text-green-700">
                                The smallest set of statements in the surviving R∞ ∪ R that entails the query on its own:
                            </p>

                            {step.weakJustification && step.weakJustification.length > 0 ? (
                                <div className="flex flex-wrap gap-2">
                                    {step.weakJustification.map((formula, i) => (
                                        <span key={i} className="font-mono text-sm text-green-900 bg-white border border-green-200 rounded px-2 py-1">
                                            {formula}
                                        </span>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-muted-foreground italic">
                                    No justification was returned for this entailment.
                                </p>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default LexicographicExplanationView;
