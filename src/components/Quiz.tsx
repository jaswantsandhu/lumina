import { useEffect, useRef, useState, type ReactNode } from "react";
import { cx } from "../utils";
import { Alert } from "./Alert";
import { Badge } from "./Badge";
import { Button } from "./Button";

export interface QuizQuestion {
  question: ReactNode;
  options: ReactNode[];
  /** Index of the correct option. */
  answer: number;
  /** Shown after the learner answers, whether they were right or not. */
  explanation?: ReactNode;
}

export interface QuizProps {
  questions: QuizQuestion[];
  /** Called once every question has been answered. */
  onComplete?: (score: number, total: number) => void;
  /** Show a "Try again" button at the end (default true). */
  retry?: boolean;
  className?: string;
}

/** A self-check: one try per question, instant feedback with an explanation, and a score at the end. */
export function Quiz({ questions, onComplete, retry = true, className }: QuizProps) {
  const [picked, setPicked] = useState<Record<number, number>>({});
  const answered = Object.keys(picked).length;
  const scoreOf = (p: Record<number, number>) => questions.filter((q, i) => p[i] === q.answer).length;
  const score = scoreOf(picked);

  // Functional update: several answers given before React re-renders must all count.
  const choose = (qi: number, oi: number) => {
    setPicked((prev) => (prev[qi] !== undefined ? prev : { ...prev, [qi]: oi }));
  };

  // Report completion once, after the last answer lands (not inside the state updater).
  const reported = useRef(false);
  useEffect(() => {
    if (answered === questions.length && questions.length > 0) {
      if (!reported.current) onComplete?.(score, questions.length);
      reported.current = true;
    } else {
      reported.current = false;
    }
  }, [answered, score, questions.length, onComplete]);

  return (
    <div className={cx("lm-quiz", className)}>
      {questions.map((q, qi) => {
        const mine = picked[qi];
        const done = mine !== undefined;
        return (
          <fieldset key={qi} className="lm-quiz__question">
            <legend className="lm-quiz__prompt">
              <span className="lm-quiz__number">{qi + 1}.</span> {q.question}
            </legend>
            <div className="lm-quiz__options">
              {q.options.map((o, oi) => (
                <button
                  key={oi}
                  type="button"
                  className={cx(
                    "lm-quiz__option",
                    done && oi === q.answer && "lm-quiz__option--correct",
                    done && oi === mine && oi !== q.answer && "lm-quiz__option--wrong",
                  )}
                  aria-pressed={mine === oi}
                  disabled={done}
                  onClick={() => choose(qi, oi)}
                >
                  {o}
                </button>
              ))}
            </div>
            {done && (
              <Alert tone={mine === q.answer ? "success" : "warning"} title={mine === q.answer ? "Correct" : "Not quite"}>
                {q.explanation}
              </Alert>
            )}
          </fieldset>
        );
      })}
      {answered === questions.length && questions.length > 0 && (
        <div className="lm-quiz__result" role="status">
          <Badge tone={score === questions.length ? "success" : score >= questions.length / 2 ? "info" : "warning"}>
            Score {score}/{questions.length}
          </Badge>
          {retry && (
            <Button size="sm" variant="ghost" onClick={() => setPicked({})}>
              Try again
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
