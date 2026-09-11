/*
 * File: Formula.tsx
 * Purpose: Educational use only.
 */
import React from 'react';

interface FormulaProps {
    children: React.ReactNode;
    size?: 'sm' | 'md';
}

export const Formula: React.FC<FormulaProps> = ({ children, size = 'sm' }) => (
    <span
        className={`font-mono text-blue-800 bg-accent border border-border rounded px-1.5 py-0.5 whitespace-nowrap ${
            size === 'md' ? 'text-sm' : 'text-xs'
        }`}
    >
        {children}
    </span>
);

export default Formula;
