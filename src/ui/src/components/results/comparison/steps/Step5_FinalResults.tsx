import React from 'react';
import { EntailmentDTO, LexicographicEntailmentDTO } from '../../../../api/api';

interface Step5Props {
    query: string;
    rcResult: EntailmentDTO | null;
    lcResult: LexicographicEntailmentDTO | null;
    relcResult: EntailmentDTO | null;
}

const Step5_FinalResults: React.FC<Step5Props> = ({ query, rcResult, lcResult, relcResult }) => {

    // How many ranks each method actually removed/weakened - drives the one-line "why" under each result, using data already returned by the backend (same removedRanking/weakenedRanking fields Step4 uses).
    const rcRemovedCount = rcResult?.removedRanking?.length ?? 0;
    const lcRemovedCount = lcResult?.removedRanking?.length ?? 0;
    const lcWeakenedCount = lcResult?.weakenedRanking?.length ?? 0;
    const relcRemovedCount = relcResult?.removedRanking?.length ?? 0;

    const rcWhy = rcRemovedCount > 0 ? `Removed ${rcRemovedCount} rank${rcRemovedCount === 1 ? '' : 's'} as exceptional.` : 'No ranks needed to be removed.';
 
    const lcWhy = lcRemovedCount > 0 && lcWeakenedCount > 0 ? `Removed ${lcRemovedCount} rank${lcRemovedCount === 1 ? '' : 's'} outright and weakened ${lcWeakenedCount} other${lcWeakenedCount === 1 ? '' : 's'}.` : lcWeakenedCount > 0
            ? `Weakened ${lcWeakenedCount} rank${lcWeakenedCount === 1 ? '' : 's'} instead of removing them.`
            : lcRemovedCount > 0
            ? `Removed ${lcRemovedCount} rank${lcRemovedCount === 1 ? '' : 's'} outright.`
            : 'No ranks needed adjusting.';
 
    const relcWhy = relcRemovedCount > 0 ? `Excluded ${relcRemovedCount} rank${relcRemovedCount === 1 ? '' : 's'} from the relevant partition.` : 'Every relevant statement was kept.';

    const algorithms = [
        {
            name: 'Rational Closure',
            result: rcResult,
            why: rcWhy,
            borderClass: 'border-blue-300',
            headingClass: 'text-blue-700',
        },
        {
            name: 'Lexicographic Closure',
            result: lcResult,
            why: lcWhy,
            borderClass: 'border-indigo-300',
            headingClass: 'text-indigo-700',
        },
        {
            name: 'Relevant Closure',
            result: relcResult,
            why: relcWhy,
            borderClass: 'border-sky-300',
            headingClass: 'text-sky-700',
        },
    ];

    const results = [rcResult, lcResult, relcResult];
    const allEntailed = results.every((r) => r?.entailed === true);
    const allNotEntailed = results.every((r) => r?.entailed === false);
    const allAgree = allEntailed || allNotEntailed;

    return (
        <div>
            <h2 className="text-xl font-bold text-foreground mb-1">
                Final Results
            </h2>
            <p className="text-muted-foreground text-md mb-6">
                Each method now tests the query against its final knowledge base.
            </p>

            {/* Query */}
            <div className="bg-white border border-border rounded-xl p-3 mb-6 text-center">
                <span className="text-sm text-muted-foreground mr-2">Query</span>
                <span className="font-mono font-medium">{query}</span>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-6">
                {algorithms.map((algo) => (
                    <div key={algo.name} className={`bg-white border-2 ${algo.borderClass} rounded-xl p-6 text-center`}>
                        <h3 className={`font-bold ${algo.headingClass} mb-4`}>
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
                                    {algo.result.entailed ? 'The final KB supports the query.' : 'The final KB does NOT support the query.'}

                                    <p className="text-xs text-muted-foreground mt-3 border-t border-border pt-2">
                                        {algo.why}
                                    </p>
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
                    {allAgree
                        ? "All three methods agree on this query - even though they processed the ranking differently (Step 4), those differences weren't enough to change the final answer this time."
                        : 'The methods disagree here. Differences in how each one processed the ranking (Step 4) were enough to change whether the query is entailed.'}
                </p>
            </div>
        </div>
    );
};

export default Step5_FinalResults;