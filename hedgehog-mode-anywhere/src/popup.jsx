// Popup: customization UI. Option lists and previews come straight from
// @posthog/hedgehog-mode so they stay in sync with the engine the content script runs.
import { createRoot } from "react-dom/client";
import {
  StaticHedgehog,
  HedgehogActorSkinOptions,
  HedgehogActorColorOptions,
  HedgehogActorAccessories,
} from "@posthog/hedgehog-mode";

const ASSETS_URL = chrome.runtime.getURL("assets");

const NONE = "__none__";

const prettify = (id) =>
  id.replace(/[-_]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

// Skins first (no colour), then colour variants of the default skin — mirrors the original grid.
const SKINS_AND_COLORS = [
  ...HedgehogActorSkinOptions.map((skin) => ({
    id: skin,
    skin,
    color: null,
    name: prettify(skin),
  })),
  ...HedgehogActorColorOptions.map((color) => ({
    id: color,
    skin: "default",
    color,
    name: prettify(color),
  })),
];

const accessoriesInGroup = (group) =>
  Object.keys(HedgehogActorAccessories).filter(
    (key) => HedgehogActorAccessories[key].group === group
  );

const ACCESSORY_GROUPS = [
  { group: "headwear", gridId: "headwearGrid" },
  { group: "eyewear", gridId: "eyewearGrid" },
  { group: "other", gridId: "otherGrid" },
].map((g) => ({ ...g, ids: accessoriesInGroup(g.group) }));

let currentConfig = {
  skin: "default",
  color: null,
  accessories: [],
  walking_enabled: true,
  interactions_enabled: true,
  controls_enabled: true,
};

// Render a StaticHedgehog into a container, reusing its React root across updates.
const staticRoots = new WeakMap();
function renderStatic(container, options) {
  let root = staticRoots.get(container);
  if (!root) {
    root = createRoot(container);
    staticRoots.set(container, root);
  }
  root.render(<StaticHedgehog options={options} assetsUrl={ASSETS_URL} size="100%" />);
}

function getCurrentSkinColorId() {
  if (currentConfig.skin && currentConfig.skin !== "default") return currentConfig.skin;
  return currentConfig.color || "default";
}

function createPreviewButton(options, title) {
  const btn = document.createElement("button");
  btn.className = "preview-btn";
  btn.title = title;
  btn.setAttribute("aria-label", title);
  btn.setAttribute("aria-pressed", "false");

  const container = document.createElement("div");
  container.className = "sprite-container";
  btn.appendChild(container);
  renderStatic(container, options);
  return btn;
}

function initSkinsGrid() {
  const container = document.getElementById("skinsGrid");
  SKINS_AND_COLORS.forEach((item) => {
    const btn = createPreviewButton(
      { skin: item.skin, color: item.color, accessories: [] },
      item.name
    );
    btn.dataset.skinColor = item.id;
    btn.addEventListener("click", () => selectSkinColor(item));
    container.appendChild(btn);
  });
}

function initAccessoryGrid({ gridId, ids }) {
  const container = document.getElementById(gridId);

  const noneBtn = createPreviewButton({ skin: "default", accessories: [] }, "None");
  noneBtn.dataset.accessory = NONE;
  noneBtn.addEventListener("click", () => selectAccessory(NONE, ids));
  container.appendChild(noneBtn);

  ids.forEach((id) => {
    const btn = createPreviewButton(
      { skin: "default", accessories: [id] },
      prettify(id)
    );
    btn.dataset.accessory = id;
    btn.addEventListener("click", () => selectAccessory(id, ids));
    container.appendChild(btn);
  });
}

function selectSkinColor(item) {
  currentConfig.skin = item.skin;
  currentConfig.color = item.color;
  updateUI();
  saveAndSendConfig();
}

function selectAccessory(id, groupIds) {
  currentConfig.accessories = currentConfig.accessories.filter(
    (a) => !groupIds.includes(a)
  );
  if (id !== NONE) {
    currentConfig.accessories.push(id);
  }
  updateUI();
  saveAndSendConfig();
}

function getCurrentAccessory(groupIds) {
  return currentConfig.accessories.find((a) => groupIds.includes(a)) || NONE;
}

function updatePreview() {
  renderStatic(document.getElementById("previewHedgehog"), {
    skin: currentConfig.skin,
    color: currentConfig.color,
    accessories: currentConfig.accessories,
  });
}

function updateUI() {
  const currentSkinColorId = getCurrentSkinColorId();
  document.querySelectorAll("#skinsGrid .preview-btn").forEach((btn) => {
    const isActive = btn.dataset.skinColor === currentSkinColorId;
    btn.classList.toggle("active", isActive);
    btn.setAttribute("aria-pressed", String(isActive));
  });

  ACCESSORY_GROUPS.forEach(({ gridId, ids }) => {
    const current = getCurrentAccessory(ids);
    document.querySelectorAll(`#${gridId} .preview-btn`).forEach((btn) => {
      const isActive = btn.dataset.accessory === current;
      btn.classList.toggle("active", isActive);
      btn.setAttribute("aria-pressed", String(isActive));
    });
  });

  document.getElementById("walkingEnabled").checked = currentConfig.walking_enabled;
  document.getElementById("interactionsEnabled").checked = currentConfig.interactions_enabled;
  document.getElementById("controlsEnabled").checked = currentConfig.controls_enabled;

  updatePreview();
}

function saveAndSendConfig() {
  chrome.storage.sync.set({ hedgehogConfig: currentConfig });
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs[0]) {
      chrome.tabs
        .sendMessage(tabs[0].id, { type: "UPDATE_CONFIG", config: currentConfig })
        .catch(() => {});
    }
  });
}

function toggleHedgehog(enabled) {
  chrome.storage.sync.set({ hedgehogEnabled: enabled });
}

function syncLiveConfig() {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (!tabs[0]) return;
    chrome.tabs.sendMessage(tabs[0].id, { type: "GET_STATUS" }, (response) => {
      if (chrome.runtime.lastError) return;
      if (response?.config) {
        currentConfig = { ...currentConfig, ...response.config };
        updateUI();
      }
    });
  });
}

function initSiteToggle() {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (!tabs[0]?.url) return;
    let hostname;
    try {
      hostname = new URL(tabs[0].url).hostname;
    } catch {
      return;
    }
    if (!hostname) return;

    document.getElementById("siteToggleLabel").textContent = `Disable on ${hostname}`;

    chrome.storage.sync.get(["disabledSites"], (result) => {
      const disabledSites = result.disabledSites || [];
      document.getElementById("siteToggle").checked = disabledSites.includes(hostname);
    });

    document.getElementById("siteToggle").addEventListener("change", (e) => {
      chrome.storage.sync.get(["disabledSites"], (result) => {
        let disabledSites = result.disabledSites || [];
        if (e.target.checked) {
          if (!disabledSites.includes(hostname)) disabledSites.push(hostname);
        } else {
          disabledSites = disabledSites.filter((s) => s !== hostname);
        }
        chrome.storage.sync.set({ disabledSites });
      });
    });
  });
}

document.addEventListener("DOMContentLoaded", () => {
  initSkinsGrid();
  ACCESSORY_GROUPS.forEach(initAccessoryGrid);
  initSiteToggle();

  chrome.storage.sync.get(["hedgehogEnabled", "hedgehogConfig"], (result) => {
    if (result.hedgehogConfig) {
      currentConfig = { ...currentConfig, ...result.hedgehogConfig };
    }
    document.getElementById("enableToggle").checked = result.hedgehogEnabled || false;
    updateUI();
  });

  syncLiveConfig();

  document.getElementById("enableToggle").addEventListener("change", (e) => {
    toggleHedgehog(e.target.checked);
  });

  const bindOption = (id, key) => {
    document.getElementById(id).addEventListener("change", (e) => {
      currentConfig[key] = e.target.checked;
      saveAndSendConfig();
    });
  };
  bindOption("walkingEnabled", "walking_enabled");
  bindOption("interactionsEnabled", "interactions_enabled");
  bindOption("controlsEnabled", "controls_enabled");
});
