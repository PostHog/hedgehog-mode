import { useEffect, useState, useCallback } from "react";
import { AnimatedText } from "./AnimatedText";
import { GameUIProps } from "../../types";
import { ArrowButton } from "./Button";
import { useOutsideClick } from "../hooks/useOutsideClick";

export function Messages({
  messages,
  onEnd,
  containerRef,
}: Pick<GameUIProps, "messages"> & {
  onEnd?: () => void;
  containerRef: React.RefObject<HTMLDivElement>;
}) {
  const [messageIndex, setMessageIndex] = useState<number>(0);
  const [animationCompleted, setAnimationCompleted] = useState<boolean>(false);
  const message = messages[messageIndex];

  useEffect(() => {
    setMessageIndex(0);
  }, [messages]);

  useOutsideClick(containerRef, () => {
    setIndex(messageIndex + 1);
  });

  const setIndex = useCallback(
    (index: number) => {
      const isForward = index > messageIndex;

      if (index < 0) {
        return;
      }

      if (isForward && !animationCompleted) {
        setAnimationCompleted(true);
        return;
      }
      setAnimationCompleted(false);

      setMessageIndex(Math.max(0, Math.min(messages.length - 1, index)));

      if (isForward) {
        messages[messageIndex]?.onComplete?.();
      }

      if (index === messages.length) {
        onEnd?.();
      }
    },
    [messageIndex, messages.length, animationCompleted, onEnd]
  );

  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if ((event.key === "Enter" || event.key === " ") && message) {
        setIndex(messageIndex + 1);
      }
    };

    document.addEventListener("keydown", handleKeyPress);
    return () => {
      document.removeEventListener("keydown", handleKeyPress);
    };
  }, [message, messageIndex, setIndex]);

  if (!message) {
    return null;
  }

  return (
    <div className="Messages">
      <AnimatedText
        key={messageIndex}
        words={message.words}
        onComplete={() => setAnimationCompleted(true)}
        disableAnimation={animationCompleted}
        onClick={() => setIndex(messageIndex + 1)}
      />

      <div
        className="MessagesControls"
        style={{
          flex: 1,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div style={{ flex: 1 }} />
        <ArrowButton
          onClick={() => setIndex(messageIndex - 1)}
          direction="left"
          disabled={messageIndex === 0}
        />
        <ArrowButton
          onClick={() => setIndex(messageIndex + 1)}
          direction="right"
        />
      </div>
    </div>
  );
}
