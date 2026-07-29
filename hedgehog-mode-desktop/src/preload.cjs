const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("hedgehogDesktop", {
  assetsUrl: () => ipcRenderer.invoke("assets:url"),
  loadState: () => ipcRenderer.invoke("state:load"),
  saveState: (state) => ipcRenderer.send("state:save", state),
  setInteractive: (interactive) =>
    ipcRenderer.send("window:set-interactive", interactive),
  updateHitAreas: (areas) => ipcRenderer.send("window:update-hit-areas", areas),
});
