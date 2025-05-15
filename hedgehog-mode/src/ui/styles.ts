export const styles = `
  :host {
    --color-text: #222;
    --color-background: white;
    --color-border: #222;
    --color-border-light: #DDD;
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

  .font-doto {
    font-family: "Doto", sans-serif;
    font-optical-sizing: auto;
    font-style: normal;
    font-variation-settings:
      "ROND" 0;
  }

  .font-doto-500 {
    font-weight: 500;
  }

  .font-doto-600 {
    font-weight: 600;
  }

  .GameContainer {
    position: fixed;
    inset: 0;
    z-index: 1;
  }

  .EntryUI {
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
    cursor: pointer;
  }

  .Button--disabled {
    opacity: 0.25;
  }

  .Button--active {
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

  .DialogBoxGameButton {
    margin-right: auto;
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
  }

  .CustomizationContainer {
    display: flex;
    align-items: flex-start;
    gap: 0.5rem;
  }

  .CustomizationContent {
    flex: 1;
  }

  .CustomizationTitle {
    font-size: 1.25rem;
    margin-top: 0;
    margin-bottom: 0.5rem;
  }

  .CustomizationDescription {
    margin-bottom: 1rem;
  }

  .CustomizationOptions {
  }

  .CustomizationSection {
    margin-bottom: 1rem;
  }

  .CustomizationSectionTitle {
    font-size: 1rem;
    margin: 0.5rem 0;
  }

  .CustomizationGrid {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    padding-top: 1px;
    padding-bottom: 0.5rem;
    overflow-y: auto;
  }

  .CustomizationItem {
    cursor: pointer;
    transition: transform 0.2s var(--transition-timing);
  }

  // .CustomizationItem:hover {
  //   transform: scale(1.05);
  // }

  // .CustomizationItem--selected {
  //   outline: 1px solid var(--color-border-light);
  //   border-radius: var(--border-radius-sm);
  // }

  .GameConsole {
    position: fixed;
    inset: 0;
    z-index: 1000;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .GameConsole-overlay {
    position: absolute;
    inset: 0;
  }

  .GameConsole-content {
    position: relative;
    background-color: #FFFFFF;
    border: 2px solid var(--color-border);
    border-radius: var(--border-radius-md);
    width: 90%;
    height: 90%;
    max-width: 1200px;
    max-height: 800px;
    display: flex;
    flex-direction: column;
    box-shadow: 0 10px 15px -3px var(--color-shadow);
    padding: 0;
    overflow: visible;
    padding: 16px;
  }

  .GameConsole-body {
    flex: 1;
    display: flex;
    overflow-y: auto;
  }

  .GameConsole-GameView {
    flex: 1;
    flex-grow: 1;
    background-color: #000000;
    margin-right: 16px;
  }

  .GameConsole-ControlPanel {
    flex: 1;
    max-width: 200px;
  }

  .GameConsole-ControlPanel-status-pizza {
    background-color: red;
    width: 40px;
    height: 40px;
    border-radius: 100%;
  }

  .GameConsole-ControlPanel-status-points {
    font-size: 2rem;
  }

  .GameConsole-ControlPanel-status-pineapple {
    background-color: yellow;
    width: 20px;
    height: 40px;
  }

  .pixel-corners,
.pixel-corners--wrapper {
  clip-path: polygon(0px calc(100% - 30px),
    6px calc(100% - 30px),
    6px calc(100% - 18px),
    12px calc(100% - 18px),
    12px calc(100% - 12px),
    18px calc(100% - 12px),
    18px calc(100% - 6px),
    30px calc(100% - 6px),
    30px 100%,
    calc(100% - 30px) 100%,
    calc(100% - 30px) calc(100% - 6px),
    calc(100% - 18px) calc(100% - 6px),
    calc(100% - 18px) calc(100% - 12px),
    calc(100% - 12px) calc(100% - 12px),
    calc(100% - 12px) calc(100% - 18px),
    calc(100% - 6px) calc(100% - 18px),
    calc(100% - 6px) calc(100% - 30px),
    100% calc(100% - 30px),
    100% 30px,
    calc(100% - 6px) 30px,
    calc(100% - 6px) 18px,
    calc(100% - 12px) 18px,
    calc(100% - 12px) 12px,
    calc(100% - 18px) 12px,
    calc(100% - 18px) 6px,
    calc(100% - 30px) 6px,
    calc(100% - 30px) 0px,
    30px 0px,
    30px 6px,
    18px 6px,
    18px 12px,
    12px 12px,
    12px 18px,
    6px 18px,
    6px 30px,
    0px 30px);
  position: relative;
}
.pixel-corners {
  border: 6px solid transparent;
}
.pixel-corners--wrapper {
  width: fit-content;
  height: fit-content;
}
.pixel-corners--wrapper .pixel-corners {
  display: block;
  clip-path: polygon(6px 30px,
    12px 30px,
    12px 18px,
    18px 18px,
    18px 12px,
    30px 12px,
    30px 6px,
    calc(100% - 30px) 6px,
    calc(100% - 30px) 12px,
    calc(100% - 18px) 12px,
    calc(100% - 18px) 18px,
    calc(100% - 12px) 18px,
    calc(100% - 12px) 30px,
    calc(100% - 6px) 30px,
    calc(100% - 6px) calc(100% - 30px),
    calc(100% - 12px) calc(100% - 30px),
    calc(100% - 12px) calc(100% - 18px),
    calc(100% - 18px) calc(100% - 18px),
    calc(100% - 18px) calc(100% - 12px),
    calc(100% - 30px) calc(100% - 12px),
    calc(100% - 30px) calc(100% - 6px),
    30px calc(100% - 6px),
    30px calc(100% - 12px),
    18px calc(100% - 12px),
    18px calc(100% - 18px),
    12px calc(100% - 18px),
    12px calc(100% - 30px),
    6px calc(100% - 30px));
}
.pixel-corners::after,
.pixel-corners--wrapper::after {
  content: "";
  position: absolute;
  clip-path: polygon(0px calc(100% - 30px),
    6px calc(100% - 30px),
    6px calc(100% - 18px),
    12px calc(100% - 18px),
    12px calc(100% - 12px),
    18px calc(100% - 12px),
    18px calc(100% - 6px),
    30px calc(100% - 6px),
    30px 100%,
    calc(100% - 30px) 100%,
    calc(100% - 30px) calc(100% - 6px),
    calc(100% - 18px) calc(100% - 6px),
    calc(100% - 18px) calc(100% - 12px),
    calc(100% - 12px) calc(100% - 12px),
    calc(100% - 12px) calc(100% - 18px),
    calc(100% - 6px) calc(100% - 18px),
    calc(100% - 6px) calc(100% - 30px),
    100% calc(100% - 30px),
    100% 30px,
    calc(100% - 6px) 30px,
    calc(100% - 6px) 18px,
    calc(100% - 12px) 18px,
    calc(100% - 12px) 12px,
    calc(100% - 18px) 12px,
    calc(100% - 18px) 6px,
    calc(100% - 30px) 6px,
    calc(100% - 30px) 0px,
    30px 0px,
    30px 6px,
    18px 6px,
    18px 12px,
    12px 12px,
    12px 18px,
    6px 18px,
    6px 30px,
    0px 30px,
    0px 50%,
    6px 50%,
    6px 30px,
    12px 30px,
    12px 18px,
    18px 18px,
    18px 12px,
    30px 12px,
    30px 6px,
    calc(100% - 30px) 6px,
    calc(100% - 30px) 12px,
    calc(100% - 18px) 12px,
    calc(100% - 18px) 18px,
    calc(100% - 12px) 18px,
    calc(100% - 12px) 30px,
    calc(100% - 6px) 30px,
    calc(100% - 6px) calc(100% - 30px),
    calc(100% - 12px) calc(100% - 30px),
    calc(100% - 12px) calc(100% - 18px),
    calc(100% - 18px) calc(100% - 18px),
    calc(100% - 18px) calc(100% - 12px),
    calc(100% - 30px) calc(100% - 12px),
    calc(100% - 30px) calc(100% - 6px),
    30px calc(100% - 6px),
    30px calc(100% - 12px),
    18px calc(100% - 12px),
    18px calc(100% - 18px),
    12px calc(100% - 18px),
    12px calc(100% - 30px),
    6px calc(100% - 30px),
    6px 50%,
    0px 50%);
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  background: #000000;
  display: block;
  pointer-events: none;
}
.pixel-corners::after {
  margin: -6px;
}
.text-black {
  color: #000000;
}
.flex {
  display: flex;
}
.flex-col {
  flex-direction: column;
}

.gap-2 {
  gap: 0.5rem;
}

.gap-4 {
  gap: 1rem;
}

.justify-between {
  justify-content: space-between;
}

.items-center {
  align-items: center;
}

`;
