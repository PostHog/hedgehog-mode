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
import {
  getDisplayFloors,
  getSpawnPosition,
  getVirtualDesktop,
} from "./window-bounds.mjs";
import { isPointInArea } from "./desktop-interaction.mjs";
import { listDesktopWindowPlatforms } from "./window-platforms.mjs";

const directory = path.dirname(fileURLToPath(import.meta.url));
const windows = new Set();
let tray;
let enabled = true;
let windowPhysicsStatus = "checking";

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

function desktopLayout(actualBounds) {
  const displays = screen.getAllDisplays();
  const virtualDesktop = getVirtualDesktop(displays);
  const bounds = actualBounds ?? virtualDesktop.bounds;
  return {
    bounds,
    floors: getDisplayFloors(displays, bounds),
    spawnPosition: getSpawnPosition(screen.getPrimaryDisplay(), bounds),
  };
}

function macosWindowHelperPath() {
  return app.isPackaged
    ? path.join(
        process.resourcesPath,
        "app.asar.unpacked",
        "dist",
        "get-windows-macos"
      )
    : path.join(directory, "get-windows-macos");
}

function createWindow() {
  const { bounds } = desktopLayout();
  const window = new BrowserWindow({
    ...bounds,
    transparent: true,
    frame: false,
    resizable: false,
    skipTaskbar: true,
    show: enabled,
    alwaysOnTop: true,
    hasShadow: false,
    focusable: false,
    enableLargerThanScreen: true,
    webPreferences: {
      preload: path.join(directory, "preload.cjs"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });

  window.setAlwaysOnTop(true, "floating");
  window.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });
  window.setIgnoreMouseEvents(true, { forward: true });
  window.hedgehogHitAreas = [];
  window.hedgehogUIInteractive = false;
  void window.loadFile(path.join(directory, "index.html"));
  window.on("closed", () => windows.delete(window));
  windows.add(window);
}

function rebuildWindows() {
  for (const window of windows) window.destroy();
  createWindow();
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
      {
        label: `Window physics: ${windowPhysicsStatus}`,
        enabled: false,
      },
      { type: "separator" },
      { label: "Quit", click: () => app.quit() },
    ])
  );
}

app.whenReady().then(() => {
  if (process.platform === "darwin") app.dock.hide();
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
  if (process.platform === "darwin") icon.setTemplateImage(true);
  tray = new Tray(icon);
  tray.setToolTip("Hedgehog Mode");
  updateTrayMenu();
  rebuildWindows();
  screen.on("display-added", rebuildWindows);
  screen.on("display-removed", rebuildWindows);
  screen.on("display-metrics-changed", rebuildWindows);
  setInterval(() => {
    if (process.platform !== "darwin") return;
    const cursor = screen.getCursorScreenPoint();
    for (const window of windows) {
      const interactive =
        window.hedgehogUIInteractive ||
        isPointInArea(cursor, window.getBounds(), window.hedgehogHitAreas);
      window.setIgnoreMouseEvents(!interactive, { forward: true });
    }
  }, 50);
});

ipcMain.handle("state:load", loadState);
ipcMain.handle("desktop:layout", (event) => {
  const window = BrowserWindow.fromWebContents(event.sender);
  return desktopLayout(window?.getContentBounds());
});
ipcMain.handle("desktop:window-platforms", async (event) => {
  try {
    const window = BrowserWindow.fromWebContents(event.sender);
    const platforms = await listDesktopWindowPlatforms(
      process.platform,
      desktopLayout(window?.getContentBounds()).bounds,
      macosWindowHelperPath()
    );
    if (windowPhysicsStatus !== "active") {
      windowPhysicsStatus = "active";
      updateTrayMenu();
    }
    return platforms;
  } catch {
    if (windowPhysicsStatus !== "blocked") {
      windowPhysicsStatus = "blocked";
      updateTrayMenu();
    }
    return [];
  }
});
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
  const window = BrowserWindow.fromWebContents(event.sender);
  if (window) {
    window.hedgehogUIInteractive = interactive;
    if (process.platform !== "darwin") {
      window.setIgnoreMouseEvents(!interactive, {
        forward: true,
      });
    }
  }
});
ipcMain.on("window:update-hit-areas", (event, areas) => {
  const window = BrowserWindow.fromWebContents(event.sender);
  if (window) window.hedgehogHitAreas = areas;
});

app.on("window-all-closed", () => {});
