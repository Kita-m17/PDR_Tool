import React from 'react';
import { RankState } from './rcSteps';
import { ArrowLeftIcon } from '@radix-ui/react-icons';

interface RankingVisualiserProps {
    rankingState: RankState[];
}

const RankingVisualiser: React.FC<RankingVisualiserProps> = ({ rankingState }) => {
    return (
        <div>
            <h3 className="text-primary font-semibold mb-3 flex items-center gap-2">
                Ranking
            </h3>

            <p className="text-xs text-muted-foreground mb-3">
                Ranks are ordered from least to most exceptional.
            </p>

            <div className="max-h-48 overflow-y-auto">
                <table className="w-full border-collapse">
                    <tbody>
                        {rankingState.map((rank) => (
                            <tr key={rank.rankNumber} className={`border-b border-border ${rank.isBeingRemoved ? 'bg-amber-50' : ''}`}>
                                <td className={`py-3 px-4 font-semibold text-sm w-24 text-primary ${rank.isRemoved ? 'opacity-40' : ''}`}>
                                    Rank {rank.rankName}
                                </td>

                                <td className="py-3 px-4">
                                    <div className="flex flex-wrap gap-2">

                                        {rank.formulas.map((formula, i) => (
                                            <span key={i} className={`font-mono text-sm ${ rank.isRemoved ? 'line-through text-gray-400' : rank.isBeingRemoved ? 'text-amber-600' : 'text-foreground'}`}>
                                                {formula}
                                            </span>
                                        ))}
                                    </div>
                                </td>

                                {rank.isBeingRemoved && (
                                    <td className="py-3 px-4 text-xs text-amber-600">
                                        <span className="flex items-center gap-1">
                                            <ArrowLeftIcon className="h-3 w-3" />
                                            being removed
                                        </span>
                                    </td>
                                )}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default RankingVisualiser;