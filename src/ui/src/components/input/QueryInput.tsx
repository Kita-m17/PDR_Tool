import React, { useState } from "react";
import { Button } from "../ui/Buttons";

interface QueryInputProps {
    onSubmit: (query: string) => void;
}

const QueryInput: React.FC<QueryInputProps> = ({ onSubmit }) => {
    const [antecedent, setAntecedent] = useState('penguin');
    const [consequent, setConsequent] = useState('flies');
    const [relation, setRelation] = useState('~|'); // Default relation
    const [negate, setNegate] = useState(true);

    const preview = antecedent && consequent ? `${antecedent} ${relation} ${negate ? '!':''}${consequent}` : '';
    const handleSubmit = () =>{
        if (preview) onSubmit(preview);
    };

    React.useEffect(() => {
        if (antecedent && consequent) {
            const query = `${antecedent}${relation}${negate ? '!' : ''}${consequent}`;
            onSubmit(query);
        }
    }, [antecedent, relation, consequent, negate, onSubmit]);

    return(
        <div className = "mb-8">
            <h2 className = "text-xl font-bold text-foreground mb-1">
                2. Query
                <span className = "ml-2 text-blue-700 cursor-pointer">ⓘ</span>
            </h2>
            <p className="text-muted-foreground text-sm mb-4">
                Specify the query you want to test against the knowledge base.
            </p>

            {/* Input row */}
            <div className="mt-4 flex items-center gap-4">
                {/* Antecedent */}
                <div className="flex flex-col gap-1 flex-1">
                    <label className="text-sm text-gray-600"> 
                        Antecedent
                    </label>

                    <input
                        type="text"
                        className="border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-pdr-blue"
                        placeholder="e.g. penguin"
                        value={antecedent}
                        onChange={(e) => setAntecedent(e.target.value)}
                    />
                </div>

                {/* Relation */}
                <div className="flex flex-col gap-1">
                    <label className="text-sm text-gray-600">
                        Relation
                    </label>

                    <select
                        className="border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-pdr-blue"
                        value={relation}
                        onChange={(e) => setRelation(e.target.value)}
                    >
                        <option value="~|">~| (defeasible)</option>
                        <option value="=>">=&gt; (classical)</option>
                    </select>
                </div>

                {/* Consequent */}
                <div className="flex flex-col gap-1 flex-1">
                    <label className="text-sm text-gray-600">
                        Consequent
                    </label>
                    
                    <input
                        type="text"
                        className="border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-pdr-blue"
                        placeholder="e.g. flies"
                        value={consequent}
                        onChange={(e) => setConsequent(e.target.value)}
                    />
                </div>

                {/* Negate */}
                <div className="flex flex-col gap-1">
                    <label className="text-sm text-gray-600">
                        Negate consequent
                    </label>

                    <div className="flex items-center gap-2 py-2">
                        <input
                            type="checkbox"
                            className="w-4 h-4 accent-pdr-blue"
                            checked={negate}
                            onChange={(e) => setNegate(e.target.checked)}
                        />
                    </div>
                </div>

            </div>

            {/* Preview */}
            {preview && (
                <p className="mt-5 text-s text-gray-600">
                    <span className="font-medium pr-2">
                        Preview:  
                    </span>

                    <span className="text-blue-600 font-mono">
                        {preview}
                    </span>
                </p>
            )}

        </div>
    );
};

export default QueryInput;