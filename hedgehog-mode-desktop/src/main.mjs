import {
  app,
  BrowserWindow,
  ipcMain,
  Menu,
  nativeImage,
  screen,
  Tray,
} from "electron";
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { getDesktopBounds } from "./window-bounds.mjs";

const directory = path.dirname(fileURLToPath(import.meta.url));
const windows = new Set();
let tray;
let enabled = true;

function statePath() {
  return path.join(app.getPath("userData"), "hedgehog-state.json");
}

async function loadState() {
  try {
    return JSON.parse(await readFile(statePath(), "utf8"));
  } catch {
    return null;
  }
}

function createWindow(display) {
  const window = new BrowserWindow({
    ...getDesktopBounds(display),
    transparent: true,
    frame: false,
    resizable: false,
    skipTaskbar: true,
    show: enabled,
    alwaysOnTop: true,
    hasShadow: false,
    focusable: false,
    webPreferences: {
      preload: path.join(directory, "preload.cjs"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });

  window.setAlwaysOnTop(true, "floating");
  window.setIgnoreMouseEvents(true, { forward: true });
  void window.loadFile(path.join(directory, "index.html"));
  window.on("closed", () => windows.delete(window));
  windows.add(window);
}

function rebuildWindows() {
  for (const window of windows) window.destroy();
  for (const display of screen.getAllDisplays()) createWindow(display);
}

function updateTrayMenu() {
  tray.setContextMenu(
    Menu.buildFromTemplate([
      {
        label: enabled ? "Hide hedgehogs" : "Show hedgehogs",
        click: () => {
          enabled = !enabled;
          for (const window of windows) {
            if (enabled) window.show();
            else window.hide();
          }
          updateTrayMenu();
        },
      },
      { type: "separator" },
      { label: "Quit", click: () => app.quit() },
    ])
  );
}

app.whenReady().then(() => {
  const spritesPath = app.isPackaged
    ? path.join(process.resourcesPath, "assets", "sprites.png")
    : path.join(
        directory,
        "..",
        "..",
        "hedgehog-mode",
        "assets",
        "sprites.png"
      );
  const icon = nativeImage
    .createFromPath(spritesPath)
    .crop({ x: 80, y: 320, width: 80, height: 80 })
    .resize({ width: 24, height: 24 });
  tray = new Tray(icon);
  tray.setToolTip("Hedgehog Mode");
  updateTrayMenu();
  rebuildWindows();
  screen.on("display-added", rebuildWindows);
  screen.on("display-removed", rebuildWindows);
  screen.on("display-metrics-changed", rebuildWindows);
});

ipcMain.handle("state:load", loadState);
ipcMain.handle("assets:url", () => {
  const assetsPath = app.isPackaged
    ? path.join(process.resourcesPath, "assets")
    : path.join(directory, "..", "..", "hedgehog-mode", "assets");
  return pathToFileURL(assetsPath).href;
});
ipcMain.on("state:save", (_event, state) => {
  void writeFile(statePath(), JSON.stringify(state));
});
ipcMain.on("window:set-interactive", (event, interactive) => {
  BrowserWindow.fromWebContents(event.sender)?.setIgnoreMouseEvents(
    !interactive,
    {
      forward: true,
    }
  );
});

app.on("window-all-closed", () => {});
