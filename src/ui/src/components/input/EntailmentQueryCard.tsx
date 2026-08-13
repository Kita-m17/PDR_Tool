import React, {useState} from "react";
import {Button} from "../ui/Buttons";
import { ArrowRightIcon } from "@radix-ui/react-icons";

interface EntailmentQueryCardProps{
    selected: string;
    onAlgorithmChange: (algorithm: string) => void;
}

const EntailmentQueryCard: React.FC<EntailmentQueryCardProps> = ({selected, onAlgorithmChange}) => {
    // const [selected, setSelected] = useState('rational');
    const algorithms = [
        {id: 'rational', label: 'Rational Closure'},
        {id: 'lexicographic', label: 'Lexicographic Closure'},
        {id: 'relevant', label: 'Relevant Closure'},
    ];

    return (
        <div className="mb-8">
            <h2 className="text-xl font-bold text-foreground mb-1">
                3. Entailment Algorithm
            </h2>
            <p className="text-muted-foreground text-sm mb-10">
                Choose the algorithm you want to use to evaluate the query.
            </p>

            {/* Algorithm selector */}
            <div className="flex flex-col gap-6">
                {algorithms.map((algo) => (
                    <label
                        key={algo.id}
                        className="flex items-center gap-2 cursor-pointer"
                    >
                        <input
                            type="radio"
                            name="algorithm"
                            value={algo.id}
                            checked={selected === algo.id}
                            onChange={() => onAlgorithmChange(algo.id)}
                            className="accent-primary w-4 h-4"
                        />

                        <span className="text-sm text-foreground">
                            {algo.label}
                        </span>
                    </label>
                ))}
            </div>

            {/* Evaluate button */}
            {/* <div className="flex justify-end flex-col items-end mt-6">
                <Button
                    variant="primary"
                    size="lg"
                    onClick={() => onEvaluate(selected)}
                >
                    Evaluate
                    <ArrowRightIcon className="ml-2 h-4 w-4" />
                </Button>

                <p className="text-xs text-gray-400 mt-1">
                    Proceed to step-by-step evaluation.
                </p>
            </div> */}

        </div>
    );
};
export default EntailmentQueryCard;