import React from 'react';
import { RankDTO } from '../../../../api/api';
import {RankState } from '../../rational/rcSteps';
import RankingVisualiser from '../../rational/RankingVisualiser';
import {Button} from "@/components/ui/Buttons";
import {ArrowRightIcon} from "@radix-ui/react-icons";

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

    return( 
        <div>
            <h1 className="text-2xl font-bold mb-4">Common Base Rank</h1>
            <p className="text-muted-foreground mb-6">
                All three entailment methods start with the same ranked knowledge base. 
            </p>

            {/* Ranking - full width */}
            <div className="bg-white border border-border rounded-xl p-6 mb-4">
                <RankingVisualiser rankingState={rankingState} />
            </div>

            {/* Insight box */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
                <p className="text-sm text-blue-700">
                    <strong>Starting point</strong> - The three methods begin with the same Base Rank. They differ in how they process this ranking to answer the query.
                </p>
            </div>

            {/* Inspect button */}
            <div className="flex justify-center">
                <Button onClick={onInspect}>
                    Inspect BaseRank Step-Through
                    <ArrowRightIcon className="ml-2 h-4 w-4" />
                </Button>
            </div>
        </div>
    );
};

export default Step1_CommonBaseRank;