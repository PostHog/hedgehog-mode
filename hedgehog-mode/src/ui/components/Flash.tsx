import { useEffect, useRef } from "react";
import { GameUIFlashProps } from "../../types";
import { AnimatedText } from "./AnimatedText";

const DEFAULT_DURATION = 4000;

/**
 * A transient toast that pops up near the hedgehog, shows a short message, and
 * auto-hides after `duration` with a shrinking bar counting it down. Unlike the
 * click-triggered speech bubble it dismisses itself.
 */
export function Flash({
  flash,
  onDone,
}: {
  flash: GameUIFlashProps;
  onDone: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const duration = flash.duration ?? DEFAULT_DURATION;

  // Auto-hide.
  useEffect(() => {
    const timer = setTimeout(onDone, duration);
    return () => clearTimeout(timer);
  }, [flash, duration, onDone]);

  // Follow the actor, if one was given.
  useEffect(() => {
    const actor = flash.actor;
    if (!actor) {
      return;
    }
    let raf = 0;
    const update = () => {
      const pos = actor.rigidBody?.position;
      if (ref.current && pos) {
        ref.current.style.left = `${pos.x}px`;
        ref.current.style.bottom = `${window.innerHeight - pos.y + 70}px`;
      }
      raf = requestAnimationFrame(update);
    };
    update();
    return () => cancelAnimationFrame(raf);
  }, [flash.actor]);

  return (
    <div ref={ref} className={`Flash ${flash.actor ? "Flash--actor" : ""}`}>
      <div className="FlashBubble">
        <AnimatedText words={flash.words} duration={600} />
        <div
          className="FlashBar"
          style={{ animationDuration: `${duration}ms` }}
        />
      </div>
    </div>
  );
}
