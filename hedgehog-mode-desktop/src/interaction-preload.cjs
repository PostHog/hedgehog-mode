const { ipcRenderer } = require("electron");

for (const type of [
  "pointerdown",
  "pointermove",
  "pointerup",
  "pointercancel",
]) {
  window.addEventListener(type, (event) => {
    ipcRenderer.send("interaction:pointer", {
      type,
      x: event.clientX,
      y: event.clientY,
    });
  });
}

window.addEventListener("pointerenter", () => {
  ipcRenderer.send("interaction:hover", true);
});
window.addEventListener("pointerleave", () => {
  ipcRenderer.send("interaction:hover", false);
});
