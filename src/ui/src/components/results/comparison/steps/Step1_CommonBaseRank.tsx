import React from 'react';
import { RankDTO } from '../../../../api/api';
import { RankState } from '../../rational/rcSteps';
import RankingVisualiser from '../../rational/RankingVisualiser';
import { Button } from '../../../ui/Buttons';
import { ArrowRightIcon } from "@radix-ui/react-icons";

interface Step1Props {
    baseRanking: RankDTO[];
    query: string;
    onInspect: () => void;
}

const Step1_CommonBaseRank: React.FC<Step1Props> = ({ baseRanking, query, onInspect }) => {

    const rankingState: RankState[] = baseRanking.map((rank) => ({
        rankName: rank.rankName,
        rankNumber: rank.rankNumber,
        formulas: rank.knowledgeBase,
        isRemoved: false,
        isBeingRemoved: false,
    }));

    const branches = [
        { name: 'Rational Closure', tag: 'removes exceptional ranks' },
        { name: 'Lexicographic Closure', tag: 'weakens exceptional ranks' },
        { name: 'Relevant Closure', tag: 'filters to relevant ranks only' },
    ];

    return (
        <div>
        
            <h1 className="text-2xl font-bold mb-1 mt-6">
                Common Starting Point - Base Rank
            </h1>

            {/* Explanation box */}
            <div className="rounded-xl mb-6">
                <p className="text-md text-muted-foreground">
                    Before the algorithms begin to differ, they all start with the same ranked knowledge base.
                </p>
            </div>

            {/* Ranking - full width, with heading + inspect button */}
            <div className="bg-white border border-border rounded-xl p-6 mb-8">
                <RankingVisualiser rankingState={rankingState} />
                {/* Inspect button */}
                <div className="flex justify-center">
                    <Button onClick={onInspect}>
                        Inspect BaseRank Step-Through
                        <ArrowRightIcon className="ml-2 h-4 w-4" />
                    </Button>
                </div>
            </div>

            {/* Branching diagram to the three methods */}
            <div className="flex flex-col items-center mb-8">
                <span className="text-sm font-medium text-primary mb-2">
                    Base Rank
                </span>

                <div className="w-px h-6 bg-border" />

                <div className="flex w-full max-w-xl justify-between relative">
                    <div className="absolute top-0 left-0 right-0 h-px bg-border" style={{ top: '0px' }} />
                    {branches.map(({ name, tag }) => (
                        <div key={name} className="flex flex-col items-center flex-1">
                            <div className="w-px h-6 bg-border" />
 
                            <div className="bg-white border border-border rounded-lg px-4 py-2 text-sm font-medium text-primary text-center">
                                {name}
                            </div>
 
                            <span className="text-xs text-muted-foreground mt-1 text-center max-w-[9rem]">
                                {tag}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
            
            {/* Insight box */}
            <div className="border-l-4 border-blue-400 bg-white pl-4 py-4 mb-6">
                <p className="text-sm text-foreground">
                    <strong className="text-blue-700">
                        Key idea:
                    </strong> All three methods begin with the same Base Rank. They differ in how they process the ranks when answering the query.
                </p>
            </div>

            {/* Inspect button
            <div className="flex justify-center">
                <Button onClick={onInspect}>
                    Inspect BaseRank Step-Through
                    <ArrowRightIcon className="ml-2 h-4 w-4" />
                </Button>
            </div> */}
        </div>
    );
};

export default Step1_CommonBaseRank;