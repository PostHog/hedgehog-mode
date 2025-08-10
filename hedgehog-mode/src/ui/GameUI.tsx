import { useCallback, useEffect, useRef, useState } from "react";
import {
  GameUIProps,
  HedgehogActorOptions,
  HedgeHogMode,
} from "../hedgehog-mode";
import { Button } from "./components/Button";
import { HedgehogCustomization } from "./components/Customization";
import { Messages } from "./components/Messages";
import { useOutsideClick } from "./hooks/useOutsideClick";

const WINDOW_MARGIN = 10;

export function HedgehogModeUI({ game }: { game: HedgeHogMode }) {
  const [ui, setUI] = useState<GameUIProps | null>(null);
  const [visible, setVisible] = useState<boolean>(false);
  // To game should control the UI largely so we add an event listener for game modal popups
  useEffect(() => {
    game.setUI({
      show: (ui) => {
        setVisible(true);
        setUI(ui);
      },
    });
  }, [game]);

  const onClose = useCallback(() => {
    setVisible(false);
    ui?.onClose?.();
  }, [ui]);

  const { actor, messages, screen } = ui || {};

  const width = 300;

  const ref = useRef<HTMLDivElement>(null);
  const [hovering, setHovering] = useState<boolean>(false);
  const [actorOptions, _setActorOptions] =
    useState<HedgehogActorOptions | null>(ui?.actor?.options || null);

  useEffect(() => {
    _setActorOptions(ui?.actor?.options || null);
  }, [ui]);

  const setActorOptions = useCallback(
    (options: HedgehogActorOptions) => {
      _setActorOptions(options);
      game.stateManager?.setHedgehog(options);
    },
    [game.stateManager]
  );

  const showConfiguration = screen === "configuration";

  const derivedWidth = showConfiguration ? 500 : width;
  const MIN_WINDOW_HEIGHT = showConfiguration ? 300 : 50;

  const setPosition = useCallback(
    (actor?: GameUIProps["actor"], force?: boolean) => {
      if (hovering && !force) {
        return;
      }

      const pos = actor?.rigidBody?.position || { y: 999999999, x: 999999999 };

      if (ref.current && pos) {
        let x = pos.x - derivedWidth / 2;
        let y = window.innerHeight - pos.y + 40; // offset for height of the hedgehog

        x = Math.max(WINDOW_MARGIN, x);
        x = Math.min(window.innerWidth - derivedWidth - WINDOW_MARGIN, x);

        y = Math.max(WINDOW_MARGIN, y);
        y = Math.min(window.innerHeight - WINDOW_MARGIN, y);

        // Height should not be more than the screen
        const maxHeight = Math.max(
          MIN_WINDOW_HEIGHT,
          window.innerHeight - y - WINDOW_MARGIN
        );

        // If the window would push it off screen we adjust the bottom to fit
        y = Math.max(
          WINDOW_MARGIN,
          window.innerHeight - maxHeight - WINDOW_MARGIN
        );

        ref.current.style.left = `${x}px`;
        ref.current.style.bottom = `${y}px`;
        ref.current.style.maxHeight = `${maxHeight}px`;
        ref.current.style.minHeight = `${MIN_WINDOW_HEIGHT}px`;
      }
    },
    [hovering, MIN_WINDOW_HEIGHT, derivedWidth]
  );

  useEffect(() => {
    setPosition(actor, true);
  }, [showConfiguration]);

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
    <div className="GameUI">
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
          <Button
            onClick={() => {
              if (ui) {
                setUI({
                  ...ui,
                  screen: showConfiguration ? "dialog" : "configuration",
                });
              }
            }}
          >
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

          {!showConfiguration && messages && (
            <Messages messages={messages} onEnd={onClose} />
          )}
        </div>
      </div>
    </div>
  );
}
