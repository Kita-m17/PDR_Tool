import React from 'react';
import { LexRankState } from './LexicographicStep';
import { ArrowLeftIcon } from '@radix-ui/react-icons';

interface LexicographicRankingVisualiserProps {
    rankingState: LexRankState[];
}

const LexicographicRankingVisualiser: React.FC<LexicographicRankingVisualiserProps> = ({ rankingState }) => {
    return (
        <div>
            <h3 className="text-primary font-semibold mb-3 flex items-center gap-2">
                Ranking
            </h3>

            <p className="text-xs text-muted-foreground mb-3">
                Ranks are ordered from least to most exceptional. A weakened rank is replaced by a single combined formula.
            </p>

            <table className="w-full border-collapse">
                <tbody>
                    {rankingState.map((rank) => (
                        <tr key={rank.rankNumber} className={`border-b border-border ${rank.isBeingWeakened ? 'bg-amber-50' : ''}`}>
                            <td className={`py-3 px-4 font-semibold text-sm w-24 text-primary ${rank.isRemoved ? 'opacity-40' : ''}`}>
                                Rank {rank.rankName}
                            </td>

                            <td className="py-3 px-4">
                                <div className="flex flex-wrap gap-2">
                                    {rank.formulas.map((formula, i) => (
                                        <span key={i} className={`font-mono text-sm ${rank.isRemoved ? 'line-through text-gray-400' : rank.weakenedTo ? 'line-through text-gray-400' : rank.isBeingWeakened ? 'text-amber-600' : 'text-foreground'}`}>
                                            {formula}
                                        </span>
                                    ))}
                                </div>

                                {rank.weakenedTo && (
                                    <div className="mt-1 font-mono text-sm text-green-700">
                                        {rank.weakenedTo}
                                    </div>
                                )}
                            </td>

                            {rank.isBeingWeakened && (
                                <td className="py-3 px-4 text-xs text-amber-600">
                                    <span className="flex items-center gap-1">
                                        <ArrowLeftIcon className="h-3 w-3" />
                                        being weakened
                                    </span>
                                </td>
                            )}

                            {rank.weakenedTo && !rank.isBeingWeakened && (
                                <td className="py-3 px-4 text-xs text-green-700">
                                    weakened
                                </td>
                            )}

                            {rank.isRemoved && (
                                <td className="py-3 px-4 text-xs text-muted-foreground">
                                    dropped
                                </td>
                            )}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default LexicographicRankingVisualiser;
