import React from 'react';
import { LexDebuggerStep } from './LexicographicStep';
import { SubKnowledgeBaseCheckDTO } from '../../../api/api';
import { CheckCircledIcon, CrossCircledIcon } from '@radix-ui/react-icons';

interface LexicographicExplanationViewProps {
    step: LexDebuggerStep;
}

const LexicographicExplanationView: React.FC<LexicographicExplanationViewProps> = ({ step }) => {

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
                </div>
            )}
        </div>
    );
};

export default LexicographicExplanationView;
