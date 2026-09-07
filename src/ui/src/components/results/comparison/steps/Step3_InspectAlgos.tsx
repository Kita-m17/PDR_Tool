import React from 'react';
import { BaseRankDTO, EntailmentDTO } from '../../../../api/api';
import { Button } from '../../../ui/Buttons';
import { ArrowRightIcon} from '@radix-ui/react-icons';

interface Step3Props {
    baseRank: BaseRankDTO;
    query: string;
    rcResult: EntailmentDTO | null;
    lcResult: EntailmentDTO | null;
    relcResult: EntailmentDTO | null;
    onInspectRC: () => void;
    onInspectLC: () => void;
    onInspectRelC: () => void;
}

const Step3_InspectAlgos: React.FC<Step3Props> = ({baseRank, query, rcResult, lcResult, relcResult,onInspectRC, onInspectLC, onInspectRelC}) => {

    const algorithms = [
        { 
            name: 'Rational Closure', 
            subtitle: 'Exceptionality',
            borderClass: 'border-blue-300',
            textClass: 'text-blue-700',
            subtitleClass: 'text-blue-600',
            description: 'Removes entire ranks when the query antecedent is exceptional. May remove unrelated statements - leading to the drowning problem.',
            onInspect: onInspectRC
        },

        { 
            name: 'Lexicographic Closure', 
            subtitle: 'Preference',
            borderClass: 'border-indigo-300',
            textClass: 'text-indigo-700',
            subtitleClass: 'text-indigo-600',
            description: 'Weakens exceptional ranks instead of removing them entirely - keeping as many statements as possible by forming disjunctions of surviving subsets.',
            onInspect: onInspectLC
        },

        { 
            name: 'Relevant Closure', 
            subtitle: 'Relevance',
            borderClass: 'border-sky-300',
            textClass: 'text-sky-700',
            subtitleClass: 'text-sky-600',
            description: 'Identifies only the relevant partition of the knowledge base and applies a modified closure over those relevant statements only, ignoring irrelevant ones entirely.',
            onInspect: onInspectRelC
        },
    ];

    return (
        <div>
            <h1 className="text-2xl font-bold text-foreground mt-6 mb-1">
                Inspect Each Algorithm
            </h1>

            <p className="text-muted-foreground text-md mb-6">
                Explore how each method processes the ranking.
            </p>

            {/* Insight box */}
            <div className="border-l-4 border-blue-400 bg-white pl-4 py-4 mt-4 mb-6">
                <p className="text-md text-foreground">
                    <strong className="text-blue-700">
                        Key idea:
                    </strong> 
                    
                    <p className="text-md text-foreground">
                        Each algorithm processes the same Base Rank differently. Click <strong>Inspect</strong> on any algorithm to step through its execution and observe exactly how it handles the ranked knowledge base to answer your query. You can inspect them in any order and return here to continue.
                    </p>
                </p>
            </div>

            {/* Algorithm cards */}
            <div className="grid grid-cols-3 gap-4">

                {algorithms.map((algo) => (

                    <div key={algo.name} className={`bg-white border-2 ${algo.borderClass} rounded-xl p-6 text-center`}>
                        <h3 className={`font-bold ${algo.textClass} mb-3`}>
                            {algo.name}
                        </h3>

                        <p className={`text-sm font-semibold ${algo.subtitleClass} mb-4`}>
                            ({algo.subtitle})
                        </p>

                        <p className="text-md text-foreground mb-6">
                            {algo.description}
                        </p>
                        
                        <Button onClick={algo.onInspect}>
                            Inspect
                            <ArrowRightIcon className="ml-2 h-4 w-4" />
                        </Button>
                        
                    </div>
                ))}
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mt-4">
                <p className="text-md text-blue-700">
                    💡 Tip: You can inspect any method in any order. Come back here to continue.
                </p>
            </div>
        </div>
    );
};

export default Step3_InspectAlgos;