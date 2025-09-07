import { useEffect } from "react";

export const useOutsideClick = (
  ref: React.RefObject<HTMLDivElement>,
  onClickOutside: (e: MouseEvent) => void
) => {
  // Uses a useEffect to set up a global click listener and one on the given ref
  // If we get a click outside we wait one tick and then check if we got the click on the ref as well

  useEffect(() => {
    if (!ref.current) return;

    let refClick = false;

    const handleGlobalClick = (e: MouseEvent) => {
      setTimeout(() => {
        if (!refClick) {
          onClickOutside(e);
        }

        refClick = false;
      }, 0);
    };

    const handleRefClick = () => {
      refClick = true;
    };

    document.addEventListener("mousedown", handleGlobalClick);
    ref.current.addEventListener("mousedown", handleRefClick);

    return () => {
      document.removeEventListener("mousedown", handleGlobalClick);
      ref.current?.removeEventListener("mousedown", handleRefClick);
    };
  }, [ref.current, onClickOutside]);
};
