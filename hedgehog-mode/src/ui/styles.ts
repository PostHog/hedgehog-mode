export const styles = `
  :host {
    display: block;
    width: 100%;
    height: 100%;
  }
  .GameContainer {
    position: fixed;
    inset: 0;
    z-index: 20;
  }
  .GameUI {
    position: fixed;
    inset: 0;
    z-index: 20;
    font-family: monospace;
  }
  .GameUIContainer {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
  }
  .DialogBox {
    position: absolute;
    border: 2px solid #222;
    background-color: white;
    border-radius: 0.5rem;
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
    padding: 0.5rem;
  }
  .DialogBoxControls {
    display: flex;
    flex-direction: row;
    justify-content: flex-end;
  }
  .DialogBoxArrowButton {
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: opacity 300ms;
  }
  .DialogBoxArrowButton--disabled {
    opacity: 0.25;
  }
  .DialogBoxArrowButton:not(.DialogBoxArrowButton--disabled) {
    opacity: 0.5;
  }
  .DialogBoxArrowButton:not(.DialogBoxArrowButton--disabled):hover {
    opacity: 1;
  }
  .DialogBoxArrowIcon {
    vertical-align: middle;
    padding: 0.25rem;
    height: 1rem;
    width: 1rem;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .DialogBoxArrowIcon--right {
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
