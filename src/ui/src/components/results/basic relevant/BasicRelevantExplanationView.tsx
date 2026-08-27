import React, {useState} from 'react';
import { DebuggerStep, RankState } from './BasicRelevantSteps';
import { InfoCircledIcon, ChevronDownIcon, ChevronUpIcon, ArrowLeftIcon } from '@radix-ui/react-icons';
import {Button} from '../../ui/Buttons'
import { TexFormula } from '../../ui/TexFormula';

interface ExplanationViewProps {
    step: DebuggerStep;
    relevantPartition: string[];
    irrelevantPartition: string[];
}

const ExplanationView: React.FC<ExplanationViewProps> = ({ step, relevantPartition, irrelevantPartition }) => {
    const [showDetails, setShowDetails] = useState(false);

    //reset showDetails when the step changes
    React.useEffect(() =>{
        setShowDetails(false);
    }, [step.stepNumber]);

    // filter working set to show the relevant formulas
    const relevantFormulas = step.workingSet.filter(f => {
        const withoutBrackets = f.replace(/[()]/g, '');
        const parts = withoutBrackets.split('=>');
        const antecedent = parts[0].trim();
        const consequent = parts[1]?.replace('!', '').trim() || '';
        return antecedent === step.queryAntecedent || // directly about penguin
           consequent === step.queryConsequent ||   // about flies
           antecedent === step.queryConsequent;     // bird=>flies (bird connects to flies)

    });

    const isWhileStep = step.highlightedLines.includes(6);

    // Shared partition box, used both on the "while" check (line 6, both
    // partitions) and the removal step (line 7-8, relevant partition only).
    const renderPartitionBox = (items: string[], variant: 'relevant' | 'irrelevant') => {
        const isRelevant = variant === 'relevant';
        return (
            <div className={`rounded-lg border p-3 ${isRelevant ? 'border-sky-200 bg-sky-50' : 'border-border bg-gray-50'}`}>
                <p className={`mb-1 text-xs font-semibold uppercase tracking-wide ${isRelevant ? 'text-sky-900' : 'text-muted-foreground'}`}>
                    {isRelevant ? 'Relevant Partition' : 'Irrelevant Partition'}
                </p>
                <div className="flex flex-wrap gap-2">
                    {items.length === 0 ? (
                        <span className="text-sm text-muted-foreground">∅</span>
                    ) : (
                        items.map((formula, i) => (
                            <span key={i} className={`font-mono text-sm ${isRelevant ? 'text-sky-900' : 'text-foreground'}`}>
                                {formula}
                            </span>
                        ))
                    )}
                </div>
            </div>
        );
    };

    // The running knowledge base R'∪R-∪R∞ - R- and R∞ never change across
    // steps, only the R' passed in does. Used on the final "R'∪R-∪R∞"
    // recap step and, now, on the removal step (line 7-8) too, so the
    // knowledge base actually being reasoned over after a removal is
    // visible right where the removal happened, not just later.
    const renderRunningKnowledgeBase = (rPrime: string[]) => {
        const infiniteRank = step.rankingState.find(r => r.rankNumber === 2147483647)?.statements.map(s => s.formula) ?? [];
        const parts = [...irrelevantPartition, ...infiniteRank, ...rPrime];
        return (
            <>
                <p className="text-sm font-medium text-foreground m-4">
                    <TexFormula>{"\\mathcal{R}'\\cup\\mathcal{R}^-\\cup\\mathcal{R}_\\infty:"}</TexFormula>
                </p>
                <div className="bg-accent border border-border rounded-lg p-3 font-mono text-sm text-foreground">
                    {parts.length > 0 ?  parts.join(', ')  : '∅'}
                </div>
            </>
        );
    };

    // Shared per-rank ranking table, used both on the "while" check (line 6)
    // and the removal step (line 7-8).
    const renderRankingTable = (rankingState: RankState[]) => (
        <table className="w-full border-collapse">
            <tbody>
                {rankingState.map((rank) => {
                    const anyBeingRemoved = rank.statements.some(s => s.isBeingRemoved);
                    return (
                        <tr key={rank.rankNumber} className={`border-b border-border ${rank.isCurrent ? 'bg-amber-50' : ''}`}>
                            <td className="py-2 px-3 font-semibold text-sm w-20 text-primary">
                                Rank {rank.rankName}
                            </td>

                            <td className="py-2 px-3">
                                <div className="flex flex-wrap gap-2">
                                    {rank.statements.map((statement, i) => (
                                        <span
                                            key={i}
                                            className={`font-mono text-sm ${
                                                statement.isRemoved
                                                    ? 'line-through text-gray-400'
                                                    : statement.isBeingRemoved
                                                    ? 'text-amber-600 font-semibold'
                                                    : 'text-foreground'
                                            }`}
                                        >
                                            {statement.formula}
                                        </span>
                                    ))}
                                </div>
                            </td>

                            {anyBeingRemoved && (
                                <td className="py-2 px-3 text-xs text-amber-600">
                                    <span className="flex items-center gap-1">
                                        <ArrowLeftIcon className="h-3 w-3" />
                                        being removed
                                    </span>
                                </td>
                            )}
                        </tr>
                    );
                })}
            </tbody>
        </table>
    );

    return(
        <div>
            <h3 className="text-primary font-semibold mb-4 flex items-center gap-2">
                Explanation
            </h3>

            <p className="text-sm text-foreground leading-relaxed whitespace-pre-line mb-4">
                {step.explanation}
            </p>

            {/* Line 6 ("while" check) - show both partitions and the current
                ranking, since the exceptionality check is evaluated against
                all of it. Fires on every iteration's check, not just the
                first - both when the antecedent is still exceptional and
                when it finally isn't and the loop exits. */}
            {isWhileStep && (
                <div className="mb-4 space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                        {/* Was the static, full relevantPartition (R(K,alpha))
                            - never shrinks, so on the 2nd+ time this check
                            runs it still showed everything, including
                            formulas earlier iterations already removed.
                            step.currentRPrime is R' as of entering THIS
                            check - it's only updated once per iteration,
                            right after that iteration's removal step, so it
                            correctly reflects every prior removal. The
                            irrelevant partition (R-) is left as-is since it
                            never changes across iterations. */}
                        {renderPartitionBox(step.currentRPrime, 'relevant')}
                        {renderPartitionBox(irrelevantPartition, 'irrelevant')}
                    </div>

                    <div>
                        <p className="text-sm font-medium text-foreground mb-2">
                            Ranking:
                        </p>
                        {renderRankingTable(step.rankingState)}
                    </div>
                </div>
            )}

        {step.highlightedLines.includes(3) && (
            <div>
                    {renderRankingTable(step.rankingState)}

            </div>
            )
            }

            {/* show initial step */}
            {step.isInitialStep && step.workingSet && (
                <div className="mb-4">
                    <p className="text-sm font-medium text-foreground mb-2">
                        R':
                    </p>

                    <div className="bg-accent border border-border rounded-lg p-3 font-mono text-sm text-foreground">
                        { step.workingSet.join(', ') }
                    </div>


                </div>
            )}

            {/* show the working set - not gated on workingSet.length: an empty
                R' after removal is a legitimate, meaningful outcome (it's
                what happens on whichever iteration exhausts R', typically
                the last one), not a reason to hide the panel. */}
            {step.isWhileLoopIntersection && !step.isInitialStep && (
                <div className="mb-4">


                    <p className="text-sm font-medium text-foreground mb-2 mt-4">
                        Relevant Partition:
                    </p>

                    {/* Was the static, full relevantPartition (R(K,alpha)) -
                        never changes, so it looked frozen next to the
                        Ranking table and the R'(before)/R'(after) boxes
                        below, which do shrink each iteration. Rewired to
                        the current R' as of entering this step (before
                        this iteration's removal), reconstructed the same
                        way R'(before) is: workingSet is already
                        post-removal, so union it back with what got
                        removed this iteration. */}
                    {renderPartitionBox([...step.workingSet, ...step.removed], 'relevant')}

                    <p className="text-sm font-medium text-foreground mb-2 mt-4">
                        Ranking:
                    </p>

                    {renderRankingTable(step.rankingState)}

                    <p className="text-sm font-medium text-foreground m-4">
                                                            <TexFormula>{"\\\mathcal{R}'\\text{(before)}\:"}</TexFormula>
                                                        </p>

                                                        <div className="bg-accent border border-border rounded-lg p-3 font-mono text-sm text-foreground">
                                                            {[...step.workingSet, ...step.removed].length > 0 ? [...step.workingSet, ...step.removed].join(', ') : '∅'}
                                                        </div>

                                                  <p className="text-sm font-medium text-foreground m-4">
                                                                       <TexFormula>{"\\\mathcal{R}_i \\cap \\mathcal{R}'\(\\text{being removed}):"}</TexFormula>
                                                                      </p>

                                                                      <div className="bg-accent border border-border rounded-lg p-3 font-mono text-sm text-foreground">
                                                                          {step.removed.length > 0 ? step.removed.join(', ')  : '∅'}
                                                                      </div>
                                        <p className="text-sm font-medium text-foreground m-4">
                                                                                    <TexFormula>{"\\\mathcal{R}'\\text{(after)}\:"}</TexFormula>

                                        </p>

                                        <div className="bg-accent border border-border rounded-lg p-3 font-mono text-sm text-foreground">
                                            {step.workingSet.length > 0 ?  step.workingSet.join(', ')  : '∅'}
                                        </div>

                </div>
            )}

            {((!step.isWhileLoopIntersection && !step.isInitialStep && isWhileStep && !step.isResultStep)|| step.highlightedLines.includes(10)&& !step.isFinalStep) && (<div className="mb-4">




                                 {renderRunningKnowledgeBase(step.currentRPrime)}


                             </div>
                         )
                }

            {/* show the final step*/}
            {step.isFinalStep && (
                <div className={`mt-4 rounded-lg p-4 border ${step.entailed ? 'bg-green-50 border-green-200': 'bg-red-50 border-red-200'}`}>
                    <p className={`font-bold text-lg ${step.entailed ? 'text-green-700' : 'text-red-700'}`}>
                        {step.entailed ? '✓ ENTAILED' : '✗ NOT ENTAILED'}
                    </p>

                    {/* Weak justification (proof) - only meaningful when the
                        query is entailed, since there's nothing to justify
                        otherwise. Shown on the dedicated Result step for both
                        Basic and Minimal Relevant Closure. */}
                    {step.isResultStep && step.entailed && (
                        <div className="mt-3">
                            <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-green-800">
                                Weak Justification
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

export default ExplanationView;
