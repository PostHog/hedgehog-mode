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
import { execFile } from "node:child_process";
import path from "node:path";
import { promisify } from "node:util";
import { fileURLToPath, pathToFileURL } from "node:url";
import { getDisplayFloors, getVirtualDesktop } from "./window-bounds.mjs";
import { isPointInArea } from "./desktop-interaction.mjs";
import { listDesktopWindowPlatforms } from "./window-platforms.mjs";

const directory = path.dirname(fileURLToPath(import.meta.url));
const execute = promisify(execFile);
const windows = new Set();
const e2eMode = process.env.HEDGEHOG_E2E === "1";
let runtimeState;
let tray;
let enabled = true;
let windowPhysicsStatus =
  process.platform === "linux" ? "unavailable" : "checking";

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
  const virtualDesktop = getVirtualDesktop(displays, process.platform);
  const bounds = actualBounds ?? virtualDesktop.bounds;
  return {
    bounds,
    floors: getDisplayFloors(displays, bounds, process.platform),
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
    focusable: true,
    acceptFirstMouse: true,
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
  void window.loadFile(
    path.join(directory, "index.html"),
    e2eMode ? { query: { e2e: "1" } } : undefined
  );
  if (e2eMode) void runMacOSE2E(window);
  window.on("closed", () => windows.delete(window));
  windows.add(window);
}

async function waitForRuntimeState(predicate, timeout = 10000) {
  const startedAt = Date.now();
  while (Date.now() - startedAt < timeout) {
    if (runtimeState && predicate(runtimeState)) return runtimeState;
    await new Promise((resolve) => setTimeout(resolve, 50));
  }
  throw new Error("Timed out waiting for desktop runtime state");
}

async function runMacOSE2E(window) {
  try {
    await new Promise((resolve) =>
      window.webContents.once("did-finish-load", resolve)
    );
    await waitForRuntimeState(() => true);
    await new Promise((resolve) => setTimeout(resolve, 3000));
    const landed = runtimeState;
    const settled = landed;
    const bottomGap = settled.viewport.height - settled.sprite.maxY;
    if (bottomGap > 12) {
      throw new Error(
        `Hedgehog settled ${bottomGap}px above the viewport bottom`
      );
    }

    const beforePath = path.resolve(
      process.env.HEDGEHOG_E2E_BEFORE ?? "e2e-before.png"
    );
    const afterPath = path.resolve(
      process.env.HEDGEHOG_E2E_AFTER ?? "e2e-after.png"
    );
    await writeFile(
      beforePath,
      (await window.webContents.capturePage()).toPNG()
    );
    const localStart = {
      x: Math.round((landed.sprite.minX + landed.sprite.maxX) / 2),
      y: Math.round((landed.sprite.minY + landed.sprite.maxY) / 2),
    };
    const contentBounds = window.getContentBounds();
    const start = {
      x: contentBounds.x + localStart.x,
      y: contentBounds.y + localStart.y,
    };
    const dragExecutable = process.env.HEDGEHOG_E2E_DRAG_EXECUTABLE;
    if (!dragExecutable) throw new Error("Missing native drag executable");
    await execute(dragExecutable, [
      String(start.x),
      String(start.y),
      String(start.x),
      String(start.y),
      "--move-only",
    ]);
    try {
      await waitForRuntimeState(() => window.hedgehogMouseInteractive, 2000);
    } catch {
      throw new Error(
        `Cursor missed hedgehog: ${JSON.stringify({
          requestedCursor: start,
          actualCursor: screen.getCursorScreenPoint(),
          windowBounds: window.getBounds(),
          contentBounds,
          hitAreas: window.hedgehogHitAreas,
        })}`
      );
    }
    await execute(dragExecutable, [
      String(start.x),
      String(start.y),
      String(start.x + 120),
      String(start.y - 80),
    ]);
    const dragged = await waitForRuntimeState(
      (state) =>
        state.position.x - landed.position.x > 40 &&
        landed.position.y - state.position.y > 30,
      2000
    );
    await writeFile(
      afterPath,
      (await window.webContents.capturePage()).toPNG()
    );
    console.log(JSON.stringify({ bottomGap, landed, dragged }));
    app.exit(0);
  } catch (error) {
    console.error(error);
    app.exit(1);
  }
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
      window.hedgehogMouseInteractive = interactive;
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
  if (process.platform === "linux") return [];

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
ipcMain.on("e2e:runtime-state", (_event, state) => {
  runtimeState = state;
});

app.on("window-all-closed", () => {});
