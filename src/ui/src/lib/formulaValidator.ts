/**
 * Formula validator for knowledge base entries.
 *
 * Accepts formulas of the shape:
 *   ( TERM  CONNECTIVE  TERM )
 * The wrapping parentheses are REQUIRED.
 *
 *   (a=>b)
 *   (a|~b)
 *   (!a=>b)
 *   (a=>!b)
 *   (!a|~!b)
 *   (!platypus|~!hat)
 *   ((bird&&!flies)=>canFly)
 *   (penguin|~(!flies||swims))
 *   (a|~((b&&c)||!(d&&e)))
 *
 * Where:
 *   TERM        = a LITERAL, or '!'* followed by a parenthesised
 *                 (TERM BINOP TERM) group. This lets '&&'/'||' combine
 *                 literals - and further groups - into a compound
 *                 antecedent/consequent, as long as every '&&'/'||' pairing
 *                 is wrapped in its own parentheses so the grouping is
 *                 unambiguous.
 *   LITERAL     = zero or more '!' negations, then an atom
 *   ATOM        = starts with a letter, then letters/digits/underscore
 *   CONNECTIVE  = '=>'  (classical implication)  or  '|~'  (defeasible
 *                 implication) - exactly one, and only at the outermost
 *                 level (it can't appear inside a '&&'/'||' group).
 *   BINOP       = '&&'  (conjunction)  or  '||'  (disjunction)
 */

export type FormulaType = "classical" | "defeasible";

/** A bare (possibly negated) atom, e.g. `flies` or `!flies`. */
export interface LiteralTerm {
  kind: "literal";
  negationCount: number; // how many leading '!' were found
  atom: string;
}

/**
 * A (possibly negated) '&&'/'||' group, e.g. `(bird&&!flies)` or
 * `!(bird&&!flies)`. `left`/`right` are themselves TERMs, so groups nest
 * to any depth as long as each is parenthesised, e.g. `((a&&b)||!c)`.
 */
export interface CompoundTerm {
  kind: "compound";
  negationCount: number;
  op: "and" | "or";
  left: Term;
  right: Term;
}

export type Term = LiteralTerm | CompoundTerm;

/** @deprecated Use `LiteralTerm` (or the general `Term`) instead. */
export type Literal = LiteralTerm;

export interface ParsedFormula {
  valid: true;
  raw: string;
  type: FormulaType;
  antecedent: Term;
  consequent: Term;
}

export interface InvalidFormula {
  valid: false;
  raw: string;
  error: string;
}

export type FormulaValidationResult = ParsedFormula | InvalidFormula;

// --- Grammar pieces ---------------------------------------------------------

const ATOM_SOURCE = "[A-Za-z][A-Za-z0-9_]*";
const ATOM_REGEX = new RegExp(`^${ATOM_SOURCE}`);

const CONNECTIVES: ReadonlyArray<{ symbol: string; type: FormulaType }> = [
  { symbol: "=>", type: "classical" },
  { symbol: "|~", type: "defeasible" },
];

const BINOPS: ReadonlyArray<{ symbol: string; op: "and" | "or" }> = [
  { symbol: "&&", op: "and" },
  { symbol: "||", op: "or" },
];

// --- Recursive-descent parser ------------------------------------------------
//
// The grammar is recursive (a '&&'/'||' group can itself contain further
// groups), so a hand-written parser over a position cursor is clearer here
// than trying to stretch a single regex to cover arbitrary nesting.

class FormulaParseError extends Error {}

interface Cursor {
  readonly text: string;
  pos: number;
}

function peek(c: Cursor): string | undefined {
  return c.text[c.pos];
}

function skipSpaces(c: Cursor): void {
  while (c.pos < c.text.length && /\s/.test(c.text[c.pos])) {
    c.pos++;
  }
}

function tryConsume(c: Cursor, symbol: string): boolean {
  if (c.text.startsWith(symbol, c.pos)) {
    c.pos += symbol.length;
    return true;
  }
  return false;
}

/** Parses a TERM: optional '!'s, then either an atom or a parenthesised '&&'/'||' group. */
function parseTerm(c: Cursor): Term {
  let negationCount = 0;
  while (peek(c) === "!") {
    negationCount++;
    c.pos++;
  }

  if (peek(c) === "(") {
    c.pos++; // consume '('
    skipSpaces(c);
    const left = parseTerm(c);
    skipSpaces(c);

    const binop = BINOPS.find((b) => tryConsume(c, b.symbol));
    if (!binop) {
      throw new FormulaParseError(
        `Expected '&&' or '||' at position ${c.pos}.`
      );
    }

    skipSpaces(c);
    const right = parseTerm(c);
    skipSpaces(c);

    if (!tryConsume(c, ")")) {
      throw new FormulaParseError(
        `Expected ')' to close the group at position ${c.pos}.`
      );
    }

    return { kind: "compound", negationCount, op: binop.op, left, right };
  }

  const match = ATOM_REGEX.exec(c.text.slice(c.pos));
  if (!match) {
    throw new FormulaParseError(
      negationCount > 0
        ? `Expected an atom or a parenthesised '&&'/'||' group after '!' at position ${c.pos}.`
        : `Expected an atom or a parenthesised '&&'/'||' group at position ${c.pos}.`
    );
  }

  const atom = match[0];
  c.pos += atom.length;
  return { kind: "literal", negationCount, atom };
}

function parseFormulaBody(
  text: string
): { type: FormulaType; antecedent: Term; consequent: Term } {
  const c: Cursor = { text, pos: 0 };

  if (!tryConsume(c, "(")) {
    throw new FormulaParseError("Formula must be wrapped in parentheses.");
  }

  skipSpaces(c);
  const antecedent = parseTerm(c);
  skipSpaces(c);

  const connective = CONNECTIVES.find((conn) => tryConsume(c, conn.symbol));
  if (!connective) {
    throw new FormulaParseError(`Expected '=>' or '|~' at position ${c.pos}.`);
  }

  skipSpaces(c);
  const consequent = parseTerm(c);
  skipSpaces(c);

  if (!tryConsume(c, ")")) {
    throw new FormulaParseError(
      `Expected ')' at position ${c.pos}, or unbalanced parentheses.`
    );
  }

  if (c.pos !== text.length) {
    throw new FormulaParseError(
      `Unexpected characters after the closing ')' at position ${c.pos}.`
    );
  }

  return { type: connective.type, antecedent, consequent };
}

// --- Helpers -----------------------------------------------------------------

function invalid(raw: string, error: string): InvalidFormula {
  return { valid: false, raw, error };
}

// --- Public API ----------------------------------------------------------

/**
 * Validates and parses a single formula string entered by the user.
 * Outer parentheses are mandatory.
 */
export function validateFormula(input: string): FormulaValidationResult {
  const raw = input;
  const trimmed = input.trim();

  if (trimmed.length === 0) {
    return invalid(raw, "Formula is empty.");
  }

  if (!trimmed.startsWith("(") || !trimmed.endsWith(")")) {
    return invalid(
      raw,
      "Formula must be wrapped in parentheses, e.g. '(a=>b)' or '(a|~b)'."
    );
  }

  try {
    const { type, antecedent, consequent } = parseFormulaBody(trimmed);
    return { valid: true, raw, type, antecedent, consequent };
  } catch (e) {
    const message =
      e instanceof FormulaParseError
        ? e.message
        : "Formula must be of the form '(a=>b)' (classical) or '(a|~b)' " +
          "(defeasible), with optional '!' negation, e.g. '(!a=>b)' or " +
          "'(a|~!b)'. Combine terms with '&&' or '||', keeping each " +
          "group in its own parentheses, e.g. '((a&&b)=>c)' or " +
          "'(a|~(b||!c))'.";
    return invalid(raw, message);
  }
}

/**
 * Convenience boolean check, e.g. for disabling a submit button.
 */
export function isValidFormula(input: string): boolean {
  return validateFormula(input).valid;
}

/**
 * Validates every formula in a knowledge base (already split into individual
 * formula strings) and reports back which ones are valid/invalid.
 */
export function validateKnowledgeBase(
  formulas: string[]
): FormulaValidationResult[] {
  return formulas.map(validateFormula);
}

/**
 * Convenience check for a whole knowledge base: true only if every formula
 * parses successfully (and there is at least one formula).
 */
export function isValidKnowledgeBase(formulas: string[]): boolean {
  return formulas.length > 0 && formulas.every(isValidFormula);
}
