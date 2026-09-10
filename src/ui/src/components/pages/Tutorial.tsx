/*
 * File: Tutorial.tsx
 * Author: Nikita Martin (2026 Honours Project, University of Cape Town)
 * Status: Original work.
 * Context: React component for displaying a tutorial page.
 * Purpose: Educational use only.
 */
import React from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../layout/Header';
import Footer from '../layout/Footer';
import { Button } from '../ui/Buttons';
import { ArrowRightIcon } from '@radix-ui/react-icons';

interface TutorialStep {
    number: number;
    title: string;
    body: React.ReactNode;
}

// A small inline "code chip" for formulas
const Formula: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <span className="font-mono text-blue-800 text-xs bg-accent border border-border rounded px-1.5 py-0.5">{children}</span>
);

const STEPS: TutorialStep[] = [
    {
        number: 1,
        title: 'Build a knowledge base',
        body: (
            <>
                <p className="text-sm text-foreground mb-3">
                    We'll use the tool's built-in "Drowning Problem" example throughout - load it from the Home page via{' '}
                    <strong>Try an example</strong>. Here's exactly what it contains. <Formula>|~</Formula> marks a{' '}
                    <strong>defeasible</strong> statement and <Formula>=&gt;</Formula> marks a{' '} <strong>classical</strong> one (always true, no exceptions):
                </p>

                <div className="space-y-1.5 mb-3">
                    <div className="flex items-center gap-2 text-sm">
                        <Formula>bird|~flies</Formula>
                        <span className="text-muted-foreground">birds typically fly</span>
                    </div>

                    <div className="flex items-center gap-2 text-sm">
                        <Formula>bird|~wings</Formula>
                        <span className="text-muted-foreground">birds typically have wings</span>
                    </div>

                    <div className="flex items-center gap-2 text-sm">
                        <Formula>penguin=&gt;bird</Formula>
                        <span className="text-muted-foreground">penguins are always birds (classical, no exceptions)</span>
                    </div>

                    <div className="flex items-center gap-2 text-sm">
                        <Formula>penguin|~!flies</Formula>
                        <span className="text-muted-foreground">penguins typically don't fly</span>
                    </div>
                </div>

                <p className="text-sm text-foreground">
                    And the query we'll ask: <Formula>penguin|~wings</Formula> - <em>do penguins have wings?</em> To you and me, obviously yes. Let's see what each closure says.
                </p>
            </>
        ),
    },
    {
        number: 2,
        title: 'Compute the Base Rank',
        body: (
            <>
                <p className="text-sm text-foreground mb-3">
                    Press the <strong>Evaluate</strong> button and the tool sorts these four statements into ranks, by how exceptional their antecedent is:
                </p>

                <div className="space-y-2 mb-3">
                    <div className="flex flex-wrap items-center gap-2 bg-accent border border-border rounded-lg px-3 py-2">
                        <span className="text-xs font-semibold text-foreground">Rank 0</span>
                        <Formula>bird|~flies</Formula>
                        <Formula>bird|~wings</Formula>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 bg-accent border border-border rounded-lg px-3 py-2">
                        <span className="text-xs font-semibold text-foreground">Rank 1</span>
                        <Formula>penguin|~!flies</Formula>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 bg-accent border border-border rounded-lg px-3 py-2">
                        <span className="text-xs font-semibold text-foreground">R∞</span>
                        <Formula>penguin=&gt;bird</Formula>
                    </div>
                </div>

                <p className="text-sm text-foreground">
                    Notice <Formula>bird|~flies</Formula> and <Formula>bird|~wings</Formula> are in the <em>same</em> rank - not because they're related to each other, but because they share the same antecedent, <Formula>bird</Formula>. 
                    Keep that in mind - it's what causes everything that follows.
                </p>
            </>
        ),
    },
    {
        number: 3,
        title: 'Step through Rational Closure',
        body: (
            <>
                <p className="text-sm text-foreground mb-3">
                    Continue to the Rational Closure step-through. 
                    From here the tool works with the <em>materialised</em> knowledge base, where (defeasible statements <Formula>|~</Formula> becomes classical <Formula>=&gt;</Formula> for the reasoning itself) - so you'll see <Formula>bird=&gt;flies</Formula> and <Formula>bird=&gt;wings</Formula>{' '} instead of their original <Formula>|~</Formula> form from here on. 
                    It checks: is{' '} <Formula>penguin</Formula> exceptional? 
                    Yes - a penguin that flies would contradict{' '} <Formula>penguin=&gt;!flies</Formula>. 
                    So Rational Closure removes the {' '}<strong>entire</strong> lowest rank, Rank 0:
                </p>

                <div className="bg-red-50 border border-red-200 rounded-lg px-3 py-2 mb-3">
                    <span className="text-xs font-semibold text-red-700 mr-2">Removed</span>
                    <Formula>bird=&gt;flies</Formula>{' '}
                    <span className="mx-1" />
                    <Formula>bird=&gt;wings</Formula>
                </div>

                <p className="text-sm text-foreground">
                    Both statements are removed, even though only <Formula>bird=&gt;flies</Formula> actually caused the contradiction.
                    With{' '} <Formula>bird=&gt;wings</Formula> removed with the statement that was actually exceptional, even though it had nothing to do with flying.
                    That's the drowning problem - <Formula>bird=&gt;wings</Formula> "drowned" alongside <Formula>bird=&gt;flies</Formula>, even through it had nothing to do with the conflict.
                    Step forward to the final check yourself and see what the tool concludes about <Formula>penguin|~wings</Formula> as a result.
                </p>
            </>
        ),
    },
    {
        number: 4,
        title: 'Compare the closures',
        body: (
            <>
                <p className="text-sm text-foreground mt-3">
                    Use the <strong>Compare</strong> feature to step through each algorithm side by side and see exactly how they differ at each stage.
                </p>
                <div className="space-y-2 mb-3">
                    <div className="flex items-center justify-between bg-accent border border-border rounded-lg px-3 py-2">
                        <span className="text-sm font-semibold text-foreground">Rational Closure</span>
                        <span className="text-sm text-red-700 font-semibold">Not entailed</span>
                    </div>
                    <div className="flex items-center justify-between bg-accent border border-border rounded-lg px-3 py-2">
                        <span className="text-sm font-semibold text-foreground">Lexicographic Closure</span>
                        <span className="text-sm text-green-700 font-semibold">Entailed</span>
                    </div>
                    <div className="flex items-center justify-between bg-accent border border-border rounded-lg px-3 py-2">
                        <span className="text-sm font-semibold text-foreground">Relevant Closure</span>
                        <span className="text-sm text-green-700 font-semibold">Entailed</span>
                    </div>
                </div>
                <p className="text-sm text-foreground">
                    <strong>Lexicographic Closure</strong> keeps a <em>weakened</em> version of Rank 0 instead of deleting the entire rank, so{' '} <Formula>bird=&gt;wings</Formula> isn't lost completely. {' '}
                    <strong>Relevant Closure</strong> is more surgical still - it works out that <Formula>bird=&gt;flies</Formula> alone is responsible for the exception and removes only that statement, leaving{' '} <Formula>bird=&gt;wings</Formula> untouched the whole time. 
                    Same knowledge base, same query, three different answers - because each algorithm decides differently what "goes down with" what.
                </p>
            </>
        ),
    },
];

const Tutorial: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-accent flex flex-col">
            <Header />

            <main className="flex-1 px-8 py-6 max-w-3xl mx-auto w-full">

                {/* Intro */}
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-foreground mb-2">
                        Tutorial
                    </h1>
                    <p className="text-sm text-foreground">
                        The fastest way to understand this tool is to run one example through it end to end. 
                        This walks through exactly that, using the built-in "Drowning Problem" example: penguins, birds, and one question - do penguins have wings? - that the three closures don't all answer the same way.
                    </p>
                </div>

                {/* Steps */}
                <div className="space-y-4 mb-4">
                    {STEPS.map(step => (
                        <div key={step.number} className="bg-white border border-border rounded-xl p-6">
                            <div className="flex items-center gap-3 mb-3">
                                <span className="flex items-center justify-center w-7 h-7 rounded-full bg-primary text-white text-sm font-bold shrink-0">
                                    {step.number}
                                </span>
                                <h2 className="text-lg font-bold text-foreground">{step.title}</h2>
                            </div>
                            {step.body}
                        </div>
                    ))}
                </div>

                {/* Wrap-up */}
                <div className="bg-white border border-border rounded-xl p-6 mb-4">
                    <h2 className="text-lg font-bold text-foreground mb-2">That's it</h2>
                    <p className="text-sm text-muted-foreground">
                        Every other knowledge base you build follows the same pattern - Base Rank, then a closure of your choice, then (optionally) a comparison. 
                        Once this walkthrough feels familiar, use "Try your own" to build a knowledge base of your own and see what it reveals.
                    </p>
                </div>

                {/* CTA */}
                <div className="flex justify-end mt-4">
                    <Button variant="primary" size="lg" onClick={() => navigate('/')}>
                        Try it out for yourself
                        <ArrowRightIcon className="ml-2 h-4 w-4" />
                    </Button>
                </div>

            </main>

            <Footer />
        </div>
    );
};

export default Tutorial;