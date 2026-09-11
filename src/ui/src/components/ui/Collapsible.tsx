/*
 * File: Collapsible.tsx
 * Author: Samukelisiwe Zwane (2026 Honours Project, University of Cape Town)
 * Status: Original work.
 * Context: Block used on the Info page to hide formal definitions
 * Purpose: Educational use only.
 */
import React from 'react';
import { ChevronRightIcon } from '@radix-ui/react-icons';

interface CollapsibleProps {
    /** Text shown on the closed summary line. */
    label?: string;
    children: React.ReactNode;
}

export const Collapsible: React.FC<CollapsibleProps> = ({
    label = 'Show the formal definition',
    children,
}) => (
    <details className="group mt-3 border-t border-border pt-3">
        <summary
            className="flex cursor-pointer items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors list-none [&::-webkit-details-marker]:hidden"
        >
            <ChevronRightIcon className="h-3 w-3 shrink-0 transition-transform group-open:rotate-90" />
            {label}
        </summary>

        <div className="mt-2 text-sm text-foreground leading-relaxed">
            {children}
        </div>
    </details>
);

export default Collapsible;
