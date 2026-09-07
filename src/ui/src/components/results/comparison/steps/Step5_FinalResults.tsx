import React from 'react';
import { EntailmentDTO } from '../../../../api/api';

interface Step5Props {
    query: string;
    rcResult: EntailmentDTO | null;
    lcResult: EntailmentDTO | null;
    relcResult: EntailmentDTO | null;
}

const Step5_FinalResults: React.FC<Step5Props> = ({ query, rcResult, lcResult, relcResult }) => {

    const algorithms = [
        { name: 'Rational Closure', color: 'green', result: rcResult },
        { name: 'Lexicographic Closure', color: 'orange', result: lcResult },
        { name: 'Relevant Closure', color: 'purple', result: relcResult },
    ];

    return (
        <div>
            <h2 className="text-xl font-bold text-foreground mb-1">
                Final Results
            </h2>
            <p className="text-muted-foreground text-sm mb-6">
                Each method now tests the query against its final knowledge base.
            </p>

            {/* Query */}
            <div className="bg-white border border-border rounded-xl p-3 mb-6 text-center">
                <span className="text-xs text-muted-foreground mr-2">Query</span>
                <span className="font-mono font-medium">{query}</span>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-6">
                {algorithms.map((algo) => (
                    <div key={algo.name} className={`bg-white border-2 border-${algo.color}-300 rounded-xl p-6 text-center`}>
                        <h3 className={`font-bold text-${algo.color}-700 mb-4`}>
                            {algo.name}
                        </h3>

                        {algo.result ? (
                            <>
                                <div className={`text-4xl mb-3`}>
                                    {algo.result.entailed ? '✅' : '❌'}
                                </div>
                                <p className={`font-bold text-lg ${algo.result.entailed ? 'text-green-600' : 'text-red-600'}`}>
                                    {algo.result.entailed ? 'ENTAILED' : 'NOT ENTAILED'}
                                </p>
                                <p className="text-xs text-muted-foreground mt-2">
                                    {algo.result.entailed
                                        ? 'The final KB supports the query.'
                                        : 'The final KB does NOT support the query.'
                                    }
                                </p>
                            </>
                        ) : (
                            <p className="text-muted-foreground text-sm">Loading...</p>
                        )}
                    </div>
                ))}
            </div>

            {/* Insight */}
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-center">
                <p className="text-sm text-amber-700">
                    ⭐ The same query can be treated differently depending on the entailment method used.
                </p>
            </div>
        </div>
    );
};

export default Step5_FinalResults;