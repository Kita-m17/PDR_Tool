import React from "react";

interface EntailmentQueryCardProps{
    selected: string[];
    onAlgorithmChange: (algorithms: string[]) => void;
}

const EntailmentQueryCard: React.FC<EntailmentQueryCardProps> = ({selected, onAlgorithmChange}) => {
    const algorithms = [
        {id: 'rational', label: 'Rational Closure'},
        {id: 'lexicographic', label: 'Lexicographic Closure'},
        {id: 'basic relevant', label: 'Basic Relevant Closure'},
        {id: 'minimal relevant', label: 'Minimal Relevant Closure'},
    ];

    const toggleAlgorithm = (id: string) => {
        if (selected.includes(id)) {
            onAlgorithmChange(selected.filter((a) => a !== id));
        } else {
            onAlgorithmChange([...selected, id]);
        }
    };

    return (
        <div className="mb-8">
            <h2 className = "text-primary font-semibold mb-3">
                3. Entailment Algorithm
            </h2>
            
            <p className="text-muted-foreground text-sm mb-10">
                Choose one or more algorithms you want to use to evaluate the query.
            </p>

            {/* Algorithm selector */}
            <div className="flex flex-col gap-6">
                {algorithms.map((algo) => (
                    <label
                        key={algo.id}
                        className="flex items-center gap-2 cursor-pointer"
                    >
                        <input
                            type="checkbox"
                            name="algorithm"
                            value={algo.id}
                            checked={selected.includes(algo.id)}
                            onChange={() => toggleAlgorithm(algo.id)}
                            className="accent-primary w-4 h-4"
                        />

                        <span className="text-sm text-foreground">
                            {algo.label}
                        </span>
                    </label>
                ))}
            </div>

        </div>
    );
};
export default EntailmentQueryCard;
