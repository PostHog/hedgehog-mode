// Geometry for driving a DOM element from a Matter body.
//
// The body lives in viewport space, but a CSS transform is relative to where
// the element would sit *without* it. Those two agree right up until the page
// scrolls: the element's layout position slides with the document while the
// body stays put. So we remember where the element started, and how far the
// page had been scrolled at the time, and re-derive its untransformed position
// from the current scroll on every frame.

export type ShoveAnchor = {
  /** Viewport centre of the element when it was knocked loose. */
  x: number;
  y: number;
  /** Page scroll at that moment. */
  scrollX: number;
  scrollY: number;
};

/** Offset to translate an element by so it lands where its body is. */
export function shoveOffset(
  anchor: ShoveAnchor,
  body: { x: number; y: number },
  scroll: { x: number; y: number }
): { dx: number; dy: number } {
  return {
    dx: body.x - (anchor.x - (scroll.x - anchor.scrollX)),
    dy: body.y - (anchor.y - (scroll.y - anchor.scrollY)),
  };
}
