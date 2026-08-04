import { makeAssistantToolUI } from "@assistant-ui/react";
import { useState, useRef, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { CheckIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

type OptionItem = {
  label: string;
  description?: string;
};

type Args = {
  question: string;
  stepIndicator?: string;
  options?: OptionItem[];
  multiSelect?: boolean;
  allowTextInput?: boolean;
};

type ViewProps = Args & {
  addResult: (result: string | string[]) => void;
  isSubmitted: boolean;
};

function InteractiveQuestionToolView({
  question,
  stepIndicator,
  options,
  multiSelect,
  allowTextInput,
  addResult,
  isSubmitted,
}: ViewProps) {
  const [selected, setSelected] = useState<string[]>([]);
  const [textInput, setTextInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSelect = (optLabel: string) => {
    if (multiSelect) {
      setSelected(prev => prev.includes(optLabel) ? prev.filter(o => o !== optLabel) : [...prev, optLabel]);
    } else {
      addResult(optLabel);
    }
  };

  const handleSubmit = () => {
    if (textInput.trim() !== "") {
      addResult(multiSelect ? [...selected, textInput] : textInput);
    } else {
      addResult(multiSelect ? selected : selected[0] || "");
    }
  };

  const handleSkip = () => {
    addResult("Skipped");
  };

  const totalOptions = (options?.length || 0) + (allowTextInput ? 1 : 0);

  return (
    <div className="flex flex-col w-full max-w-2xl my-4">
      <div className="border border-border bg-card rounded-xl overflow-hidden shadow-sm">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border bg-muted/20">
          <h4 className="font-semibold text-[15px] text-foreground">{question}</h4>
          {stepIndicator && (
            <span className="text-xs font-medium text-muted-foreground">{stepIndicator}</span>
          )}
        </div>

        {/* Options List */}
        <div className="flex flex-col">
          {options?.map((opt, idx) => {
            const isSelected = selected.includes(opt.label);
            return (
              <button
                key={opt.label}
                onClick={() => handleSelect(opt.label)}
                disabled={isSubmitted}
                className={cn(
                  "flex items-center justify-between p-4 text-left border-b border-border transition-colors outline-none",
                  isSelected ? "bg-accent/40" : "bg-card hover:bg-muted/40",
                  isSubmitted && "opacity-70 cursor-not-allowed"
                )}
              >
                <div className="flex flex-col gap-0.5">
                  <span className="font-medium text-[14px] text-foreground">{opt.label}</span>
                  {opt.description && (
                    <span className="text-[13px] text-muted-foreground">{opt.description}</span>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  {multiSelect && isSelected && <CheckIcon className="size-4 text-primary" />}
                  <div className="flex items-center justify-center size-6 rounded bg-muted text-[11px] font-semibold text-muted-foreground">
                    {idx + 1}
                  </div>
                </div>
              </button>
            );
          })}

          {/* Text Input Option */}
          {allowTextInput && (
            <div
              className={cn(
                "flex items-center justify-between p-4 text-left transition-colors cursor-text border-b border-border last:border-b-0",
                isTyping || textInput ? "bg-accent/20" : "bg-card hover:bg-muted/40",
                isSubmitted && "opacity-70 cursor-not-allowed"
              )}
              onClick={() => !isSubmitted && inputRef.current?.focus()}
            >
              <input
                ref={inputRef}
                type="text"
                placeholder="Type something else..."
                value={textInput}
                onChange={e => setTextInput(e.target.value)}
                onFocus={() => setIsTyping(true)}
                onBlur={() => setIsTyping(false)}
                disabled={isSubmitted}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit();
                  }
                }}
                className="w-full bg-transparent border-none outline-none text-[14px] font-medium placeholder:font-normal placeholder:text-muted-foreground disabled:cursor-not-allowed"
              />
              <div className="flex items-center justify-center size-6 shrink-0 rounded bg-muted text-[11px] font-semibold text-muted-foreground ml-3">
                {totalOptions}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Action Bar */}
      {!isSubmitted ? (
        <div className="flex items-center justify-between mt-3 px-1">
          <Button variant="outline" size="sm" onClick={handleSkip} className="h-8 text-xs font-medium px-4 shadow-sm bg-card hover:bg-muted text-muted-foreground border-border/80">
            Skip
          </Button>

          {multiSelect && (
            <Button
              onClick={handleSubmit}
              disabled={selected.length === 0 && textInput.trim() === ""}
              size="sm"
              className="h-8 text-xs font-medium px-4 shadow-sm"
            >
              Submit
            </Button>
          )}
        </div>
      ) : (
        <div className="flex items-center gap-1.5 mt-3 px-2 text-xs font-medium text-muted-foreground">
          <CheckIcon className="size-3.5 text-green-500" />
          Response submitted
        </div>
      )}
    </div>
  );
}

export const InteractiveQuestionTool = makeAssistantToolUI<Args, string | string[]>({
  toolName: "ask_user",
  render: ({ args, addResult, status }) => {
    const view: ReactNode = (
      <InteractiveQuestionToolView
        {...args}
        addResult={addResult}
        isSubmitted={status.type === "complete"}
      />
    );
    return view;
  }
});
