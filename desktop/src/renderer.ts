/**
 * This file will automatically be loaded by vite and run in the "renderer" context.
 * To learn more about the differences between the "main" and the "renderer" context in
 * Electron, visit:
 *
 * https://electronjs.org/docs/tutorial/application-architecture#main-and-renderer-processes
 *
 * By default, Node.js integration in this file is disabled. When enabling Node.js integration
 * in a renderer process, please be aware of potential security implications. You can read
 * more about security risks here:
 *
 * https://electronjs.org/docs/tutorial/security
 *
 * To enable Node.js integration in this file, open up `main.ts` and enable the `nodeIntegration`
 * flag:
 *
 * ```
 *  // Create the browser window.
 *  mainWindow = new BrowserWindow({
 *    width: 800,
 *    height: 600,
 *    webPreferences: {
 *      nodeIntegration: true
 *    }
 *  });
 * ```
 */

import { sample } from "lodash";
import "./index.css";

import {
  getRandomAccesoryCombo,
  HedgehogActorColorOptions,
  HedgeHogMode,
} from "@posthog/hedgehog-mode";

console.log(
  '👋 This message is being logged by "renderer.ts", included via Vite'
);

class App {
  constructor() {
    this.start();
  }

  async start() {
    const hedgeHogMode = new HedgeHogMode({
      assetsUrl: "/assets",
      platformSelector: ".border",
    });

    const spawnHedgehog = async (count: number) => {
      for (let i = 0; i < count; i++) {
        hedgeHogMode.spawnHedgehog({
          controls_enabled: false,
          accessories: getRandomAccesoryCombo(),
          color: sample(HedgehogActorColorOptions),
        });

        await new Promise((resolve) => setTimeout(resolve, 100));
      }
    };

    await hedgeHogMode.render(document.getElementById("app") as HTMLDivElement);
    hedgeHogMode.spawnHedgehog({
      skin: "spiderhog", // TODO: Remove
      controls_enabled: true,
      player: true,
      color: "rainbow",
      accessories: getRandomAccesoryCombo(),
    });

    await spawnHedgehog(100);
  }
}

new App();
