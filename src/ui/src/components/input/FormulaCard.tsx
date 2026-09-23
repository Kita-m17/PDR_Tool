/**
 * File: FormulaCard.tsx
 * Original Authors: Nikita Martin (2026 PDR Honours Project - University of Cape Town)
 * Context: React component to collect the KB from input
 * Purpose: Educational use only.
 */

import React, {useState} from "react";
import { Button } from "../ui/Buttons";
import { UploadIcon, TriangleDownIcon} from "@radix-ui/react-icons";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { EXAMPLES } from '../../api/examples';
import { validateFormula, type FormulaValidationResult } from "../../lib/formulaValidator";

// Splits the raw textarea contents into individual formula strings the same
// way everywhere: comma separated, trimmed, blanks dropped.
function splitFormulas(input: string): string[] {
    return input.split(',').map((f) => f.trim()).filter((f) => f.length > 0);
}

// Upper bound on knowledge base size (keeps justification search responsive).
export const MAX_KB_STATEMENTS = 30;

type InvalidFormulaResult = Extract<FormulaValidationResult, { valid: false }>;

// Whole-textarea validation: catches "empty" up front, then runs each formula through validateFormula and reports the first failure (or a count, if more than one) as the field-level error message.
const kbSchema = z.object({
    input: z.string().min(1, "Knowledge base cannot be empty").superRefine((val, ctx) => {
        const formulas = splitFormulas(val);

        if (formulas.length === 0) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Knowledge base cannot be empty",
            });
            return;
        }

        if (formulas.length > MAX_KB_STATEMENTS) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: `Maximum ${MAX_KB_STATEMENTS} statements (${formulas.length} entered).`,
            });
            return;
        }

        const invalidFormulas = formulas
            .map((f) => validateFormula(f))
            .filter((result): result is InvalidFormulaResult => !result.valid);

        if (invalidFormulas.length > 0) {
            const [first, ...rest] = invalidFormulas;
            const message = rest.length === 0
                ? `"${first.raw}" is not a valid formula: ${first.error}`
                : `${invalidFormulas.length} formulas are invalid, starting with "${first.raw}": ${first.error}`;
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message,
            });
        }
    }),
});

type KBFormValues = z.infer<typeof kbSchema>;

interface FormulaCardProps {
    onSubmit: (formulas: string[]) => void;
    defaultValue?: string;
    onLoadExample?: (formulas: string[], query: string, algorithm: string, label: string) => void;

    onValidityChange?: (valid: boolean) => void;
    disabled?: boolean;
}

const FormulaCard: React.FC<FormulaCardProps> = ({ onSubmit, defaultValue, onLoadExample, onValidityChange,disabled }) => {
    const { register, handleSubmit, watch, reset, formState: { errors } } = useForm<KBFormValues>({
        resolver: zodResolver(kbSchema),
        mode: "onChange",
        defaultValues: {
            input: defaultValue || '(bird|~flies),(penguin=>bird),(penguin|~!flies)'
        }
    });

    const [showExamples, setShowExamples] = useState(false);

    const fileInputRef = React.useRef<HTMLInputElement>(null);

    // watch the input and update parent on every change
    const inputValue = watch('input');

    // Per-formula validation, recomputed on every keystroke. This drives
    // formula-by-formula feedback (which formula is wrong and why) rather
    // than a single pass/fail verdict for the whole textarea.
    const formulaResults = React.useMemo(
        () => splitFormulas(inputValue).map((raw) => ({ raw, result: validateFormula(raw) })),
        [inputValue]
    );
    const invalidFormulaResults = formulaResults.filter(
        (f): f is { raw: string; result: InvalidFormulaResult } => !f.result.valid
    );

    const statementCount = formulaResults.length;
    const tooManyStatements = statementCount > MAX_KB_STATEMENTS;

    React.useEffect(() => {
        const formulas = splitFormulas(inputValue);
        onSubmit(formulas);
        onValidityChange?.(formulas.length > 0 && formulas.length <= MAX_KB_STATEMENTS && invalidFormulaResults.length === 0);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [inputValue, onSubmit, onValidityChange, invalidFormulaResults.length]);

    React.useEffect(() => {
        reset({ input: defaultValue || '(bird|~flies),(penguin=>bird),(penguin|~!flies)' });
    }, [defaultValue, reset]);

    {/* Ensure user inputs a valid KB */}
    const onValid = (data: KBFormValues) => {
        const formulas = splitFormulas(data.input);
        onSubmit(formulas);
    };

    // Reads the uploaded .txt file in the browser (one formula per line, the
    // same format the backend's file parser used) and drops the formulas into
    // the textarea. No backend call: the knowledge base is sent along with the
    // query when the user evaluates, and the per-formula validation below
    // reports any malformed lines straight away.
    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const input = e.target;
        const file = input.files?.[0];
        if (!file) return;

        try {
            const text = await file.text();
            const formulas = text
                .replace(/^\uFEFF/, '') // strip a UTF-8 byte order mark if present
                .split(/\r?\n/)
                .map((line) => line.trim())
                .filter((line) => line.length > 0);

            if (formulas.length === 0) throw new Error('File contains no formulas');

            // update the textarea with the uploaded KB
            reset({ input: formulas.join(',') });
            onSubmit(formulas);

        } catch (err) {
            console.error('File upload failed', err);
        } finally {
            // allow re-selecting the same file
            input.value = '';
        }
    };

    return (
        <div className = "mb-8">
            <h2 className = "text-primary font-semibold mb-3">
                1. Knowledge Base, <span className="italic">K</span>
                <Link
                    to="/info#input"
                    title="How to write a knowledge base"
                    aria-label="How to write a knowledge base"
                    className="ml-2 text-blue-700 hover:text-primary transition-colors"
                >
                    ⓘ
                </Link>
            </h2>
            
            <p className="text-muted-foreground text-sm mb-3">
                Enter your knowledge base in the text area below, or upload a file, or load an example.
            </p>

            {/* Textarea for input */}
            <form onSubmit={handleSubmit(onValid)}>
                <textarea
                    {...register("input")} disabled={disabled}
                    className={`mt-4 w-full border border-border rounded-lg p-4 font-mono text-sm h-40 resize-y focus:outline-none focus:border-primary ${disabled ? 'bg-accent text-muted-foreground cursor-not-allowed' : ''}`}
                    placeholder="e.g. (bird|~flies),(penguin=>bird),(penguin|~!flies)"
                />

                {tooManyStatements && (
                    <p className="text-red-500 text-xs mt-1">
                        Maximum {MAX_KB_STATEMENTS} statements ({statementCount} entered).
                    </p>
                )}

                {errors.input && invalidFormulaResults.length === 0 && !tooManyStatements && (
                    <p className="text-red-500 text-xs mt-1">{errors.input.message}</p>
                )}

                {/* Per-formula validation feedback: exactly which formula(s) are malformed and why. */}
                {invalidFormulaResults.length > 0 && (
                    <ul className="mt-1 space-y-0.5">
                        {invalidFormulaResults.map(({ raw, result }, i) => (
                            <li key={`${raw}-${i}`} className="text-red-500 text-xs">
                                <span className="font-mono">{raw}</span>: {result.error}
                            </li>
                        ))}
                    </ul>
                )}

                {/* Helper text */}
                <p className = "text-sm text-muted-foreground mt-2">
                    Use |~ for defeasible, =&gt; for classical, ! for negation, &amp;&amp; for and, and || for or.
                    Each formula must be wrapped in parentheses, e.g. (a=&gt;b) or (a|~!b). Combine terms with
                    &amp;&amp; or || by giving each group its own parentheses, e.g. ((a&amp;&amp;b)=&gt;c) or (a|~(b||!c)).{" "}
                    <span className="font-semibold text-orange-600">
                        Max {MAX_KB_STATEMENTS} statements
                    </span>
                </p>

                {/* Buttons */}
                <div className="relative flex flex-wrap justify-end gap-3 mt-3">
                    {/* Hidden file input */}
                    <input
                        type="file"
                        accept=".txt"
                        className="hidden"
                        ref={fileInputRef}
                        onChange={handleFileUpload}
                    />

                    <Button variant="outline" size="default" type="button" onClick={() => fileInputRef.current?.click()}>
                        <UploadIcon className="mr-2 h-4 w-4" />
                        Upload
                    </Button>

                    <Button variant="outline" size="default" type="button" onClick={() => setShowExamples(!showExamples)}>
                        Load Example 
                        <TriangleDownIcon className="ml-2 h-4 w-4" />
                    </Button>

                    {/* Show example tab - shown when the load example tab is open */}
                    {showExamples && (
                        <div className ="absolute right-0 top-10 bg-white border border-border rounded-lg shadow-lg z-10 w-64 max-w-[calc(100vw-2rem)]">
                            {EXAMPLES.map((example) => (
                                <button key={example.label} className="w-full text-left px-4 py-3 hover:bg-accent text-sm border-b border-border last:border-0" type="button"
                                    onClick={() => {
                                    const formulaString = example.formulas.join(',');
                                    reset({ input: formulaString });
                                    onSubmit(example.formulas);
                                    onLoadExample?.(example.formulas, example.query, example.algorithm, example.label);
                                    setShowExamples(false);
                                }}
                                >
                                    <p className="font-medium text-foreground">{example.label}</p>
                                    <p className="text-xs text-muted-foreground mt-0.5">{example.description}</p>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </form>
        </div>
    );
};

export default FormulaCard;
