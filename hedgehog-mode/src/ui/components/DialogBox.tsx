import { useEffect, useRef, useState, useCallback } from "react";
import { AnimatedText } from "./AnimatedText";
import { GameUIDialogBoxProps } from "../../types";

const Chevron = () => {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
      <g
        id="SVGRepo_tracerCarrier"
        stroke-linecap="round"
        stroke-linejoin="round"
      ></g>
      <g id="SVGRepo_iconCarrier">
        {" "}
        <path
          d="M15 6L9 12L15 18"
          stroke="#000000"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        ></path>{" "}
      </g>
    </svg>
  );
};

const ArrowButton = ({
  onClick,
  direction,
  disabled,
}: {
  onClick: () => void;
  direction: "left" | "right";
  disabled?: boolean;
}) => {
  return (
    <div
      onClick={onClick}
      className={`DialogBoxArrowButton ${
        disabled ? "DialogBoxArrowButton--disabled" : ""
      }`}
    >
      <div
        className={`DialogBoxArrowIcon ${
          direction === "right" ? "DialogBoxArrowIcon--right" : ""
        }`}
      >
        <Chevron />
      </div>
    </div>
  );
};

const WINDOW_MARGIN = 10;

export function DialogBox({
  messages,
  actor,
  width = 300,
  onEnd,
}: GameUIDialogBoxProps & { onClickOutside?: () => void }) {
  const [messageIndex, setMessageIndex] = useState<number>(0);
  const ref = useRef<HTMLDivElement>(null);
  const [hovering, setHovering] = useState<boolean>(false);
  const [animationCompleted, setAnimationCompleted] = useState<boolean>(false);
  const message = messages[messageIndex];

  const setPosition = useCallback(
    (actor?: GameUIDialogBoxProps["actor"]) => {
      if (hovering) {
        return;
      }

      const pos = actor?.rigidBody?.position || { y: 999999999, x: 999999999 };

      if (ref.current && pos) {
        let x = pos.x - width / 2;
        let y = window.innerHeight - pos.y + 40; // offset for height of the hedgehog
        const height = ref.current.clientHeight;

        x = Math.max(WINDOW_MARGIN, x);
        x = Math.min(window.innerWidth - width - WINDOW_MARGIN, x);

        y = Math.max(WINDOW_MARGIN, y);
        y = Math.min(window.innerHeight - height - WINDOW_MARGIN, y);
        ref.current.style.left = `${x}px`;
        ref.current.style.bottom = `${y}px`;
      }
    },
    [hovering]
  );

  useEffect(() => {
    setMessageIndex(0);
    setHovering(false);
  }, [messages]);

  useEffect(() => {
    if (actor) {
      let cancel: number | null = null;
      const updatePosition = () => {
        setPosition(actor);
        cancel = requestAnimationFrame(updatePosition);
      };

      updatePosition();

      return () => {
        if (cancel) {
          cancelAnimationFrame(cancel);
        }
      };
    }
  }, [actor, setPosition]);

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
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setIndex(messageIndex + 1);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [setIndex]);

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
    <div
      ref={ref}
      className="DialogBox"
      style={{
        width,
      }}
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
    >
      <AnimatedText
        key={messageIndex}
        words={message.words}
        onComplete={() => setAnimationCompleted(true)}
        disableAnimation={animationCompleted}
      />

      <div className="DialogBoxControls">
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
