import { useEffect, useRef, useState, useCallback } from "react";
import { GameUIDialogBoxProps } from "../../types";
import { Messages } from "./Messages";
import { Button } from "./Button";
import { HedgehogCustomization } from "./Customization";
import { HedgehogActorOptions, HedgeHogMode } from "../../hedgehog-mode";
import { useOutsideClick } from "../hooks/useOutsideClick";

const WINDOW_MARGIN = 10;

export function DialogBox({
  game,
  messages,
  actor,
  width = 300,
  onClose,
  visible,
}: GameUIDialogBoxProps & {
  visible: boolean;
  onClickOutside?: () => void;
  game: HedgeHogMode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [hovering, setHovering] = useState<boolean>(false);
  const [showConfiguration, setShowConfiguration] = useState<boolean>(false);
  const [actorOptions, _setActorOptions] =
    useState<HedgehogActorOptions | null>(actor?.options || null);

  useEffect(() => {
    _setActorOptions(actor?.options || null);
  }, [actor]);

  const setActorOptions = useCallback(
    (options: HedgehogActorOptions) => {
      _setActorOptions(options);
      game.stateManager?.setHedgehog(options);
    },
    [game.stateManager]
  );

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
        const minHeight = 20;

        x = Math.max(WINDOW_MARGIN, x);
        x = Math.min(window.innerWidth - derivedWidth - WINDOW_MARGIN, x);

        y = Math.max(WINDOW_MARGIN, y);
        y = Math.min(window.innerHeight - WINDOW_MARGIN, y);

        // Height should not be more than the screen
        const maxHeight = window.innerHeight - y - WINDOW_MARGIN;

        ref.current.style.left = `${x}px`;
        ref.current.style.bottom = `${y}px`;
        ref.current.style.maxHeight = `${maxHeight}px`;
        ref.current.style.minHeight = `${minHeight}px`;
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

  useOutsideClick(ref, () => {
    if (visible) {
      onClose?.();
    }
  });

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
          {showConfiguration ? "Hide customization" : "Customize me!"}
        </Button>
        <Button onClick={() => onClose?.()}>X</Button>
      </div>
      <div className="DialogBoxContent">
        {showConfiguration && actorOptions && (
          <HedgehogCustomization
            game={game}
            config={actorOptions}
            setConfig={(config) => {
              setActorOptions(config);
            }}
          />
        )}

        {!showConfiguration && <Messages messages={messages} onEnd={onClose} />}
      </div>
    </div>
  );
}
