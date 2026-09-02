import React from 'react';
import { TriangleRightIcon } from '@radix-ui/react-icons';

interface LexicographicAlgorithmViewProps {
    highlightedLines: number[];
}

const lines = [
    { num: 1, code: 'R := R₀ U ... U Rₙ₋₁' },
    { num: 2, code: 'i := 0' },
    { num: 3, code: 'while R∞ U R |= ¬α and R ≠ ∅' },
    { num: 4, code: '   R := R \\ Rᵢ', indent: true },
    { num: 5, code: '   m := |Rᵢ| − 1', indent: true },
    { num: 6, code: '   Rᵢ,ₘ := ⋁ { ⋀X | X ⊆ Rᵢ, |X| = m }', indent: true },
    { num: 7, code: '   while R∞ U R U {Rᵢ,ₘ} |= ¬α and m > 0', indent: true },
    { num: 8, code: '      m := m − 1', indent: true },
    { num: 9, code: '      Rᵢ,ₘ := ⋁ { ⋀X | X ⊆ Rᵢ, |X| = m }', indent: true },
    { num: 10, code: '   R := R U {Rᵢ,ₘ}', indent: true },
    { num: 11, code: '   i := i + 1', indent: true },
    { num: 12, code: 'return R∞ U R |= α -> β' },
];

const LexicographicAlgorithmView: React.FC<LexicographicAlgorithmViewProps> = ({ highlightedLines }) => {
    return (
        <div>
            <h3 className="text-primary font-semibold mb-1 flex items-center gap-2">
                Algorithm
            </h3>

            <p className="text-xs text-muted-foreground mb-4">
                Lexicographic Closure (pseudocode)
            </p>

            <div className="font-mono text-sm space-y-1">
                {lines.map((line) => {
                    const isHighlighted = highlightedLines.includes(line.num);
                    return (
                        <div
                            key={line.num}
                            className={`flex items-center gap-3 px-3 py-2 rounded-lg ${isHighlighted ? 'bg-amber-50 border border-amber-200' : ''}`}
                        >
                            {isHighlighted ? (
                                <span className="text-amber-500">
                                    <TriangleRightIcon />
                                </span>
                            ) : (
                                <span className="w-3" />
                            )}

                            <span className={`w-5 text-xs rounded px-1 ${isHighlighted ? 'bg-amber-400 text-white' : 'bg-gray-100 text-gray-500'}`}>
                                {line.num}
                            </span>

                            <span className={isHighlighted ? 'text-foreground font-medium' : 'text-muted-foreground'}>
                                {line.code}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default LexicographicAlgorithmView;
