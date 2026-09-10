import React from 'react';
import { EntailmentDTO, LexicographicEntailmentDTO, RankDTO } from '../../../../api/api';
import {ArrowRightIcon} from '@radix-ui/react-icons';

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
            borderClass: 'border-blue-300',
            headingClass: 'text-blue-700',
            rankLabelClass: 'text-blue-600',
        },
        { 
            name: 'Lexicographic Closure',
            removed: lcRemoved,
            weakenedByRank: lcWeakenedByRank,
            borderClass: 'border-indigo-300',
            textClass: 'text-indigo-700',
            headingClass: 'text-indigo-700',
            rankLabelClass: 'text-indigo-600',
        },
        { 
            name: 'Relevant Closure',
            removed: relcRemoved,
            weakenedByRank: undefined as Map<number, string> | undefined,
            borderClass: 'border-sky-300',
            headingClass: 'text-sky-700',
            rankLabelClass: 'text-sky-600',
        },
    ];

    return (
        <div>
            <h2 className="text-xl font-bold text-foreground mb-1">
                Final Knowledge Base
            </h2>
            <p className="text-muted-foreground text-md mb-6">
                After processing the ranking, each method retains different information - and not always in the same way.
            </p>

            {/* Legend */}
            <div className="flex gap-4 mb-4 text-xs">
                <span className="flex items-center gap-1">
                    <span className="text-green-600">✓</span> Retained
                </span>

                <span className="flex items-center gap-1">
                    <span className="text-amber-500">≈</span> Weakened (Lexicographic Closure only)
                </span>

                <span className="flex items-center gap-1">
                    <span className="text-red-600">✗</span> Removed
                </span>
            </div>

            {/* Final knowledge base visualisation */}
            <div className="grid grid-cols-3 gap-4">
                {algorithms.map((algo) => (
                    <div key={algo.name} className={`bg-white border-2 ${algo.borderClass} rounded-xl p-4`}>
                        <h3 className={`font-bold ${algo.headingClass} text-sm mb-3 text-center`}>
                            {algo.name}
                        </h3>

                        {baseRanking.map((rank) => {
                            const weakenedFormula = algo.weakenedByRank?.get(rank.rankNumber);

                            return (
                                <div key={rank.rankNumber} className="mb-3">
                                    <p className={`text-xs font-semibold ${algo.rankLabelClass} mb-1`}>
                                        Rank {rank.rankName}
                                    </p>

                                    {rank.knowledgeBase.map((formula, i) => {
                                        const isRemoved = algo.removed.includes(formula);
                                        const isWeakened = algo.weakenedByRank?.get(rank.rankNumber) === formula;
                                    
                                        {/* If the formula is weakened, we want to show it as removed (with a strikethrough) and then show the replacement formula below it. */}
                                        return (
                                            <div key={i} className="flex items-center gap-2 text-xs font-mono">

                                                <span className={isRemoved ? 'text-red-500' : isWeakened ? 'text-amber-500' : 'text-green-600'}>
                                                    {isRemoved ? '✗' : isWeakened ? '≈' : '✓'}
                                                </span>

                                                <span className={(isRemoved || isWeakened) ? 'line-through text-gray-400' : 'text-foreground'}>
                                                    {formula}
                                                </span>

                                                {isRemoved && (
                                                    <span className="text-red-400">Removed</span>
                                                )}

                                                {isWeakened && (
                                                    <span className="text-amber-500">Weakened</span>
                                                )}
                                            </div>
                                        );
                                    })}

                                    {weakenedFormula !== undefined && (
                                        <div className="mt-1 pl-5 text-xs font-mono text-amber-600">
                                            <ArrowRightIcon className="ml-2 h-4 w-4" /> replaced by: {weakenedFormula}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                ))}
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mt-4">
                <p className="text-sm text-blue-700">
                    💡 Same initial ranking, different final knowledge bases. Rational Closure removes whole exceptional ranks outright, Lexicographic Closure weakens them into a disjunction instead of dropping them, and Relevant Closure only ever touches formulas inside the relevant partition.
                </p>
            </div>
        </div>
    );
};

export default Step4_FinalKB;