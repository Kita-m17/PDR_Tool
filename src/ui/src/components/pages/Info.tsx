/*
 * File: Info.tsx
 * Author: Samukelisiwe Zwane (2026 Honours Project, University of Cape Town)
 * Status: Original work
 * Context: React component for the Info page 
 * Purpose: Educational use only
 */
import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Header from '../layout/Header';
import Footer from '../layout/Footer';
import { Button } from '../ui/Buttons';
import { TexFormula } from '../ui/TexFormula';
import { Formula } from '../ui/Formula';
import { Collapsible } from '../ui/Collapsible';
import { CORE_CONNECTIVES, RARE_CONNECTIVES, Connective } from '../../data/notation';
import { ArrowRightIcon } from '@radix-ui/react-icons';


const SECTIONS = [
    { id: 'about', label: 'Purpose of the tool' },
    { id: 'notation', label: 'Connectives' },
    { id: 'concepts', label: 'Definitions' },
    { id: 'input', label: 'Input rules' },
    { id: 'glossary', label: 'Glossary' },
];

/* ------------------------------------------------------------------ */
/* Small building blocks                                               */
/* ------------------------------------------------------------------ */

const Section: React.FC<{ id: string; title: string; lead?: string; children: React.ReactNode }> = ({
    id,
    title,
    lead,
    children,
}) => (
    <section id={id} className="scroll-mt-24 bg-white border border-border rounded-xl p-6 mb-4">
        <h2 className="text-lg font-bold text-foreground mb-1">{title}</h2>
        {lead && <p className="text-sm text-muted-foreground mb-4">{lead}</p>}
        {children}
    </section>
);

/** A card carrying one concept: intuition, then a concrete instance, then optional formal detail. */
const ConceptCard: React.FC<{
    id: string;
    term: string;
    children: React.ReactNode;
    formal?: React.ReactNode;
}> = ({ id, term, children, formal }) => (
    <div id={id} className="scroll-mt-24 border border-border rounded-lg p-4 bg-white">
        <h3 className="text-sm font-bold text-foreground mb-2">{term}</h3>
        <div className="text-sm text-foreground leading-relaxed space-y-2">{children}</div>
        {formal && <Collapsible>{formal}</Collapsible>}
    </div>
);

/** One row of the connectives table. */
const ConnectiveRow: React.FC<{ connective: Connective }> = ({ connective: c }) => (
    <tr
        className={`border-b border-border align-top ${
            c.emphasis ? 'bg-app-2' : ''
        }`}
    >
        <td className="py-3 px-3 text-center">
            <TexFormula>{c.tex}</TexFormula>
        </td>

        <td className="py-3 px-3 text-center">
            <Formula>{c.typed}</Formula>
        </td>

        <td className="py-3 px-3">
            <span className="text-sm font-medium text-foreground">{c.name}</span>
            <span className="block text-xs text-muted-foreground mt-0.5">{c.plain}</span>
        </td>

        <td className="py-3 px-3">
            <Formula>{c.example.typed}</Formula>
            <span className="block text-xs text-muted-foreground mt-1">{c.example.gloss}</span>
        </td>
    </tr>
);

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

const Info: React.FC = () => {
    const navigate = useNavigate();
    const { hash } = useLocation();
    useEffect(() => {
        if (!hash) return;

        const timer = window.setTimeout(() => {
            const target = document.getElementById(hash.slice(1));
            if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 50);

        return () => window.clearTimeout(timer);
    }, [hash]);

    return (
        <div className="min-h-screen bg-accent flex flex-col">
            <Header />

            <main className="flex-1 px-8 py-6 max-w-3xl mx-auto w-full">

                {/* Intro */}
                <div className="mb-4">
                    <h1 className="text-2xl font-bold text-foreground mb-2">Info</h1>
                    <p className="text-sm text-foreground">
                        This page contains everything you need to understand this tool: what the symbols mean, what you
                        are allowed to type and formal definitions of constantly used vocabulary.
                    </p>
                </div>

                {/* Table of contents */}
                <nav className="sticky top-0 z-20 -mx-8 px-8 py-3 bg-accent mb-4">
                    <ul className="flex flex-wrap gap-2">
                        {SECTIONS.map((s) => (
                            <li key={s.id}>
                                <a
                                    href={`#${s.id}`}
                                    className="inline-block text-xs font-medium text-primary bg-white border border-border rounded-full px-3 py-1.5 hover:bg-app-2 transition-colors"
                                >
                                    {s.label}
                                </a>
                            </li>
                        ))}
                    </ul>
                </nav>

                {/* PURPOSE */}
                <Section id="about" title="Purpose of the tool">
                    <div className="text-sm text-foreground leading-relaxed space-y-3">
                        <p>
                            Classical logic treats every statement as a rule with no exceptions. If a knowledge
                            base says that birds fly, that penguins are birds and that penguins do not fly,
                            classical logic concludes that penguins cannot exist.
                        </p>
                        <p>
                            "Birds fly" is meant to describe typical birds, not every bird, but classical logic
                            has no way of expressing this. Defeasible reasoning lets you write statements such as "birds
                            typically fly". A more specific statement, such as "penguins do not fly", can then
                            override the general rule instead of forcing the conclusion that penguins do not exist.
                        </p>
                        <p>
                            Once exceptions are allowed, there is more than one way to decide which
                            conclusions should still follow. This tool implements four of these approaches. You
                            enter a knowledge base and a query, and then step through the algorithm to see in detail how the answer was reached.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
                        {[
                            {
                                name: 'Rational Closure',
                                blurb: 'Throws away a whole rank of statements at a time.',
                            },
                            {
                                name: 'Lexicographic Closure',
                                blurb: 'Keeps as much of a rank as it can rather than discarding all of it.',
                            },
                            {
                                name: 'Basic Relevant Closure',
                                blurb: 'Only touches statements actually implicated in the conflict.',
                            },
                            {
                                name: 'Minimal Relevant Closure',
                                blurb: 'Narrows the relevant set to the lowest ranked statements.',
                            },
                        ].map((a) => (
                            <div key={a.name} className="border border-border rounded-lg p-3">
                                <p className="text-sm font-semibold text-foreground">{a.name}</p>
                                <p className="text-xs text-muted-foreground mt-1">{a.blurb}</p>
                            </div>
                        ))}
                    </div>

                    <p className="text-sm text-foreground mt-4">
                        The same knowledge base and the same query can get different answers from different
                        algorithms.
                    </p>

                    <div className="flex justify-end mt-4">
                        <Button variant="outline" size="default" onClick={() => navigate('/help')}>
                            See the Tutorial
                            <ArrowRightIcon className="ml-2 h-4 w-4" />
                        </Button>
                    </div>

                    <div className="mt-6 pt-4 border-t border-border">
                        <p className="text-xs text-muted-foreground leading-relaxed">
                            Built at the University of Cape Town as a 2026 Honours project. Classical
                            entailment and the underlying propositional data structures come from the
                            TweetyProject Java library. The formula parser and symbol definitions build on
                            earlier UCT Honours work by Thabo Vincent Moloi (2024) and Julia Cotterrell
                            (2025).
                        </p>
                    </div>
                </Section>


                {/* Connectives */}
                <Section
                    id="notation"
                    title="Connectives"
                >
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse">
                            <thead>
                                <tr className="border-b border-border">
                                    <th className="py-2 px-3 text-center text-xs font-medium text-muted-foreground">Symbol</th>
                                    <th className="py-2 px-3 text-center text-xs font-medium text-muted-foreground">Typed out</th>
                                    <th className="py-2 px-3 text-left text-xs font-medium text-muted-foreground">Meaning</th>
                                    <th className="py-2 px-3 text-left text-xs font-medium text-muted-foreground">Example</th>
                                </tr>
                            </thead>

                            <tbody>
                                {CORE_CONNECTIVES.map((c) => (
                                    <ConnectiveRow key={c.id} connective={c} />
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <p className="text-xs font-medium text-muted-foreground mt-5 mb-1">Rarely used</p>
                    <div className="overflow-x-auto opacity-75">
                        <table className="w-full border-collapse">
                            <tbody>
                                {RARE_CONNECTIVES.map((c) => (
                                    <ConnectiveRow key={c.id} connective={c} />
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Classical vs defeasible implication */}
                    <div className="mt-6 border border-border rounded-lg p-4 bg-app-2">
                        <p className="text-sm font-semibold text-foreground mb-2">
                            Classical and defeasible implication
                        </p>
                        <div className="space-y-2 text-sm text-foreground">
                            <p>
                                <Formula>penguin=&gt;bird</Formula> is a classical implication. It says
                                that every penguin is a bird, with no exceptions.
                            </p>
                            <p>
                                <Formula>bird|~flies</Formula> is a defeasible implication. It says that
                                birds typically fly. If you also state that penguins typically do not fly,
                                the tool concludes that penguins typically do not fly while still
                                concluding that birds typically fly.
                            </p>
                            <p className="text-xs text-muted-foreground">
                                When the antecedent of a query conflicts with the knowledge base, the
                                algorithms resolve the conflict by removing defeasible statements.
                                Classical statements are always kept.
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-6">
                        {[...CORE_CONNECTIVES, ...RARE_CONNECTIVES].map((c) => (
                            <div
                                key={c.id}
                                id={c.id}
                                className="scroll-mt-24 border border-border rounded-lg p-4"
                            >
                                <div className="flex items-center gap-2 mb-2">
                                    <TexFormula>{c.tex}</TexFormula>
                                    <span className="text-sm font-bold text-foreground">{c.name}</span>
                                </div>
                                <p className="text-sm text-foreground leading-relaxed">{c.detail}</p>
                                <p className="text-xs text-muted-foreground mt-2">
                                    <Formula>{c.example.typed}</Formula>{' '}
                                    <span className="ml-1">{c.example.gloss}</span>
                                </p>
                            </div>
                        ))}
                    </div>
                </Section>

                {/* Definitions */}
                <Section
                    id="concepts"
                    title="Definitions"
                    lead=""
                >
                    <div className="space-y-3">
                        <ConceptCard id="concept-kb" term="Knowledge base">
                            <p>
                                The list of formulas you enter. It can contain strict statements written with{' '}
                                <Formula>=&gt;</Formula> and defeasible statements written with{' '}
                                <Formula>|~</Formula>. In the formal notation it is written{' '}
                                <TexFormula>{'\\mathcal{K}'}</TexFormula>.
                            </p>
                        </ConceptCard>

                        <ConceptCard
                            id="concept-materialisation"
                            term="Materialisation"
                            formal={
                                <p>
                                    The materialisation of{' '}
                                    <TexFormula>{'\\mathcal{K}'}</TexFormula> is{' '}
                                    <TexFormula>{'\\overrightarrow{\\mathcal{K}} = \\{\\, \\alpha \\to \\beta \\;:\\; \\alpha \\vsim \\beta \\in \\mathcal{K} \\,\\}'}</TexFormula>
                                    . The strict statements in{' '}
                                    <TexFormula>{'\\mathcal{K}'}</TexFormula> are included unchanged.
                                </p>
                            }
                        >
                            <p>
                                Materialisation replaces every <Formula>|~</Formula> with{' '}
                                <Formula>=&gt;</Formula> so that the knowledge base can be checked with
                                classical entailment. <Formula>bird|~flies</Formula> becomes{' '}
                                <Formula>bird=&gt;flies</Formula>.
                            </p>
                            <p className="text-muted-foreground">
                                This is why the step-through screens switch to <Formula>=&gt;</Formula>{' '}
                                partway through, even for statements you typed with <Formula>|~</Formula>.
                                From that point on, the tool is using a classical SAT solver on the
                                materialised knowledge base.
                            </p>
                        </ConceptCard>

                        <ConceptCard
                            id="concept-exceptionality"
                            term="Exceptionality"
                            formal={
                                <p>
                                    <TexFormula>{'\\alpha'}</TexFormula> is exceptional with respect to{' '}
                                    <TexFormula>{'\\mathcal{K}'}</TexFormula> when{' '}
                                    <TexFormula>{'\\overrightarrow{\\mathcal{K}} \\models \\neg \\alpha'}</TexFormula>
                                    . This holds exactly when{' '}
                                    <TexFormula>{'\\overrightarrow{\\mathcal{K}} \\cup \\{\\alpha\\}'}</TexFormula>{' '}
                                    is unsatisfiable, so the tool checks it with a SAT solver.
                                </p>
                            }
                        >
                            <p>
                                A formula is <em>exceptional</em> if the materialised knowledge base implies
                                that it is false. In other words, it cannot be true without breaking at least
                                one statement in the knowledge base.
                            </p>
                            <p>
                                Take the knowledge base <Formula>penguin=&gt;bird</Formula>,{' '}
                                <Formula>bird|~flies</Formula> and <Formula>penguin|~!flies</Formula>. If{' '}
                                <Formula>penguin</Formula> is true, then <Formula>bird</Formula> is true, so{' '}
                                <Formula>bird=&gt;flies</Formula> gives <Formula>flies</Formula> and{' '}
                                <Formula>penguin=&gt;!flies</Formula> gives <Formula>!flies</Formula>. These
                                conflict, so the materialised knowledge base entails{' '}
                                <Formula>!penguin</Formula> and <Formula>penguin</Formula> is exceptional.
                            </p>
                        </ConceptCard>

                        <ConceptCard
                            id="concept-baserank"
                            term="Base rank"
                            formal={
                                <p>
                                    The BaseRank procedure repeatedly applies the exceptionality check to
                                    split the knowledge base into{' '}
                                    <TexFormula>{'R_0, R_1, \\ldots, R_{n-1}, R_\\infty'}</TexFormula>. It
                                    stops when a round no longer changes the set of exceptional statements.
                                    The strict statements, and any defeasible statements still exceptional at
                                    that point, go into <TexFormula>{'R_\\infty'}</TexFormula>.
                                </p>
                            }
                        >
                            <p>
                                Base rank sorts the defeasible statements into ranks. Statements about typical
                                cases go in rank 0, exceptions to those go in rank 1, exceptions to the
                                exceptions go in rank 2, and so on.
                            </p>
                            <p>
                                Strict statements written with <Formula>=&gt;</Formula> go in{' '}
                                <TexFormula>{'R_\\infty'}</TexFormula>, along with any defeasible statements
                                that stay exceptional at every step. Nothing in{' '}
                                <TexFormula>{'R_\\infty'}</TexFormula> is ever removed.
                            </p>
                            <p className="text-muted-foreground">
                                Every algorithm in the tool starts by computing the base rank.
                            </p>
                        </ConceptCard>

                        <ConceptCard
                            id="concept-rational"
                            term="Rational Closure"
                            formal={
                                <p>
                                    Discard <TexFormula>{'R_0, R_1, \\ldots'}</TexFormula> in order until{' '}
                                    <TexFormula>{'\\alpha'}</TexFormula> is no longer exceptional with respect
                                    to what remains, then answer{' '}
                                    <TexFormula>{'\\alpha \\vsim \\beta'}</TexFormula> by checking whether the
                                    remaining set classically entails{' '}
                                    <TexFormula>{'\\alpha \\to \\beta'}</TexFormula>.
                                </p>
                            }
                        >
                            <p>
                                Rational Closure checks whether the antecedent of the query is exceptional. If
                                it is, it removes rank 0 and checks again, then rank 1, and so on. Once the
                                antecedent is no longer exceptional, it answers the query with classical
                                entailment on the ranks that are left.
                            </p>
                            <p className="text-muted-foreground">
                                Because it removes whole ranks, it can also remove statements that had nothing
                                to do with the conflict. This is the drowning problem.
                            </p>
                        </ConceptCard>

                        <ConceptCard
                            id="concept-drowning"
                            term="The drowning problem"
                        >
                            <p>
                                When Rational Closure removes a rank, it removes every statement in that rank,
                                including statements that were not involved in the conflict. These statements
                                are said to <em>drown</em>.
                            </p>
                            <p>
                                Take the knowledge base <Formula>penguin=&gt;bird</Formula>,{' '}
                                <Formula>bird|~flies</Formula>, <Formula>bird|~wings</Formula> and{' '}
                                <Formula>penguin|~!flies</Formula>. <Formula>bird|~flies</Formula> and{' '}
                                <Formula>bird|~wings</Formula> are both in rank 0. To answer{' '}
                                <Formula>penguin|~wings</Formula>, Rational Closure has to remove rank 0
                                because <Formula>penguin</Formula> is exceptional, so both statements are
                                removed. Only <Formula>bird|~flies</Formula> conflicts with penguins, but once
                                rank 0 is gone the tool can no longer conclude that penguins have wings.
                            </p>
                            <p className="text-muted-foreground">
                                Lexicographic Closure and Relevant Closure both try to avoid this by removing
                                fewer statements.
                            </p>
                        </ConceptCard>

                        <ConceptCard
                            id="concept-lexicographic"
                            term="Lexicographic Closure"
                            formal={
                                <p>
                                    Each rank <TexFormula>{'R_i'}</TexFormula> is refined into sub-ranks, one
                                    for each subset size in decreasing order. The sub-rank for size{' '}
                                    <TexFormula>{'m'}</TexFormula> is the disjunction of the conjunctions of
                                    all subsets of <TexFormula>{'R_i'}</TexFormula> with{' '}
                                    <TexFormula>{'m'}</TexFormula> statements. The procedure is then the same
                                    as Rational Closure, but over this finer ranking. The number of subsets is
                                    exponential in the size of the rank, which is why Lexicographic Closure
                                    costs more to compute than Rational Closure.
                                </p>
                            }
                        >
                            <p>
                                Lexicographic Closure does not remove a whole rank at once. It removes as few
                                statements from the rank as it needs to: one if that is enough, two only if
                                one is not, and so on.
                            </p>
                            <p>
                                In the drowning example, Rational Closure removes both statements in rank 0.
                                Lexicographic Closure first tries keeping one of the two. It does this by
                                keeping the disjunction of the subsets of size 1, which says that at least one
                                of the two statements still holds:
                            </p>

                            <div className="border border-border rounded-lg overflow-hidden mt-1">
                                <div className="px-3 py-2 border-b border-border bg-accent">
                                    <span className="text-xs font-semibold text-foreground mr-2">Rank 0</span>
                                    <Formula>bird=&gt;flies</Formula>{' '}
                                    <Formula>bird=&gt;wings</Formula>
                                </div>

                                <div className="px-3 py-2 border-b border-border bg-red-50">
                                    <span className="text-xs font-semibold text-red-700 block mb-1">
                                        Rational Closure removes the rank
                                    </span>
                                    <span className="line-through opacity-60">
                                        <Formula>bird=&gt;flies</Formula>{' '}
                                        <Formula>bird=&gt;wings</Formula>
                                    </span>
                                </div>

                                <div className="px-3 py-2 bg-green-50">
                                    <span className="text-xs font-semibold text-green-700 block mb-1">
                                        Lexicographic Closure keeps the disjunction of the subsets of size 1
                                    </span>
                                    <span className="inline-flex flex-wrap items-center gap-2">
                                        <Formula>bird=&gt;flies</Formula>
                                        <TexFormula>{'\\lor'}</TexFormula>
                                        <Formula>bird=&gt;wings</Formula>
                                    </span>
                                    <span className="block text-xs text-muted-foreground mt-1">
                                        Penguins do not fly, so <Formula>bird=&gt;flies</Formula> is false for
                                        penguins. <Formula>bird=&gt;wings</Formula> must then hold, so the tool
                                        can still conclude that penguins have wings.
                                    </span>
                                </div>
                            </div>

                            <p className="text-muted-foreground">
                                The sub-knowledge base tables in the Lexicographic step-through list every
                                subset of the rank at a given size, and whether that subset, with the
                                rest of the knowledge base, still makes the antecedent of the query
                                exceptional.
                            </p>
                        </ConceptCard>

                        <ConceptCard
                            id="concept-relevant"
                            term="Relevant Closure"
                            formal={
                                <p>
                                    A justification for <TexFormula>{'\\alpha'}</TexFormula> is a minimal{' '}
                                    <TexFormula>{'J \\subseteq \\mathcal{K}'}</TexFormula> whose
                                    materialisation entails{' '}
                                    <TexFormula>{'\\neg \\alpha'}</TexFormula>. The statements that appear in
                                    at least one justification form the relevant set, and only these can be
                                    removed. Minimal Relevant Closure only puts the lowest ranked statements
                                    of each justification in the relevant set.
                                </p>
                            }
                        >
                            <p>
                                Relevant Closure still removes ranks in order, but from each rank it only
                                removes the statements that cause the antecedent to be exceptional. Every
                                other statement stays in the knowledge base.
                            </p>
                            <p>
                                In the drowning example, the only justification for{' '}
                                <Formula>penguin</Formula> is <Formula>penguin=&gt;bird</Formula>,{' '}
                                <Formula>bird=&gt;flies</Formula> and <Formula>penguin=&gt;!flies</Formula>.
                                At rank 0, Relevant Closure removes <Formula>bird=&gt;flies</Formula> and
                                keeps <Formula>bird=&gt;wings</Formula>, so the tool can conclude that
                                penguins have wings.
                            </p>
                            <p className="text-muted-foreground">
                                The tool has two versions. <strong>Basic</strong> treats every statement in a
                                justification as relevant. <strong>Minimal</strong> only treats the lowest
                                ranked statements in each justification as relevant, so it can keep more
                                statements than Basic.
                            </p>
                        </ConceptCard>
                    </div>
                </Section>

                {/* Input */}
                <Section
                    id="input"
                    title="Writing a knowledge base"
                    lead="The text area, the file upload and the query builder input."
                >
                    {/* Text area */}
                    <div className="border border-border rounded-lg p-4 mb-3">
                        <h3 className="text-sm font-bold text-foreground mb-2">In the text area</h3>
                        <div className="text-sm text-foreground leading-relaxed space-y-2">
                            <p>
                                Write your formulas on one line, separated by commas.
                                Brackets around each formula are optional, but they make it easier to see
                                where one formula ends and the next begins.
                            </p>
                            <div className="bg-accent border border-border rounded-lg p-3 font-mono text-xs text-blue-800 overflow-x-auto">
                                (bird|~flies),(bird|~wings),(penguin=&gt;bird),(penguin|~!flies)
                            </div>
                            <p className="text-muted-foreground">
                                Spaces are ignored, so <Formula>penguin |~ flies</Formula> is fine. This also
                                applies to spaces inside a name. They are removed, not treated as separators,
                                so <Formula>pen guin</Formula> becomes <Formula>penguin</Formula>.
                            </p>
                        </div>
                    </div>

                    {/* File upload */}
                    <div className="border border-border rounded-lg p-4 mb-3">
                        <h3 className="text-sm font-bold text-foreground mb-2">From a file</h3>
                        <div className="text-sm text-foreground leading-relaxed space-y-2">
                            <p>
                                Upload a <Formula>.txt</Formula> file with{' '}
                                <strong>one formula per line</strong> and no commas.
                            </p>
                            <div className="bg-accent border border-border rounded-lg p-3 font-mono text-xs text-blue-800">
                                (bird|~flies)<br />
                                (bird|~wings)<br />
                                (penguin=&gt;bird)<br />
                                (penguin|~!flies)
                            </div>
                            <p className="text-muted-foreground">
                                Every line is parsed as a formula, including blank lines and comments. If the
                                file contains any invalid syntax, the upload fails with "Invalid knowledge base file".
                            </p>
                        </div>
                    </div>

                    {/* Query */}
                    <div id="query" className="scroll-mt-24 border border-border rounded-lg p-4 mb-3">
                        <h3 className="text-sm font-bold text-foreground mb-2">The query</h3>
                        <div className="text-sm text-foreground leading-relaxed space-y-2">
                            <p>
                                A query asks whether a statement follows from the current knowledge base. It is built
                                from four fields: the antecedent, the relation, the consequent and a checkbox
                                that negates the consequent.
                            </p>
                            <p>
                                <Formula>penguin|~wings</Formula> asks whether penguins typically have wings.
                                Most queries use <Formula>|~</Formula>, because the algorithms are designed to
                                answer questions about what typically follows.
                            </p>
                            <p className="text-muted-foreground">
                                The query builder only accepts <Formula>|~</Formula> and <Formula>=&gt;</Formula>, so{' '}
                                <Formula>&lt;=&gt;</Formula> cannot be used as the relation, but you can still use{' '}
                                <Formula>&amp;&amp;</Formula>, <Formula>||</Formula> and{' '}
                                <Formula>!</Formula> inside the antecedent and consequent.
                            </p>
                        </div>
                    </div>

                    {/* Common errors */}
                    <div className="border border-red-200 bg-red-50 rounded-lg p-4">
                        <h3 className="text-sm font-bold text-red-700 mb-2">Things that will be rejected</h3>
                        <ul className="text-sm text-foreground space-y-2 list-disc pl-5">
                            <li>
                                <strong>Two defeasible implications in one formula.</strong>{' '}
                                <Formula>a|~b|~c</Formula> will not parse, because a formula can contain at
                                most one <Formula>|~</Formula>.
                            </li>
                            <li>
                                <strong>A double negation.</strong> <Formula>!!p</Formula> is rejected.
                                Write <Formula>!(!p)</Formula> instead.
                            </li>
                            <li>
                                <strong>A missing comma.</strong> In the text area,{' '}
                                <Formula>(bird|~flies)(penguin=&gt;bird)</Formula> is read as one formula,
                                which does not parse.
                            </li>
                            <li>
                                <strong>A blank line in an uploaded file.</strong> Every line is parsed, so an
                                empty line fails.
                            </li>
                            <li>
                                <strong>An illegal character in a name.</strong> Names can use upper and lower
                                case letters, digits and underscores, so <Formula>hasWings</Formula> and{' '}
                                <Formula>x_1</Formula> are fine. They cannot contain any of{' '}
                                <Formula>| &amp; ! ( ) &lt; &gt; = ^</Formula>.
                            </li>
                        </ul>
                    </div>
                </Section>
                
                
                {/* Glossary */}
                <Section
                    id="glossary"
                    title="Glossary"
                    lead="Short definitions of terms used in the tool."
                >
                    <dl className="divide-y divide-border">
                        {[
                            {
                                term: 'Antecedent',
                                def: 'The left-hand side of an implication. The "if" part.',
                            },
                            {
                                term: 'Atom',
                                def: 'A single basic statement, written as a name such as bird or penguin.',
                                href: '#atoms',
                            },
                            {
                                term: 'Base rank',
                                def: 'The rank a statement is placed in. Statements about typical cases are in rank 0, and exceptions are in higher ranks.',
                                href: '#concept-baserank',
                            },
                            {
                                term: 'Consequent',
                                def: 'The right-hand side of an implication. The "then" part.',
                            },
                            {
                                term: 'Defeasible implication',
                                def: 'Typically, if ... then ... Written |~. A more specific statement can override it.',
                                href: '#defeasible-implication',
                            },
                            {
                                term: 'Drowning problem',
                                def: 'Rational Closure removing statements that were not involved in a conflict, because they are in the same rank as one that was.',
                                href: '#concept-drowning',
                            },
                            {
                                term: 'Entailment',
                                def: 'A knowledge base entails a formula if every valuation that satisfies the knowledge base also satisfies the formula.',
                            },
                            {
                                term: 'Exceptional',
                                def: 'A formula is exceptional if the materialised knowledge base entails its negation.',
                                href: '#concept-exceptionality',
                            },
                            {
                                term: 'Justification',
                                def: 'A minimal set of statements whose materialisation entails the negation of the antecedent.',
                                href: '#concept-relevant',
                            },
                            {
                                term: 'Knowledge base',
                                def: 'The list of formulas you have entered. Written K.',
                                href: '#concept-kb',
                            },
                            {
                                term: 'Lexicographic Closure',
                                def: 'Removes as few statements from a rank as it needs to, instead of removing the whole rank.',
                                href: '#concept-lexicographic',
                            },
                            {
                                term: 'Materialisation',
                                def: 'Rewriting every |~ as => so that classical entailment can be used.',
                                href: '#concept-materialisation',
                            },
                            {
                                term: 'Monotonic',
                                def: 'A logic is monotonic if adding information never removes a conclusion. Classical logic is monotonic. Defeasible reasoning is not.',
                            },
                            {
                                term: 'Rational Closure',
                                def: 'Removes whole ranks, starting from rank 0, until the antecedent of the query is no longer exceptional.',
                                href: '#concept-rational',
                            },
                            {
                                term: 'Relevant Closure',
                                def: 'Removes ranks in order, but only removes the statements that appear in a justification for the antecedent.',
                                href: '#concept-relevant',
                            },
                            {
                                term: 'Valuation',
                                def: 'An assignment of true or false to every atom.',
                            },
                        ]
                            .sort((a, b) => a.term.localeCompare(b.term))
                            .map((entry) => (
                                <div key={entry.term} className="py-2.5 sm:flex sm:gap-4">
                                    <dt className="text-sm font-semibold text-foreground sm:w-52 sm:shrink-0">
                                        {entry.href ? (
                                            <a href={entry.href} className="text-primary hover:underline">
                                                {entry.term}
                                            </a>
                                        ) : (
                                            entry.term
                                        )}
                                    </dt>
                                    <dd className="text-sm text-muted-foreground">{entry.def}</dd>
                                </div>
                            ))}
                    </dl>
                </Section>
                

                {/* CTA */}
                <div className="flex justify-end mt-4">
                    <Button variant="primary" size="lg" onClick={() => navigate('/')}>
                        Build a knowledge base
                        <ArrowRightIcon className="ml-2 h-4 w-4" />
                    </Button>
                </div>

            </main>

            <Footer />
        </div>
    );
};

export default Info;
