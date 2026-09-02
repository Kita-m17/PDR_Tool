import React, {useState} from 'react';
import { DebuggerStep } from './rational/rcSteps';
import { InfoCircledIcon, ChevronDownIcon, ChevronUpIcon } from '@radix-ui/react-icons';
import {Button} from '../ui/Buttons'

interface ExplanationViewProps {
    step: DebuggerStep;
}

const ExplanationView: React.FC<ExplanationViewProps> = ({ step }) => {
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

    const isWhileStep = step.highlightedLines.includes(5) && !step.isInitialStep;

    return(
        <div> 
            <h3 className="text-primary font-semibold mb-4 flex items-center gap-2">
                Explanation
            </h3>

            <p className="text-sm text-foreground leading-relaxed whitespace-pre-line mb-4">
                {step.explanation}
            </p>

            {/* shpw details button - only on while condition steps */}
            {isWhileStep && (
                <Button onClick={() => setShowDetails(!showDetails)} className="flex items-center gap-2 text-xs border border-gray-300 text-gray-500 rounded-lg px-3 py-1.5 hover:border-primary hover:text-primary transition-colors mt-2 mb-4">
                    <InfoCircledIcon className="h-3 w-3" />
                    {showDetails ? 'Hide details' : 'Show details'}
                    {showDetails ? <ChevronUpIcon className="h-3 w-3" /> : <ChevronDownIcon className="h-3 w-3" />}
                </Button>
            )}

            {/* details panel */}
            {isWhileStep && showDetails &&(
                <div className="mb-4 border border-border rounded-lg p-4 bg-accent">
                    <p className="text-xs font-medium text-foreground mb-2">
                        Relevant formulas checked:
                    </p>

                    <div className="font-mono text-xs text-foreground bg-white border border-border rounded p-2 mb-3">
                        {'{ ' + (relevantFormulas.length > 0 ? relevantFormulas.join(', ') : step.workingSet.join(', ')) + ' }'}
                    </div>

                    <p className="text-xs text-muted-foreground">
                        {step.highlightedLines.includes(3) && !step.isFinalStep ? step.workingSet.some(f => f.includes(step.queryAntecedent || ''))
                                ? `These formulas together determine whether '${step.queryAntecedent}' leads to a contradiction when assumed true.`
                                : `The full working set is checked classically to determine if '${step.queryAntecedent}' leads to a contradiction.`
                                : ''
                        }
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
                        Note: ~| (defeasible) becomes =&gt; (classical) for SAT checking
                    </p>
                </div>
            )}

            {/* show the working set */}
            {!step.isInitialStep && step.workingSet.length > 0 && (
                <div className="mb-4">
                    <p className="text-sm font-medium text-foreground mb-2">
                        Working set R:
                    </p>

                    <div className="bg-accent border border-border rounded-lg p-3 font-mono text-sm text-foreground">
                        {'{ ' + step.workingSet.join(', ') + ' }'}
                    </div>
                </div>
            )}

            {/* show rank infinity*/}
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

            {/* Drowning problem */}
            {step.isFinalStep && (
                <div className="mt-4 rounded-lg p-4 border bg-blue-50 border-blue-200">
                    <p className="font-semibold text-blue-700 mb-1">
                        Note: Limitation of the Rational Closure
                    </p>

                    <p className="text-xs text-blue-600">
                        Since the Rational Closure removes the entire rank, it may remove rules that are unrelated to the conflict. This is known as the "drowning problem". Lexicographic and Relevant Closure address this limitation.
                    </p>
                </div>
            )}
        </div>
    );
};

export default ExplanationView;