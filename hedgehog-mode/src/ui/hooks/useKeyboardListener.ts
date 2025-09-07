import { useCallback, useEffect } from "react";

export const useKeyboardListener = (keys: string[], action: () => void) => {
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (keys.includes(event.key.toLowerCase())) {
        action();
      }
    },
    [keys, action]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  return () => {
    window.removeEventListener("keydown", handleKeyDown);
  };
};
