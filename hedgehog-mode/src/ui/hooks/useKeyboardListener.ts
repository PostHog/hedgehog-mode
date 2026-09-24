import { useEffect } from "react";

import { normalizeEventKey } from "../../misc/keyboard";

export const useKeyboardListener = (keys: string[], action: () => void) => {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const key = normalizeEventKey(event);
      if (key && keys.includes(key)) {
        action();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [keys, action]);
};
