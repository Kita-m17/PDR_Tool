import React from 'react';
import { Button } from '../../ui/Buttons';
import {TrackPreviousIcon, TrackNextIcon,ChevronLeftIcon,ChevronRightIcon} from '@radix-ui/react-icons';

interface StepControlsProps {
    current: number;
    total: number;
    onStart: () => void;
    onBack: () => void;
    onNext: () => void;
    onEnd: () => void;
}

const StepControls: React.FC<StepControlsProps> = ({current, total, onStart, onBack, onNext, onEnd}) => {
    return (
        <div className="flex items-center justify-between">
            {/* Step-through uttons at the bottom of the screen */}
            <div className="flex gap-2">
                <Button variant="outline" size="default" onClick={onStart} disabled={current === 0}>
                    <TrackPreviousIcon className="mr-2 h-4 w-4" />
                    Start
                </Button>

                <Button variant="outline" size="default" onClick={onBack} disabled={current === 0}>
                    <ChevronLeftIcon className="mr-2 h-4 w-4" />
                    Back
                </Button>
            </div>

            <span className="text-sm text-muted-foreground font-medium">
                {current + 1} / {total}
            </span>

            <div className="flex gap-2">
                <Button variant="primary" size="default" onClick={onNext} disabled={current === total - 1}>
                    Next
                    <ChevronRightIcon className="ml-2 h-4 w-4" />
                </Button>

                <Button variant="outline" size="default" onClick={onEnd} disabled={current === total - 1}>
                    End
                    <TrackNextIcon className="ml-2 h-4 w-4" />
                </Button>
            </div>
        </div>
    );
};

export default StepControls;