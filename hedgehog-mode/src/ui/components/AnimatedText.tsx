import { useEffect } from "react";
import { GameUIAnimatedTextProps } from "../../types";

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
    <div className="AnimatedText">
      {words.map((word) => {
        const subwords =
          typeof word === "string" ? word.split(" ") : word.text.split(" ");

        return subwords.map((subword, index) => {
          const letters = subword.split("");
          return (
            <span
              key={index}
              className="AnimatedTextWord"
              style={typeof word === "object" ? word.style : undefined}
            >
              {letters.map((letter) => {
                letterIndex++;
                return (
                  <span
                    key={letterIndex}
                    className={`AnimatedTextLetter  ${
                      !disableAnimation ? "Animation_LetterPop" : ""
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
    </div>
  );
}
