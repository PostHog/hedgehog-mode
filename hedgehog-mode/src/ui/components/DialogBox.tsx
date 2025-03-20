import { useEffect, useRef, useState, useCallback } from "react";
import { GameUIDialogBoxProps } from "../../types";
import { Messages } from "./Messages";
import { Button } from "./Button";

const WINDOW_MARGIN = 10;

export function DialogBox({
  messages,
  actor,
  width = 300,
  onClose,
  visible,
}: GameUIDialogBoxProps & { visible: boolean; onClickOutside?: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const [hovering, setHovering] = useState<boolean>(false);
  const [showConfiguration, setShowConfiguration] = useState<boolean>(false);

  const derivedWidth = showConfiguration ? 500 : width;

  const setPosition = useCallback(
    (actor?: GameUIDialogBoxProps["actor"]) => {
      if (hovering) {
        return;
      }

      const pos = actor?.rigidBody?.position || { y: 999999999, x: 999999999 };

      if (ref.current && pos) {
        let x = pos.x - derivedWidth / 2;
        let y = window.innerHeight - pos.y + 40; // offset for height of the hedgehog
        const height = ref.current.clientHeight;

        x = Math.max(WINDOW_MARGIN, x);
        x = Math.min(window.innerWidth - derivedWidth - WINDOW_MARGIN, x);

        y = Math.max(WINDOW_MARGIN, y);
        y = Math.min(window.innerHeight - height - WINDOW_MARGIN, y);
        ref.current.style.left = `${x}px`;
        ref.current.style.bottom = `${y}px`;
      }
    },
    [hovering]
  );

  useEffect(() => {
    if (!visible) {
      setShowConfiguration(false);
    }
  }, [visible]);

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

  // TODO: Fix this
  // useEffect(() => {
  //   const handleClickOutside = (event: MouseEvent) => {
  //     if (!ref.current) return;

  //     const target = event.target as Node;
  //     if (!ref.current.contains(target)) {
  //       setIndex(messageIndex + 1);
  //     }
  //   };

  //   document.addEventListener("mousedown", handleClickOutside);
  //   return () => {
  //     document.removeEventListener("mousedown", handleClickOutside);
  //   };
  // }, [setIndex, messageIndex]);

  return (
    <div
      ref={ref}
      className={`DialogBox ${visible ? "DialogBox--visible" : ""}`}
      style={{
        width: derivedWidth,
      }}
      onMouseOver={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
    >
      <div className="DialogBoxControls">
        <Button onClick={() => setShowConfiguration(!showConfiguration)}>
          Customize me!
        </Button>
        <Button onClick={() => onClose?.()}>X</Button>
      </div>
      {showConfiguration && <p>Yo!</p>}

      {!showConfiguration && <Messages messages={messages} onEnd={onClose} />}
    </div>
  );
}
