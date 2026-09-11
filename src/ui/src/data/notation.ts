/*
 * File: notation.ts
 * Author: Samukelisiwe Zwane (2026 Honours Project, University of Cape Town)
 * Status: Original work.
 * Context: Connective definitions for the info page.
 * Purpose: Educational use only.
 */

export interface Connective {
    id: string;
    tex: string;
    typed: string;
    name: string;
    plain: string;
    detail: string;
    example: { typed: string; tex: string; gloss: string };
    /** Highlights the row. Reserved for the defeasible implication. */
    emphasis?: boolean;
    rare?: boolean;
}

export const CONNECTIVES: Connective[] = [
    {
        id: 'atoms',
        tex: 'p,\\; q,\\; r,\\; \\ldots',
        typed: 'bird',
        name: 'Atom',
        plain: 'A basic statement that is either true or false.',
        detail:
            'Every other formula is built from atoms. Use names that describe what they stand for, such as bird, penguin and flies. A name can use upper and lower case letters, digits and underscores, so hasWings and x_1 are both valid. It cannot contain spaces or any of the connective symbols.',
        example: {
            typed: 'penguin',
            tex: 'penguin',
            gloss: 'it is a penguin',
        },
    },
    {
        id: 'negation',
        tex: '\\neg p',
        typed: '!',
        name: 'Negation',
        plain: 'Not. Changes true to false and false to true.',
        detail:
            'Write ! directly before the formula you want to negate.',
        example: {
            typed: '!flies',
            tex: '\\neg flies',
            gloss: 'it does not fly',
        },
    },
    {
        id: 'conjunction',
        tex: 'p \\land q',
        typed: '&&',
        name: 'Conjunction',
        plain: 'And. True only when both sides are true.',
        detail:
            'Use it when two conditions must hold at the same time. If a conjunction is part of a larger formula, put it in brackets so that it is grouped correctly.',
        example: {
            typed: '(bird&&!flies)',
            tex: 'bird \\land \\neg flies',
            gloss: 'a bird that does not fly',
        },
    },
    {
        id: 'disjunction',
        tex: 'p \\lor q',
        typed: '||',
        name: 'Disjunction',
        plain: 'Or. True when at least one side is true.',
        detail:
            'This is inclusive or, so it is also true when both sides are true. To say that exactly one side is true, write ((p||q)&&!(p&&q)).',
        example: {
            typed: '(flies||swims)',
            tex: 'flies \\lor swims',
            gloss: 'it flies, or it swims, or it does both',
        },
    },
    {
        id: 'implication',
        tex: 'p \\to q',
        typed: '=>',
        name: 'Material implication',
        plain: 'If ... then ..., with no exceptions.',
        detail:
            'It is false only when the left side is true and the right side is false. Statements written with => are never removed when the tool resolves a conflict and are treated as classical statements',
        example: {
            typed: '(penguin=>bird)',
            tex: 'penguin \\to bird',
            gloss: 'every penguin is a bird',
        },
    },
    {
        id: 'equivalence',
        tex: 'p \\leftrightarrow q',
        typed: '<=>',
        name: 'Equivalence',
        plain: 'If and only if. True when both sides have the same truth value.',
        detail:
            'Writing p<=>q is the same as writing ((p=>q)&&(q=>p)). You can use it in the knowledge base, however it is not offered as a relation in the query builder.',
        example: {
            typed: '(bird<=>hasFeathers)',
            tex: 'bird \\leftrightarrow hasFeathers',
            gloss: 'something is a bird exactly when it has feathers',
        },
    },
    {
        id: 'defeasible-implication',
        tex: 'p \\vsim q',
        typed: '|~',
        name: 'Defeasible implication',
        plain: 'Typically, if ... then ... A more specific statement can override it.',
        detail:
            'It describes what normally holds. If the knowledge base also says that penguins typically do not fly, the tool uses that statement for penguins and still concludes that birds typically fly. Type it as a vertical bar followed by a tilde. A formula can contain at most one |~, and it cannot be used inside another connective, as in (a|~b)&&c.',
        example: {
            typed: '(bird|~flies)',
            tex: 'bird \\vsim flies',
            gloss: 'birds typically fly',
        },
        emphasis: true,
    },
    {
        id: 'tautology',
        tex: '\\top',
        typed: '+',
        name: 'Tautology',
        plain: 'Always true.',
        detail:
            'It is mainly used as a placeholder on one side of an implication.',
        example: {
            typed: '(bird=>+)',
            tex: 'bird \\to \\top',
            gloss: 'true whether or not it is a bird',
        },
        rare: true,
    },
    {
        id: 'contradiction',
        tex: '\\bot',
        typed: '-',
        name: 'Contradiction',
        plain: 'Always false.',
        detail:
            'When the tool checks whether a statement is exceptional, it is checking whether the antecedent of that statement, together with the knowledge base, leads to a contradiction. The - symbol only means contradiction when it stands on its own. If you write it between two atoms, as in a-b, the parser reads a-b as a single atom.',
        example: {
            typed: '(penguin&&flies)=>-',
            tex: '(penguin \\land flies) \\to \\bot',
            gloss: 'a flying penguin is impossible',
        },
        rare: true,
    },
];

/** The connectives shown in the main body of the table. */
export const CORE_CONNECTIVES = CONNECTIVES.filter((c) => !c.rare);

/** Tautology and contradiction, shown in a de-emphasised group at the end. */
export const RARE_CONNECTIVES = CONNECTIVES.filter((c) => c.rare);