import React, {useState} from 'react';
import { DebuggerStep } from './BasicRelevantSteps';
import { InfoCircledIcon, ChevronDownIcon, ChevronUpIcon } from '@radix-ui/react-icons';
import {Button} from '../../ui/Buttons'
import { TexFormula } from '../../ui/TexFormula';

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

    const isWhileStep = step.highlightedLines.includes(3);

    return(
        <div>
            <h3 className="text-primary font-semibold mb-4 flex items-center gap-2">
                Explanation
            </h3>

            <p className="text-sm text-foreground leading-relaxed whitespace-pre-line mb-4">
                {step.explanation}
            </p>





            {/* show initial step */}
            {step.isInitialStep && step.workingSet && (
                <div className="mb-4">
                    <p className="text-sm font-medium text-foreground mb-2">
                        R':
                    </p>

                    <div className="bg-accent border border-border rounded-lg p-3 font-mono text-sm text-foreground">
                        {'{ ' + step.workingSet.join(', ') + ' }'}
                    </div>
                    

                </div>
            )}

            {/* show the working set */}
            {step.isWhileLoopIntersection && !step.isInitialStep && step.workingSet.length > 0 && (
                <div className="mb-4">
                <p className="text-sm font-medium text-foreground mb-2">
                                        <TexFormula>{"\\{\\mathcal{R}'\\text{(before)}\\}:"}</TexFormula>
                                    </p>

                                    <div className="bg-accent border border-border rounded-lg p-3 font-mono text-sm text-foreground">
                                        {'{ ' + step.workingSet.join(', ') +","+step.removed.join(', ')+ ' }'}
                                    </div>

                              <p className="text-sm font-medium text-foreground mb-2">
                                                   <TexFormula>{"\\{\\mathcal{R}_i \\cap \\mathcal{R}'\\}:"}</TexFormula>
                                                  </p>

                                                  <div className="bg-accent border border-border rounded-lg p-3 font-mono text-sm text-foreground">
                                                      {'{ ' + step.removed + ' }'}
                                                  </div>
                    <p className="text-sm font-medium text-foreground mb-2">
                                                                <TexFormula>{"\\{\\mathcal{R}'\\text{(after)}\\}:"}</TexFormula>

                    </p>

                    <div className="bg-accent border border-border rounded-lg p-3 font-mono text-sm text-foreground">
                        {'{ ' + step.workingSet.join(', ') + ' }'}
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


        </div>
    );
};

export default ExplanationView;