import React from 'react';
import { TriangleRightIcon } from '@radix-ui/react-icons';
import { TexFormula } from '../../ui/TexFormula';


interface AlgorithmViewProps{
    highlightedLines: number[];
}

const lines: { num: number; tex: string; indent?: boolean }[] = [
    { num: 0, tex: "\\text{Input: A knowledge base } \\mathcal{K} \\text{ and a query } \\alpha \\mid \\! \\sim \\beta" },
    { num: 1, tex: "\\text{Output: } \\textbf{true} \\text{ if } \\mathcal{K} \\mid \\! \\approx_{RC} \\alpha  \\mid \\! \\sim \\beta \\text{, } \\textbf{false} \\text{ otherwise}" },
    { num: 2, tex: "(\\mathcal{R}_0, \\dots, \\mathcal{R}_{n-1}, \\mathcal{R}_\\infty, n) := \\text{BaseRank}(\\mathcal{K})" },
    { num: 3, tex: "i := 0" },
    { num: 4, tex: "\\mathcal{R} := \\bigcup_{j=0}^{n-1} \\mathcal{R}_j" },
    { num: 5, tex: "\\textbf{while}\\ \\mathcal{R}_\\infty \\cup \\mathcal{R} \\models \\neg\\alpha\\ \\textbf{and}\\ \\mathcal{R} \\neq \\emptyset\\ \\textbf{do}" },
    { num: 6, tex: "\\mathcal{R} := \\mathcal{R} \\setminus \\mathcal{R}_i", indent: true },
    { num: 7, tex: "i := i + 1", indent: true },
    { num: 8, tex: "\\textbf{end while}" },
    { num: 9, tex: "\\textbf{return}\\ \\mathcal{R}_\\infty \\cup \\mathcal{R} \\models \\alpha \\rightarrow \\beta" },
];

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

                            <span className={`${line.indent ? 'ml-4' : ''} ${isHighlighted ? 'text-foreground font-medium': 'text-muted-foreground'}`}>
                                <TexFormula>{line.tex}</TexFormula>
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default AlgorithmView;