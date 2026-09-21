import React from 'react';
import { TriangleRightIcon } from '@radix-ui/react-icons';
import { TexFormula } from '../../ui/TexFormula';

interface LexicographicAlgorithmViewProps {
    highlightedLines: number[];
}

// indentation = 1 inside the outer loop, 2 inside the inner one.
const lines: { num: number; tex: string; indent?: number }[] = [
    { num: 1, tex: "\\text{Input: A defeasible knowledge base } \\mathcal{K} \\text{ and a defeasible query } \\alpha \\vsim \\beta" },
    { num: 2, tex: "\\text{Output: } \\textbf{true} \\text{ if } \\mathcal{K} \\mid \\! \\approx_{LC} \\alpha \\vsim \\beta \\text{, } \\textbf{false} \\text{ otherwise}" },
    { num: 3, tex: "(\\mathcal{R}_0, \\dots, \\mathcal{R}_{n-1}, \\mathcal{R}_\\infty, n) := \\text{BaseRank}(\\mathcal{K})" },
    { num: 4, tex: "\\mathcal{R} := \\bigcup_{j=0}^{n-1} \\mathcal{R}_j" },
    { num: 5, tex: "i := 0, m:=0" },
    { num: 6, tex: "\\textbf{while}\\ \\mathcal{\\overrightarrow{R}}_\\infty \\cup \\mathcal{\\overrightarrow{R}} \\models \\neg\\alpha\\ \\textbf{and}\\ \\mathcal{R} \\neq \\emptyset\\ \\textbf{do}" },
    { num: 7, tex: "\\mathcal{R} := \\mathcal{R} \\setminus \\mathcal{R}_i", indent: 1 },
    { num: 8, tex: "m := |\\mathcal{R}_i| - 1", indent: 1 },
    { num: 9, tex: "\\mathcal{R}_{i,m} := \\bigvee_{X \\in \\text{Subsets}(\\mathcal{R}_i, m)} \\bigwedge_{x \\in X} x", indent: 1 },
    { num: 10, tex: "\\textbf{while}\\ \\mathcal{\\overrightarrow{R}}_\\infty \\cup \\mathcal{\\overrightarrow{R}} \\cup \\{\\mathcal{\\overrightarrow{R}}_{i,m}\\} \\models \\neg\\alpha\\ \\textbf{and}\\ m > 0\\ \\textbf{do}", indent: 1 },
    { num: 11, tex: "m := m - 1", indent: 2 },
    { num: 12, tex: "\\mathcal{R}_{i,m} := \\bigvee_{X \\in \\text{Subsets}(\\mathcal{R}_i, m)} \\bigwedge_{x \\in X} x", indent: 2 },
    { num: 13, tex: "\\textbf{end while}", indent: 1 },
    { num: 14, tex: "\\mathcal{R} := \\mathcal{R} \\cup \\{\\mathcal{R}_{i,m}\\}", indent: 1 },
    { num: 15, tex: "i := i + 1", indent: 1 },
    { num: 16, tex: "\\textbf{end while}" },
    { num: 17, tex: "\\textbf{return}\\ \\mathcal{R}_\\infty \\cup \\mathcal{R} \\models \\alpha \\rightarrow \\beta" },
];

const indentClass = ['', 'ml-4', 'ml-8'];

const LexicographicAlgorithmView: React.FC<LexicographicAlgorithmViewProps> = ({ highlightedLines }) => {
    return (
        <div>
            <h3 className="text-primary font-semibold mb-1 flex items-center gap-2">
                Algorithm
            </h3>

            <p className="text-xs text-muted-foreground mb-4">
                Lexicographic Closure (pseudocode)
            </p>

            <div className="text-sm space-y-1">
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

                            <span className={`${indentClass[line.indent ?? 0]} ${isHighlighted ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>
                                <TexFormula>{line.tex}</TexFormula>
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default LexicographicAlgorithmView;
