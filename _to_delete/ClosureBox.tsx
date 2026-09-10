import React from "react";

interface ClosureBoxProps {
    selected: string;
    onClosureChange: (closureType: string) => void;
}

// Mirrors EntailmentQueryCard's radio-selector pattern, but chooses how the
// relevant PARTITION (justification search) is computed, not which
// entailment algorithm runs. Feeds submitPartitionQuery vs
// submitMinimalPartitionQuery in App.tsx.
const ClosureBox: React.FC<ClosureBoxProps> = ({ selected, onClosureChange }) => {
    const closureTypes = [
        {
            id: "basic",
            label: "Basic Relevant Closure",
            description: "Every minimal classically-entailing subset of the knowledge base is kept as a justification in full.",
        },
        {
            id: "minimal",
            label: "Minimal Relevant Closure",
            description: "Each justification is reduced to its lowest base-rank (most general) supporting statements.",
        },
    ];

    return (
        <div className="mb-8">
            <h2 className="text-primary font-semibold mb-3">
                4. Relevant Partition Type
            </h2>

            <p className="text-muted-foreground text-sm mb-10">
                Choose how justifications for the relevant partition should be computed.
            </p>

            {/* Closure type selector */}
            <div className="flex flex-col gap-6">
                {closureTypes.map((type) => (
                    <label
                        key={type.id}
                        className="flex items-start gap-2 cursor-pointer"
                    >
                        <input
                            type="radio"
                            name="closureType"
                            value={type.id}
                            checked={selected === type.id}
                            onChange={() => onClosureChange(type.id)}
                            className="accent-primary w-4 h-4 mt-0.5"
                        />

                        <span className="flex flex-col">
                            <span className="text-sm text-foreground">
                                {type.label}
                            </span>
                            <span className="text-xs text-muted-foreground">
                                {type.description}
                            </span>
                        </span>
                    </label>
                ))}
            </div>
        </div>
    );
};

export default ClosureBox;
