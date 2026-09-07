import React from 'react';
import { PersonIcon, BarChartIcon, MagnifyingGlassIcon, LightningBoltIcon } from '@radix-ui/react-icons';

const Step2_WhereMethodsDiffer: React.FC = () => {
    return (
        <div>
            <h1 className="text-2xl font-bold text-foreground mt-6 mb-1">
                Where do the entailment methods differ?
            </h1>
            <p className="text-muted-foreground text-sm mb-6">
                Each entailment method processes the ranking in a different way.
            </p>

            <div className="grid grid-cols-3 gap-4">

                {/* RC */}
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
                        Checks whether the query antecedent is exceptional. 
                        If yes, it removes the corresponding ranks.
                    </p>
                    
                    <p className="text-xs font-semibold text-primary">
                        Key idea: Exceptionality
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
                        Compares preferred alternatives using the ranking 
                        and keeps consistent information.
                    </p>

                    <p className="text-xs font-semibold text-indigo-700">
                        Key idea: Preference
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
                        Identifies and keeps only the information that is 
                        relevant to the query antecedent.
                    </p>
                    
                    <p className="text-xs font-semibold text-sky-700">
                        Key idea: Relevance
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
                    All three methods use the same Base Rank but differ 
                    in how they decide which information to keep when 
                    answering the query.
                </p>
            </div>
        </div>
    );
};

export default Step2_WhereMethodsDiffer;