import { useEffect, useState, useCallback } from "react";
import { AnimatedText } from "./AnimatedText";
import { GameUIProps } from "../../types";
import { IconButton } from "./Button";
import { useOutsideClick } from "../hooks/useOutsideClick";
import { useKeyboardListener } from "../hooks/useKeyboardListener";

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

  useOutsideClick(containerRef, () => {
    setIndex(messageIndex + 1);
  });

  useKeyboardListener(["enter", " "], () => {
    if (message) {
      setIndex(messageIndex + 1);
    }
  });

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
        <IconButton
          icon="chevron"
          onClick={() => setIndex(messageIndex - 1)}
          disabled={messageIndex === 0}
        />
        {messages.length > 1 && messageIndex < messages.length - 1 ? (
          <IconButton
            icon="chevron"
            onClick={() => setIndex(messageIndex + 1)}
            rotation="180deg"
          />
        ) : (
          <IconButton icon="done" onClick={() => onEnd?.()} />
        )}
      </div>
    </div>
  );
}
