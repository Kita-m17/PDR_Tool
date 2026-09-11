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

type InvalidFormulaResult = Extract<FormulaValidationResult, { valid: false }>;

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

    React.useEffect(() => {
        const formulas = splitFormulas(inputValue);
        onSubmit(formulas);
        onValidityChange?.(formulas.length > 0 && invalidFormulaResults.length === 0);
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

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await fetch('http://localhost:8080/api/knowledge-base/file', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) throw new Error('Upload failed');

            // const baseRank = await response.json();
            const data = await response.json();
            console.log('Response from file upload:', data);  // ← add this
            console.log('KB:', data.knowledgeBase);  

            // update the textarea with the uploaded KB
            const formulaString = data.knowledgeBase.join(',');
            reset({ input: formulaString });
            onSubmit(data.knowledgeBase);

        } catch (err) {
            console.error('File upload failed', err);
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
                {/* <textarea
                    {...register("input")}
                    className="mt-4 w-full border border-border rounded-lg p-4 font-mono text-sm h-40 resize-y focus:outline-none focus:border-primary"
                    placeholder="e.g. (bird|~flies),(penguin=>bird),(penguin|~!flies)"
                />   */}
                <textarea
                    {...register("input")} disabled={disabled}
                    className={`mt-4 w-full border border-border rounded-lg p-4 font-mono text-sm h-40 resize-y focus:outline-none focus:border-primary ${disabled ? 'bg-accent text-muted-foreground cursor-not-allowed' : ''}`}
                    placeholder="e.g. (bird|~flies),(penguin=>bird),(penguin|~!flies)"
                />

                {errors.input && invalidFormulaResults.length === 0 && (
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
                    Use |~ for defeasible, =&gt; for classical. and ! for negation. Each formula must be wrapped in
                    parentheses, e.g. (a=&gt;b) or (a|~!b).
                </p>

                {/* Buttons */}
                <div className="flex justify-end gap-3 mt-3">
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

                    {showExamples && (
                        <div className ="absolute right-0 top-10 bg-white border border-border rounded-lg shadow-lg z-10 w-64">
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
