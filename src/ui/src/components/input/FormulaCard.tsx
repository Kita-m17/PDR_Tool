import React, {useState} from "react";
import { Button } from "../ui/Buttons";
import { UploadIcon, TriangleDownIcon} from "@radix-ui/react-icons";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { EXAMPLES } from '../../api/examples';

const kbSchema = z.object({
    input: z.string().min(1, "Knowledge base cannot be empty").refine(
        (val) => val.includes("~|") || val.includes("=>"),
        "Must contain at least one defeasible (~|) or classical (=>) statement"
    ),
});

type KBFormValues = z.infer<typeof kbSchema>;

interface FormulaCardProps {
    onSubmit: (formulas: string[]) => void;
    defaultValue?: string;
    onLoadExample?: (formulas: string[], query: string, algorithm: string) => void;
}

const FormulaCard: React.FC<FormulaCardProps> = ({ onSubmit, defaultValue, onLoadExample }) => {
    const { register, handleSubmit, watch, reset, formState: { errors } } = useForm<KBFormValues>({
        resolver: zodResolver(kbSchema),
        defaultValues: {
            input: defaultValue || '(bird~|flies),(penguin=>bird),(penguin~|!flies)'
        }
    });

    const [showExamples, setShowExamples] = useState(false);

    const fileInputRef = React.useRef<HTMLInputElement>(null);

    // watch the input and update parent on every change
    const inputValue = watch('input');
    React.useEffect(() => {
        const formulas = inputValue.split(',').map(f => f.trim()).filter(f => f.length > 0);
        onSubmit(formulas);
    }, [inputValue, onSubmit]);

    React.useEffect(() => {
        reset({ input: defaultValue || '(bird~|flies),(penguin=>bird),(penguin~|!flies)' });
    }, [defaultValue, reset]);

    {/* Ensure user inputs a valid KB */}
    const onValid = (data: KBFormValues) => {
        const formulas = data.input.split(',').map(f => f.trim()).filter(f => f.length > 0);
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
                <span className="ml-2 text-blue-700 cursor-pointer">ⓘ</span>
            </h2>
            
            <p className="text-muted-foreground text-sm mb-3">
                Enter your knowledge base in the text area below, or upload a file, or load an example.
            </p>

            {/* Textarea for input */}
            <form onSubmit={handleSubmit(onValid)}>
                <textarea 
                    {...register("input")}
                    className="mt-4 w-full border border-border rounded-lg p-4 font-mono text-sm h-40 resize-y focus:outline-none focus:border-primary"
                    placeholder="e.g. (bird~|flies),(penguin=>bird),(penguin~|!flies)"
                />  

                {errors.input && (
                    <p className="text-red-500 text-xs mt-1">{errors.input.message}</p>
                )}

                {/* Helper text */}
                <p className = "text-sm text-muted-foreground mt-2">
                    Use ~| for defeasible, =&gt; for classical. and ! for negation.
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
                                        onLoadExample?.(example.formulas, example.query, example.algorithm);
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