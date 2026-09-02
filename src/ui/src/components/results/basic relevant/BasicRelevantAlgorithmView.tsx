import React from 'react';
import { TriangleRightIcon } from '@radix-ui/react-icons';
import { TexFormula } from '../../ui/TexFormula';

interface AlgorithmViewProps{
    highlightedLines: number[];
}

// Same 6 conceptual steps as before (num 1-6 must stay in sync with the
// highlightedLines values produced in BasicRelevantSteps.ts), just authored
// as LaTeX and rendered through TexFormula instead of plain unicode text.
const lines = [
    { num: 1, tex: "\\text{Input: A defeasible knowledge base } \\mathcal{K} \\text{, a defeasible query } \\alpha \\vsim \\beta \\text{ and a partition } \\langle \\mathcal{R}, \\mathcal{R}^- \\rangle \\text{ of } \\mathcal{K}" },
    { num: 2, tex: "\\text{Output: If } \\mathcal{K} \\models_{RelC} \\alpha \\vsim \\beta \\text{, then return true otherwise false}" },
    { num: 3, tex: "(\\mathcal{R}_0, \\dots, \\mathcal{R}_{n-1}, \\mathcal{R}_\\infty, n) := \\text{BaseRank}(\\mathcal{K})"  },
    { num: 4, tex: "i := 0" },
    { num: 5, tex: "\\mathcal{R}' := \\mathcal{R}" },
    { num: 6, tex: "\\textbf{while}\\ (\\mathcal{\\overrightarrow{R}}_\\infty \\cup \\mathcal{\\overrightarrow{R^-}} \\cup \\mathcal{\\overrightarrow{R'}}) \\models \\neg\\alpha\\ \\textbf{and}\\ \\mathcal{R}' \\neq \\varnothing\\ \\textbf{do}" },
    { num: 7, tex:"\\mathcal{R}' := \\mathcal{R}' \\setminus \\{\\mathcal{R}_i \\cap \\mathcal{R}'\\}" , indent: true },
    { num: 8, tex: "i := i + 1" , indent: true},
    { num: 9, tex:  "\\textbf{end}", indent: true},
    { num: 10, tex:  "\\textbf{return}\\ (\\mathcal{\\overrightarrow{R}}_\\infty \\cup \\mathcal{\\overrightarrow{R^-}} \\cup \\mathcal{\\overrightarrow{R'}}) \\models \\alpha \\to \\beta"},
]

const AlgorithmView: React.FC<AlgorithmViewProps> =({highlightedLines}) => {
    return (
        <div>
            <h3 className="text-primary font-semibold mb-1 flex items-center gap-2">
                Algorithm
            </h3>

            <p className="text-xs text-muted-foreground mb-4">
                Basic Relevant Closure (pseudocode)
            </p>

            <div className="text-sm space-y-1">
                {lines.map((line) => {
                    const isHighlighted = highlightedLines.includes(line.num);
                    return (
                        <div
                            key={line.num}
                            className={`flex items-center gap-3 px-3 py-2 rounded-lg ${isHighlighted ? 'bg-amber-50 border border-amber-200' : ''} ${line.indent ? 'pl-8' : ''}`}
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
