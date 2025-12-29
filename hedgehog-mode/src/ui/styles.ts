export const styles = `
  :host {
    --color-text: #222;
    --color-background: white;
    --color-border: #222;
    --color-border-light: #DDD;
    --color-hover: rgba(0, 0, 0, 0.1);
    --color-shadow: rgba(0, 0, 0, 0.1);
    --color-danger: #FF0000;
    --transition-timing: cubic-bezier(0.34, 1.56, 0.64, 1);
    --transition-duration: 200ms;
    --border-radius-sm: 0.25rem;
    --border-radius-md: 0.5rem;
    --spacing-xs: 0.25rem;
    --spacing-sm: 0.5rem;
    --font-family: monospace;
    --font-size-sm: 0.875rem;

    display: block;
    background-color: transparent;
  }

  :host([data-theme="dark"]) {
    --color-text: #fff;
    --color-background: #222;
    --color-border: #fff;
    --color-border-light: #DDD;
    --color-hover: rgba(255, 255, 255, 0.1);
    --color-shadow: rgba(0, 0, 0, 0.3);
  }


  .GameContainer {
    position: fixed;
    inset: 0;
    z-index: 1;
  }

  .GameContainer--hovering {
    cursor: pointer;
  }

  .GameUI {
    position: relative;
    z-index: 2;
    font-family: var(--font-family);
    color: var(--color-text);
  }

  .Button {
    background-color: transparent;
    color: var(--color-text);
    border: 1px solid transparent;
    padding: var(--spacing-xs);
    border-radius: var(--border-radius-sm);
    transition: background-color 300ms var(--transition-timing);
    font-family: var(--font-family);
    cursor: pointer;
  }

  .Button--disabled {
    opacity: 0.25;
  }

  .Button--active {
    border-color: var(--color-border);
    background-color: var(--color-hover);
  }

  .Button:not(.Button--disabled):hover {
    background-color: var(--color-hover);
    opacity: 1;
  }

  .Switch {
    display: flex;
    align-items: center;
    gap: var(--spacing-xs);
  }

  .SwitchLabel {
    display: flex;
    align-items: center;
    gap: var(--spacing-xs);
  }

  .SwitchLabelText {
    font-size: var(--font-size-sm);
  }

  .SwitchInput {
    display: none;
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
    display: flex;
    flex-direction: column;
  }

  .DialogBox--visible {
    opacity: 1;
    transform: scale(1);
    pointer-events: auto;
  }

  .DialogBoxContent {
    flex: 1;
    overflow-y: auto;
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
  .DialogBoxControlsLeft {
    flex: 1;
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    gap: var(--spacing-xs);
  }

  .DialogBox:hover > .DialogBoxControls {
    padding: var(--spacing-xs);
    opacity: 1;
    height: 1.5rem;
    border-bottom-color: var(--color-border-light);
  }

  .Messages {
    padding: var(--spacing-sm);
  }

  .IconButton {
    vertical-align: middle;
    height: 1rem;
    width: 1rem;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .IconButton--90deg {
    transform: rotate(90deg);
  }
  .IconButton--180deg {
    transform: rotate(180deg);
  }
  .IconButton--270deg {
    transform: rotate(270deg);
  }

  .AnimatedText {
    font-weight: 500;
    font-size: var(--font-size-sm);
  }

  .AnimatedTextWord {
    margin-right: var(--spacing-sm);
    user-select: none;
    display: inline-block;
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
    animation: letter-pop 0.5s var(--transition-timing) forwards;
  }

  .Customization {
    display: flex;
    flex-direction: column;
    padding: var(--spacing-sm);
    font-family: var(--font-family);
  }

  .CustomizationContainer {
    display: flex;
    align-items: flex-start;
    gap: 0.5rem;
  }

  .CustomizationContent {
    flex: 1;
  }

  .CustomizationOptions {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .CustomizationTitle {
    font-size: 1.25rem;
    margin-top: 0;
    margin-bottom: 0.5rem;
  }

  .CustomizationDescription {
    margin-bottom: 1rem;
  }

  .CustomizationSection {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .CustomizationSectionTitle {
    font-size: 1rem;
    margin: 0;
  }

  .CustomizationGrid {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
  }

  .CustomizationItem {
    cursor: pointer;
    transition: transform 0.2s var(--transition-timing);
  }

  .CustomizationFriend {
    position: relative;
  }
  
  .CustomizationFriendRemove {
    position: absolute;
    top: -0.5rem;
    right: -0.5rem;
    z-index: 1;
    opacity: 0;
    visibility: hidden;
    transition: all 0.2s var(--transition-timing);
    vertical-align: middle;
    height: 0.75rem;
    width: 0.75rem;
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: .5;
    background-color: var(--color-danger);
    color: #fff;
    border-radius: 50%;
    cursor: pointer;
    padding: 0.125rem;
  }

  .CustomizationFriendRemove:hover {
    opacity: 1;
    visibility: visible;
  }

  .CustomizationFriend:hover .CustomizationFriendRemove {
    opacity: 1;
    visibility: visible;
  }
`;
