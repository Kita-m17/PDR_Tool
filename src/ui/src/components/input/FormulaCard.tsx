import React, {useState} from "react";
import { Button } from "../ui/Buttons";
import { UploadIcon, TriangleDownIcon} from "@radix-ui/react-icons";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const kbSchema = z.object({
    input: z.string().min(1, "Knowledge base cannot be empty").refine(
        (val) => val.includes("~|") || val.includes("=>"),
        "Must contain at least one defeasible (~|) or classical (=>) statement"
    ),
});

type KBFormValues = z.infer<typeof kbSchema>;

interface FormulaCardProps {
    onSubmit: (formulas: string[]) => void;
    defaultValue?:string;
}

const FormulaCard: React.FC<FormulaCardProps> = ({ onSubmit, defaultValue }) => {
    const { register, handleSubmit, watch, reset, formState: { errors } } = useForm<KBFormValues>({
        resolver: zodResolver(kbSchema),
        defaultValues: {
            input: defaultValue || '(bird~|flies),(penguin=>bird),(penguin~|!flies)'
        }
    });

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

    return (
        <div className = "mb-8">
            <h2 className = "text-xl font-bold text-foreground mb-1">
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
                    // value={input}
                    // onChange={(e) => setInput(e.target.value)}
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
                    <Button variant="outline" size="default"  onClick={() => {}}>
                        <UploadIcon className="mr-2 h-4 w-4" />
                        Upload
                    </Button>

                    <Button variant="outline" size="default" onClick={() => {}}>
                        Load Example 
                        <TriangleDownIcon className="ml-2 h-4 w-4" />
                    </Button>
                </div>
            </form>
        </div>
    );
};

export default FormulaCard;