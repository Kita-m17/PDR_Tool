import React from 'react';
import { CheckIcon } from '@radix-ui/react-icons';

export type AlgorithmPhase = 'baserank' | 'partition' | 'closure';

interface AlgorithmProgressProps {
    currentPhase: AlgorithmPhase;
    className?: string;
}

const PHASES: { key: AlgorithmPhase; label: string }[] = [
    { key: 'baserank', label: 'Base Rank' },
    { key: 'partition', label: 'Partition' },
    { key: 'closure', label: 'Relevant Closure' },
];

/**
 * Macro stepper shown under <Header /> on the three Relevant Closure
 * step-through pages (Base Rank -> Partition -> Relevant Closure).
 *
 * This is distinct from <StepControls />, which tracks position *within*
 * a phase (Back/Next through that phase's own steps). This bar tracks
 * position *across* the three phases of the algorithm, so the user always
 * knows where they are in the pipeline as a whole - Nielsen's
 * "visibility of system status" heuristic applied at the macro level.
 *
 * The connecting track runs continuously behind all three checkpoints
 * (rather than stopping short between them), and each phase's label
 * floats above its checkpoint circle rather than below it.
 */
const AlgorithmProgress: React.FC<AlgorithmProgressProps> = ({ currentPhase, className = '' }) => {
    const currentIndex = PHASES.findIndex(p => p.key === currentPhase);
    const fillPercent = (currentIndex / (PHASES.length - 1)) * 100;

    return (
        <div className={`bg-white border border-border rounded-xl px-6 pt-9 pb-4 mb-4 ${className}`}>
            <div className="relative flex items-center justify-between px-12">
                {/* base track - spans the full width, sits behind the checkpoints */}
                <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-[3px] bg-border rounded-full" />

                {/* filled portion - grows behind the completed checkpoints */}
                <div
                    className="absolute left-0 top-1/2 -translate-y-1/2 h-[3px] bg-primary rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${fillPercent}%` }}
                />

                {PHASES.map((phase, i) => {
                    const state = i < currentIndex ? 'done' : i === currentIndex ? 'current' : 'upcoming';

                    return (
                        <div key={phase.key} className="relative z-10 flex flex-col items-center">
                            {/* label floats above the checkpoint */}
                            <span
                                className={`absolute -top-7 left-1/2 -translate-x-1/2 whitespace-nowrap text-xs font-semibold transition-colors duration-300 ${
                                    state === 'upcoming'
                                        ? 'text-muted-foreground'
                                        : state === 'current'
                                        ? 'text-primary'
                                        : 'text-foreground'
                                }`}
                            >
                                {phase.label}
                            </span>

                            {/* checkpoint circle, sits on the track */}
                            <span
                                className={`flex items-center justify-center w-4 h-4 rounded-full border-2 transition-all duration-300 ${
                                    state === 'done'
                                        ? 'bg-primary border-primary'
                                        : state === 'current'
                                        ? 'bg-white border-primary shadow-[0_0_0_4px_hsl(var(--primary)/16%)]'
                                        : 'bg-white border-border'
                                }`}
                            >
                                {state === 'done' && <CheckIcon className="w-2.5 h-2.5 text-white" />}
                                {state === 'current' && <span className="w-1.5 h-1.5 rounded-full bg-primary" />}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default AlgorithmProgress;
