"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Exercise, Question } from "@/lib/content/schema";

/** The letter or numeral an option is chosen by. "vi  Cooling as the main
 *  reason" is picked as "vi". */
export function optionLabel(option: string): string {
  return /^([ivxlcdm]+|[A-H])\b/i.exec(option.trim())?.[1] ?? option.trim();
}

const CHOICE_SETS: Partial<Record<Exercise["kind"], string[]>> = {
  tfng: ["TRUE", "FALSE", "NOT GIVEN"],
  ynng: ["YES", "NO", "NOT GIVEN"],
};

export function QuestionInput({
  exercise,
  question,
  value,
  onChange,
  disabled,
}: {
  exercise: Exercise;
  question: Question;
  value: string;
  onChange: (value: string) => void;
  disabled: boolean;
}) {
  const inputId = `${exercise.id}-q${question.n}`;
  // Every control is named by its question number, so that a student
  // moving by keyboard or screen reader always knows which one they are on.
  const accessibleName = `Question ${question.n}`;

  if (exercise.kind === "mcq" && question.choices) {
    return (
      <fieldset className="mt-3" disabled={disabled}>
        <legend className="sr-only">{accessibleName}</legend>
        <RadioGroup value={value} onValueChange={onChange} className="gap-2">
          {question.choices.map((choice) => {
            const id = `${inputId}-${choice.id}`;
            return (
              <div key={choice.id} className="flex items-start gap-2">
                <RadioGroupItem
                  id={id}
                  value={choice.id}
                  className="mt-1 shrink-0"
                />
                <Label htmlFor={id} className="font-normal leading-snug">
                  <span className="text-ink-muted">{choice.id}</span>
                  <span>{choice.text}</span>
                </Label>
              </div>
            );
          })}
        </RadioGroup>
      </fieldset>
    );
  }

  const choices =
    CHOICE_SETS[exercise.kind] ??
    (exercise.kind === "headings" ? exercise.options : undefined);

  if (choices) {
    return (
      <div className="mt-3">
        <Label htmlFor={inputId} className="sr-only">
          {accessibleName}
        </Label>
        <Select value={value} onValueChange={onChange} disabled={disabled}>
          <SelectTrigger id={inputId} className="w-full sm:w-80">
            <SelectValue placeholder="Choose…" />
          </SelectTrigger>
          <SelectContent>
            {choices.map((choice) => (
              <SelectItem key={choice} value={optionLabel(choice)}>
                {choice}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    );
  }

  return (
    <div className="mt-3">
      <Label htmlFor={inputId} className="sr-only">
        {accessibleName}
      </Label>
      <Input
        id={inputId}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        disabled={disabled}
        autoComplete="off"
        autoCapitalize="characters"
        spellCheck={false}
        placeholder={
          exercise.kind === "matching" ? "Letter" : "Your answer"
        }
        className={exercise.kind === "matching" ? "w-24" : "w-full sm:w-80"}
      />
    </div>
  );
}
