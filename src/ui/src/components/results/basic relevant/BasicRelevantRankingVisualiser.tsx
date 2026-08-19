import React from 'react';
import { RankState } from './BasicRelevantSteps';
import { ArrowLeftIcon } from '@radix-ui/react-icons';

interface RankingVisualiserProps {
    rankingState: RankState[];
    currentRankIndex: number;
    currentRPrime: string[];
}

const RankingVisualiser: React.FC<RankingVisualiserProps> = ({ rankingState, currentRankIndex, currentRPrime }) => {
    return (
        <div>
            <div className="flex items-center justify-between mb-3">
                <h3 className="text-primary font-semibold flex items-center gap-2">
                    Ranking
                </h3>

                <span className={` inline-block rounded-md border px-2 py-0.5 text-xs font-semibold ${
                    currentRankIndex >= 0
                        ? 'border-sky-300 bg-sky-50 text-sky-900'
                        : 'border-border bg-gray-50 text-muted-foreground'
                }`}>
                    {currentRankIndex >= 0 ? `i = ${currentRankIndex}` : 'i = —'}
                </span>
            </div>



            {/* Live R' - shrinks as relevant statements are removed */}
            <div className="mb-4 rounded-lg border border-border bg-muted/40 p-3">
                <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    R'
                </p>
                <div className="flex flex-wrap gap-2">
                    {currentRPrime.length === 0 ? (
                        <span className="text-sm text-muted-foreground">∅</span>
                    ) : (
                        currentRPrime.map((formula, i) => (
                            <span key={i} className="font-mono text-sm text-foreground">
                                {formula}
                            </span>
                        ))
                    )}
                </div>
            </div>

            <table className="w-full border-collapse">
                <tbody>
                    {rankingState.map((rank) => {
                        const anyBeingRemoved = rank.statements.some(s => s.isBeingRemoved);
                        return (
                            <tr key={rank.rankNumber} className={`border-b border-border ${rank.isCurrent ? 'bg-amber-50' : ''}`}>
                                <td className="py-3 px-4 font-semibold text-sm w-24 text-primary">
                                    Rank {rank.rankName}
                                </td>

                                <td className="py-3 px-4">
                                    <div className="flex flex-wrap gap-2">
                                        {rank.statements.map((statement, i) => (
                                            <span
                                                key={i}
                                                className={`font-mono text-sm ${
                                                    statement.isRemoved
                                                        ? 'line-through text-gray-400'
                                                        : statement.isBeingRemoved
                                                        ? 'text-amber-600 font-semibold'
                                                        : 'text-foreground'
                                                }`}
                                            >
                                                {statement.formula}
                                            </span>
                                        ))}
                                    </div>
                                </td>

                                {anyBeingRemoved && (
                                    <td className="py-3 px-4 text-xs text-amber-600">
                                        <span className="flex items-center gap-1">
                                            <ArrowLeftIcon className="h-3 w-3" />
                                            being removed
                                        </span>
                                    </td>
                                )}
                            </tr>
                        );
                    })}
                </tbody>
            </table>

        </div>
    );
};

export default RankingVisualiser;
