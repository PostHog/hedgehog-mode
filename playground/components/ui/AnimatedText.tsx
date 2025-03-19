import { GameUIAnimatedTextProps } from "@posthog/hedgehog-mode";
import { useEffect } from "react";

export function AnimatedText({
  words,
  duration = 1000,
  disableAnimation = false,
  onComplete,
}: GameUIAnimatedTextProps) {
  let letterIndex = 0;
  const lettersCount = words.reduce((acc, word) => {
    return acc + (typeof word === "string" ? word.length : word.text.length);
  }, 0);

  const letterDelay = duration / lettersCount;

  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete?.();
    }, duration);
    return () => clearTimeout(timer);
  }, []);

  return (
    <p className="font-medium text-sm">
      {words.map((word) => {
        const subwords =
          typeof word === "string" ? word.split(" ") : word.text.split(" ");

        return subwords.map((subword, index) => {
          const letters = subword.split("");
          return (
            <span
              key={index}
              className={`mr-2 select-none whitespace-nowrap`}
              style={typeof word === "object" ? word.style : undefined}
            >
              {letters.map((letter) => {
                letterIndex++;
                return (
                  <span
                    key={letterIndex}
                    className={`inline-block ${
                      disableAnimation ? "" : "animate-letter-pop opacity-0"
                    }`}
                    style={{
                      animationDelay: `${letterIndex * letterDelay}ms`,
                      animationDuration: `400ms`,
                    }}
                  >
                    {letter === " " ? "\u00A0" : letter}
                  </span>
                );
              })}
            </span>
          );
        });
      })}
    </p>
  );
}
