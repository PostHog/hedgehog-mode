export const styles = `
  :host {
    --color-text: #222;
    --color-background: white;
    --color-border: #222;
    --color-hover: rgba(0, 0, 0, 0.1);
    --color-shadow: rgba(0, 0, 0, 0.1);
    --transition-timing: cubic-bezier(0.34, 1.56, 0.64, 1);
    --transition-duration: 200ms;
    --border-radius-sm: 0.25rem;
    --border-radius-md: 0.5rem;
    --spacing-xs: 0.25rem;
    --spacing-sm: 0.5rem;
    --font-family: monospace;
    --font-size-sm: 0.875rem;
    --opacity-disabled: 0.25;
    --opacity-hover: 0.5;
    --opacity-full: 1;

    display: block;
    background-color: transparent;
  }

  :host([data-theme="dark"]) {
    --color-text: #fff;
    --color-background: #222;
    --color-border: #fff;
    --color-hover: rgba(255, 255, 255, 0.1);
    --color-shadow: rgba(0, 0, 0, 0.3);
  }

  .GameContainer {
    position: fixed;
    inset: 0;
    z-index: 1;
  }

  .GameUI {
    position: relative;
    font-family: var(--font-family);
    z-index: 2;
    color: var(--color-text);
  }

  .Button {
    background-color: transparent;
    color: var(--color-text);
    border: none;
    padding: var(--spacing-xs);
    border-radius: var(--border-radius-sm);
    transition: background-color 300ms var(--transition-timing);
    font-family: var(--font-family);
    opacity: var(--opacity-hover);
    cursor: pointer;
  }

  .Button--disabled {
    opacity: var(--opacity-disabled);
  }

  .Button:not(.Button--disabled):hover {
    background-color: var(--color-hover);
    opacity: var(--opacity-full);
  }

  .DialogBox {
    position: fixed;
    border: 2px solid var(--color-border);
    background-color: var(--color-background);
    border-radius: var(--border-radius-md);
    box-shadow: 0 10px 15px -3px var(--color-shadow);
    pointer-events: auto;
    opacity: 0;
    transition: all var(--transition-duration) var(--transition-timing);
    transform: scale(0.8);
    pointer-events: none;
  }

  .DialogBox--visible {
    opacity: var(--opacity-full);
    transform: scale(1);
    pointer-events: auto;
  }

  .DialogBoxControls {
    display: flex;
    flex-direction: row;
    justify-content: flex-end;
    gap: var(--spacing-xs);
    opacity: 0;
    transition: all var(--transition-duration) var(--transition-timing);
    height: 0;
    border-bottom: 1px solid transparent;
    padding: 0 var(--spacing-xs);
  }

  .DialogBox:hover > .DialogBoxControls {
    padding: var(--spacing-xs);
    opacity: var(--opacity-full);
    height: 1.5rem;
    border-bottom-color: var(--color-hover);
  }

  .Messages {
    padding: var(--spacing-sm);
  }

  .ArrowIcon {
    vertical-align: middle;
    height: 1rem;
    width: 1rem;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .ArrowIcon--right {
    transform: rotate(180deg);
  }

  .AnimatedText {
    font-weight: 500;
    font-size: var(--font-size-sm);
  }

  .AnimatedTextWord {
    margin-right: var(--spacing-sm);
    user-select: none;
    white-space: nowrap;
  }

  .AnimatedTextLetter {
    display: inline-block;
  }

  @keyframes letter-pop {
    0% {
      transform: scale(0) rotate(-10deg);
      opacity: 0;
    }
    25% {
      opacity: 0.7;
    }
    50% {
      transform: scale(1.2) rotate(10deg);
      opacity: 0.7;
    }
    75% {
      transform: scale(0.9) rotate(-5deg);
      opacity: 0.8;
    }
    100% {
      transform: scale(1) rotate(0deg);
      opacity: var(--opacity-full);
    }
  }

  .Animation_LetterPop {
    opacity: 0;
    animation: letter-pop 0.5s var(--transition-timing) forwards;
  }
`;
