/*
 * File: RankingVisualiser.tsx
 * Author: Nikita Martin (2026 Honours Project, University of Cape Town)
 * Status: Original work.
 * Context: ranking view - shows actual ranking and how ranks are removed as the algo executes
 * Purpose: Educational use only.
 */
import React from 'react';
import { RankState } from './rcSteps';
import { ArrowLeftIcon } from '@radix-ui/react-icons';

//ranking state
interface RankingVisualiserProps {
    rankingState: RankState[];
}

//actual rank
const RankingVisualiser: React.FC<RankingVisualiserProps> = ({ rankingState }) => {
    return (
        <div>
            <h3 className="text-primary font-semibold mb-1 flex items-center gap-2">
                Ranking
            </h3>

            <p className="text-sm text-muted-foreground mb-3">
                Ranks are ordered from least to most exceptional.
            </p>

            {/* Table showing the rank*/}
            <div className="max-h-32 overflow-y-auto">
                <table className="w-full border-collapse">
                    <tbody>
                        {rankingState.map((rank) => (
                            <tr key={rank.rankNumber} className={`border-b border-border ${rank.isBeingRemoved ? 'bg-amber-50' : ''}`}>
                                <td className={`py-3 px-4 font-semibold text-sm w-24 text-primary ${rank.isRemoved ? 'opacity-40' : ''}`}>
                                    Rank {rank.rankName}
                                </td>

                                <td className="py-3 px-4">
                                    <div className="flex flex-wrap gap-2">

                                        {/* grey out and strike through removed ranks */}
                                        {rank.formulas.map((formula, i) => (
                                            <span key={i} className={`font-mono text-sm ${ rank.isRemoved ? 'line-through text-gray-400' : rank.isBeingRemoved ? 'text-amber-600' : 'text-foreground'}`}>
                                                {formula}
                                            </span>
                                        ))}
                                    </div>
                                </td>

                                {/* show when ranks are being removed - highlight when they will be removed */}
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