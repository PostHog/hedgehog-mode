export const styles = `
  :host {
    display: block;
    background-color: transparent;
  }
  .GameContainer {
    position: fixed;
    inset: 0;
    z-index: 1;
  }
  .GameUI {
    position: relative;
    font-family: monospace;
    z-index: 2;
  }
  .Button {
    background-color: transparent;
    color: #222;
    border: none;
    padding: 0.25rem;
    border-radius: 0.25rem;
    transition: background-color 300ms;
    font-family: monospace;
    opacity: 0.5;
    cursor: pointer;
  }
  .Button--disabled {
    opacity: 0.25;
  }
  .Button:not(.Button--disabled):hover {
    background-color: rgba(0, 0, 0, 0.1);
    opacity: 1;
  }

  .DialogBox {
    position: fixed;
    border: 2px solid #222;
    background-color: white;
    border-radius: 0.5rem;
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
    pointer-events: auto;
    opacity: 0;
    transition: all 200ms cubic-bezier(0.34, 1.56, 0.64, 1);
    transform: scale(0.8);
    pointer-events: none;
  }
  .DialogBox--visible {
    opacity: 1;
    transform: scale(1);
    pointer-events: auto;
  }
  .DialogBoxControls {
    display: flex;
    flex-direction: row;
    justify-content: flex-end;
    gap: 0.25rem;
    opacity: 0;
    transition: all 200ms cubic-bezier(0.34, 1.56, 0.64, 1);
    height: 0;
    border-bottom: 1px solid transparent;
    padding: 0 0.25rem;
  }
  .DialogBox:hover > .DialogBoxControls {
    padding: 0.25rem;
    opacity: 1;
    height: 1.5rem;
    border-bottom-color: rgba(0, 0, 0, 0.2);
  }

  .Messages {
    padding: 0.5rem;
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
    font-size: 0.875rem;
  }

  .AnimatedTextWord {
    margin-right: 0.5rem;
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
      opacity: 1;
    }
  }

  .Animation_LetterPop {
    opacity: 0;
    animation: letter-pop 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
  }
`;
