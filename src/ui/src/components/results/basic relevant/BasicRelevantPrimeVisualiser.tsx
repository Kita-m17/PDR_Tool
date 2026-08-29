import React from 'react';
import { TexFormula } from '../../ui/TexFormula';

interface PrimeVisualiserProps {
    currentRankIndex: number;
    currentRPrime: string[];
    irrelevantPartition: string[];
}

// Deliberately minimal - just R' and which rank (i) is currently under
// consideration. The per-rank ranking table and the relevant/irrelevant
// partition now live in ExplanationView, shown only on the removal step
// (highlighted lines 7-8), since that's the only step where they add
// context beyond "R' is now this".
const PrimeVisualiser: React.FC<PrimeVisualiserProps> = ({ currentRankIndex,irrelevantPartition, currentRPrime }) => {
    const parts = [...irrelevantPartition, ...currentRPrime];
    return (
        <div>
            <div className="flex items-center justify-between mb-3">
                <h3 className="text-primary font-semibold flex items-center gap-2">
                     <TexFormula>{"\\mathcal{R}'\\cup\\mathcal{R}^-\\cup\\mathcal{R}_\\infty:"}</TexFormula>
                </h3>

                <span className={`inline-block rounded-md border px-2 py-0.5 text-xs font-semibold ${
                    currentRankIndex >= 0
                        ? 'border-sky-300 bg-sky-50 text-sky-900'
                        : 'border-border bg-gray-50 text-muted-foreground'
                }`}>
                    {currentRankIndex >= 0 ? `i = ${currentRankIndex}` : 'i = —'}
                </span>
            </div>

            <p className="text-xs text-muted-foreground mb-3">
                shrinks as relevant statements are removed from exceptional ranks.
            </p>

            <div className="rounded-lg border border-border bg-muted/40 p-4">

                <div className="flex flex-wrap gap-2">
                     {parts.length > 0 ?  parts.join(', ')  : '∅'}
                </div>
            </div>
        </div>
    );
};

export default PrimeVisualiser;
