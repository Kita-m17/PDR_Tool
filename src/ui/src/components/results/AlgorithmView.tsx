import React from 'react';
import { TriangleRightIcon } from '@radix-ui/react-icons';

interface AlgorithmViewProps{
    highlightedLines: number[];
}

const lines = [
    {num:1, code: 'i:= 0'},
    {num:2, code: 'R:= R₀ U ... U R∞'},
    {num:3, code: 'while  R∞ U R |= ¬α'},
    {num:4, code: '   R: R \\ Rᵢ', indent: true },
    {num:5, code: '   i++', indent: true },
    {num:6, code: 'return R∞ U R |= α -> β' },
]

const AlgorithmView: React.FC<AlgorithmViewProps> =({highlightedLines}) => {
    return (
        <div>
            <h3 className="text-primary font-semibold mb-1 flex items-center gap-2">
                Algorithm
            </h3>

            <p className="text-xs text-muted-foreground mb-4">
                Rational Closure (pseudocode)
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
                                        <TriangleRightIcon/>
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

export default AlgorithmView;