import React from 'react';
import { DebuggerStep } from './rcSteps';

interface ExplanationViewProps {
    step: DebuggerStep;
}

const ExplanationView: React.FC<ExplanationViewProps> = ({ step }) => {
    return(
        <div>
            <h3 className="text-primary font-semibold mb-4 flex items-center gap-2">
                Explanation
            </h3>

            <p className="text-sm text-foreground leading-relaxed whitespace-pre-line mb-4">
                {step.explanation}
            </p>

            {step.workingSet.length > 0 && (
                <div className="mb-4">
                    <p className="text-sm font-medium text-foreground mb-2">
                        Working set R:
                    </p>

                    <div className="bg-accent border border-border rounded-lg p-3 font-mono text-sm text-foreground">
                        {'{ ' + step.workingSet.join(', ') + ' }'}
                    </div>
                </div>
            )}

            {step.rInfinity.length > 0 && (
                <div className="mb-4">
                    <p className="text-sm font-medium text-foreground mb-2">
                        R∞:
                    </p>

                    <div className="bg-accent border border-border rounded-lg p-3 font-mono text-sm text-foreground">
                        {'{ ' + step.rInfinity.join(', ') + ' }'}
                    </div>
                </div>
            )}

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

        </div>
    );
};

export default ExplanationView;