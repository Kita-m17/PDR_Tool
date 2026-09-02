import { ComponentPropsWithoutRef, ReactElement, ElementType } from "react";
import TeX from "@matejmazur/react-katex";
import { ParseError, KatexOptions } from "katex";

type TeXProps = ComponentPropsWithoutRef<"div"> &
  Partial<{
    as: ElementType;
    math: string | number;
    block: boolean;
    errorColor: string;
    renderError: (error: ParseError | TypeError) => ReactElement;
    settings: KatexOptions;
  }>;

const defaultSettings: KatexOptions = {
  macros: {
    "\\vsim": "\\;{{\\Large\\shortmid}\\mkern-9mu\\sim}\\;",
    "\\vapprox": "\\;{{\\mid}\\mkern-8.75mu\\approx}\\;",
    "\\nvapprox": "\\;{\\not\\mkern-5mu{{\\mid}\\mkern-8.75mu\\approx}}\\;",
    "*": "\\mathcal{E}",
  },
};

export function TexFormula(props: TeXProps) {
  const mergedSettings = { ...defaultSettings, ...props.settings };

  return <TeX {...props} settings={mergedSettings} />;
}
