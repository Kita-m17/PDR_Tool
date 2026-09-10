import React from 'react';
import { PersonIcon, BarChartIcon, MagnifyingGlassIcon, LightningBoltIcon } from '@radix-ui/react-icons';

const Step2_WhereMethodsDiffer: React.FC = () => {
    return (
        <div>
            <h1 className="text-2xl font-bold text-foreground mt-6 mb-1">
                Where do the entailment methods differ?
            </h1>
            <p className="text-muted-foreground text-md mb-6">
                Each entailment method processes the ranking in a different way.
            </p>

            {/* explanation boxes for each method */}
            <div className="grid grid-cols-3 gap-4">

                {/* RC - explanation box */}
                <div className="bg-white border-2 border-blue-300 rounded-xl p-6 text-center shadow-sm">
                    <h3 className="font-bold text-blue-700 mb-1">
                        Rational Closure
                    </h3>

                    <p className="text-xs text-muted-foreground mb-4">
                        (Exceptionality)
                    </p>

                    <div className="flex justify-center mb-4">
                        <PersonIcon className="h-8 w-8 text-blue-700" />
                    </div>

                    <p className="text-sm text-foreground mb-4">
                        If the query's antecedent is exceptional at some rank, Rational Closure removes that entire rank from consideration - every statement in it, whether or not it's actually related to the query.
                    </p>
                    
                    <p className="text-xs font-semibold text-primary">
                        Mechanism: removes the whole rank
                    </p>
                </div>

                {/* LC */}
                <div className="bg-white border-2 border-indigo-300 rounded-xl p-6 text-center shadow-sm">
                    <h3 className="font-bold text-indigo-700 mb-1">
                        Lexicographic Closure
                    </h3>

                    <p className="text-xs text-muted-foreground mb-4">
                        (Preference)
                    </p>

                    <div className="flex justify-center mb-4">
                        <BarChartIcon className="h-8 w-8 text-indigo-700" />
                    </div>

                    <p className="text-sm text-foreground mb-4">
                        Instead of deleting an entire exceptional rank outright, Lexicographic Closure looks for the largest subset of that rank that can stay, and combines the possibilities into a single weaker statement that goes back into the ranking in place of the original.
                    </p>

                    <p className="text-xs font-semibold text-indigo-700">
                        Mechanism: weakens the rank
                    </p>
                </div>

                {/* RelC */}
                <div className="bg-white border-2 border-sky-300 rounded-xl p-6 text-center shadow-sm">
                    <h3 className="font-bold text-sky-700 mb-1">
                        Relevant Closure
                    </h3>

                    <p className="text-xs text-muted-foreground mb-4">
                        (Relevance)
                    </p>

                    <div className="flex justify-center mb-4">
                        <MagnifyingGlassIcon className="h-8 w-8 text-sky-700" />
                    </div>

                    <p className="text-sm text-foreground mb-4">
                        Relevant Closure first works out which statements are even relevant to the query, then only ever reasons over that relevant partition - anything irrelevant is set aside completely and can't be affected.
                    </p>
                    
                    <p className="text-xs font-semibold text-sky-700">
                        Mechanism: filters to relevant ranks only
                    </p>
                </div>

            </div>

            {/* Insight box */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mt-6">
                <div className="flex items-center mb-2">
                    <LightningBoltIcon className="h-5 w-5 text-blue-700 mr-2" />
                    <span className="text-sm font-semibold text-blue-700">
                        Insight
                    </span>
                </div>

                <p className="text-sm text-blue-700">
                    All three start from the same Base Rank (Step 1). Where they diverge is what happens once a rank is found to be exceptional for the query. Rational Closure discards the whole rank - sometimes taking unrelated statements down with it, which is known as the{' '} <strong>drowning problem</strong>. Lexicographic Closure improves this by keeping a weaker version of the rank instead of deleting it outright. Relevant Closure sidesteps the issue entirely by only ever looking at the part of the knowledge base that's actually relevant to the query.
                </p>
            </div>
        </div>
    );
};

export default Step2_WhereMethodsDiffer;