import React from 'react';
import { EntailmentDTO, LexicographicEntailmentDTO, RankDTO } from '../../../../api/api';

interface Step4Props {
    baseRanking: RankDTO[];
    rcResult: EntailmentDTO | null;
    lcResult: LexicographicEntailmentDTO | null;
    relcResult: EntailmentDTO | null;
}

const Step4_FinalKB: React.FC<Step4Props> = ({ baseRanking, rcResult, lcResult, relcResult }) => {

    const getRemovedRanks = (result: EntailmentDTO | null): string[] => {
        if (!result) return [];
        return result.removedRanking?.flatMap((r: RankDTO) => r.knowledgeBase) || [];
    };

    const rcRemoved = getRemovedRanks(rcResult);
    const lcRemoved = getRemovedRanks(lcResult);
    const relcRemoved = getRemovedRanks(relcResult);

    // Lexicographic Closure doesn't remove an exceptional rank like the Rational Closure does - it weakens it into a single disjunction of its surviving subsets. That replacement formula lives in weakenedRanking, keyed by rank number.
    const lcWeakenedByRank = new Map<number, string>();
    (lcResult?.weakenedRanking || []).forEach((r) => {
        if (r.knowledgeBase.length > 0) {
            lcWeakenedByRank.set(r.rankNumber, r.knowledgeBase[0]);
        }
    }); 

    const algorithms = [
        { 
            name: 'Rational Closure', 
            removed: rcRemoved,
            weakenedByRank: undefined as Map<number, string> | undefined,   
            borderClass: 'border-green-300',
            headingClass: 'text-green-700',
            rankLabelClass: 'text-green-600',
        },
        { 
            name: 'Lexicographic Closure',
            removed: lcRemoved,
            weakenedByRank: lcWeakenedByRank,
            borderClass: 'border-orange-300',
            headingClass: 'text-orange-700',
            rankLabelClass: 'text-orange-600',
        },
        { 
            name: 'Relevant Closure',
            removed: relcRemoved,
            weakenedByRank: undefined as Map<number, string> | undefined,
            borderClass: 'border-purple-300',
            headingClass: 'text-purple-700',
            rankLabelClass: 'text-purple-600',
        },
    ];

    return (
        <div>
            <h2 className="text-xl font-bold text-foreground mb-1">
                Final Knowledge Base
            </h2>
            <p className="text-muted-foreground text-sm mb-6">
                After processing the ranking, each method retains different information.
            </p>

            {/* Legend */}
            <div className="flex gap-4 mb-4 text-xs">
                <span className="flex items-center gap-1">
                    <span className="text-green-600">✓</span> Retained
                </span>
                <span className="flex items-center gap-1">
                    <span className="text-red-600">✗</span> Removed
                </span>
            </div>

            <div className="grid grid-cols-3 gap-4">
                {algorithms.map((algo) => (
                    <div key={algo.name} className={`bg-white border-2 border-${algo.color}-300 rounded-xl p-4`}>
                        <h3 className={`font-bold text-${algo.color}-700 text-sm mb-3 text-center`}>
                            {algo.name}
                        </h3>

                        {baseRanking.map((rank) => (
                            <div key={rank.rankNumber} className="mb-3">
                                <p className={`text-xs font-semibold text-${algo.color}-600 mb-1`}>
                                    Rank {rank.rankName}
                                </p>
                                {rank.knowledgeBase.map((formula, i) => {
                                    const isRemoved = algo.removed.includes(formula);
                                    return (
                                        <div key={i} className="flex items-center gap-2 text-xs font-mono">
                                            <span className={isRemoved ? 'text-red-500' : 'text-green-600'}>
                                                {isRemoved ? '✗' : '✓'}
                                            </span>
                                            <span className={isRemoved ? 'line-through text-gray-400' : 'text-foreground'}>
                                                {formula}
                                            </span>
                                            {isRemoved && (
                                                <span className="text-red-400">Removed</span>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        ))}
                    </div>
                ))}
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mt-4">
                <p className="text-sm text-blue-700">
                    💡 Same initial ranking → different final knowledge bases.
                </p>
            </div>
        </div>
    );
};

export default Step4_FinalKB;