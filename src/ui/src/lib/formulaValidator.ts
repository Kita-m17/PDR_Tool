/**
 * Formula validator for knowledge base entries.
 *
 * Accepts formulas of the shape:
 *   ( LITERAL  CONNECTIVE  LITERAL )
 * The wrapping parentheses are REQUIRED.
 *
 *   (a=>b)
 *   (a|~b)
 *   (!a=>b)
 *   (a=>!b)
 *   (!a|~!b)
 *   (!platypus|~!hat)
 *
 * Where:
 *   LITERAL     = zero or more '!' negations, then an atom
 *   ATOM        = starts with a letter, then letters/digits/underscore
 *   CONNECTIVE  = '=>'  (classical implication)  or  '|~'  (defeasible implication)
 */

export type FormulaType = "classical" | "defeasible";

export interface Literal {
  atom: string;
  negationCount: number; // how many leading '!' were found
}

export interface ParsedFormula {
  valid: true;
  raw: string;
  type: FormulaType;
  antecedent: Literal;
  consequent: Literal;
}

export interface InvalidFormula {
  valid: false;
  raw: string;
  error: string;
}

export type FormulaValidationResult = ParsedFormula | InvalidFormula;

// --- Grammar pieces ---------------------------------------------------------

const ATOM_SOURCE = "[A-Za-z][A-Za-z0-9_]*";
const LITERAL_SOURCE = `!*${ATOM_SOURCE}`;
const CONNECTIVE_SOURCE = "(?:=>|\\|~)";

// Matches the contents that must appear *inside* the required outer parens.
const CAPTURE_REGEX = new RegExp(
  `^(${LITERAL_SOURCE})\\s*(${CONNECTIVE_SOURCE})\\s*(${LITERAL_SOURCE})$`
);

// --- Helpers -----------------------------------------------------------------

function parseLiteral(raw: string): Literal {
  const match = raw.match(/^(!*)([A-Za-z][A-Za-z0-9_]*)$/)!;
  return {
    negationCount: match[1].length,
    atom: match[2],
  };
}

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

  // Confirm the opening '(' actually closes at the final ')', not somewhere
  // in the middle (e.g. "(a=>b)c)" would otherwise slip through).
  let depth = 0;
  for (let i = 0; i < trimmed.length; i++) {
    if (trimmed[i] === "(") depth++;
    if (trimmed[i] === ")") depth--;
    if (depth < 0) {
      return invalid(raw, "Unbalanced parentheses.");
    }
    if (depth === 0 && i !== trimmed.length - 1) {
      return invalid(raw, "Unbalanced parentheses.");
    }
  }

  const inner = trimmed.slice(1, -1).trim();
  const match = inner.match(CAPTURE_REGEX);

  if (!match) {
    return invalid(
      raw,
      "Formula must be of the form '(a=>b)' (classical) or '(a|~b)' " +
        "(defeasible), with optional '!' negation on either side, e.g. " +
        "'(!a=>b)' or '(a|~!b)'."
    );
  }

  const [, antecedentRaw, connective, consequentRaw] = match;

  return {
    valid: true,
    raw,
    type: connective === "=>" ? "classical" : "defeasible",
    antecedent: parseLiteral(antecedentRaw),
    consequent: parseLiteral(consequentRaw),
  };
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
