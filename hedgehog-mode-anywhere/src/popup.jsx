// Popup: the extension's control panel. The hedgehog customization grid IS the library's own
// HedgehogCustomization component — the very same one the in-page "Customize me!" panel uses —
// wrapped in HedgehogModeRendererContent so it inherits the engine's shadow-root styles. The
// controls that aren't hedgehog customization (global enable, per-site disable, and the
// click/drag "Interact with elements" switch the library UI doesn't expose) live in the shell
// around it.
//
// All state lives in chrome.storage.sync, shared across every tab, window and session. Editing
// here writes there; each content script reacts via chrome.storage.onChanged. We also listen for
// changes so the popup reflects edits made from the in-page panel while it happens to be open.
import { useEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  HedgehogCustomization,
  HedgehogModeRendererContent,
} from "@posthog/hedgehog-mode";
import {
  DEFAULT_CONFIG,
  toActorOptions,
  fromActorOptions,
} from "./hedgehog-config";

const ASSETS_URL = chrome.runtime.getURL("assets");

const hostnameOf = (url) => {
  try {
    return new URL(url).hostname;
  } catch {
    return null;
  }
};

// The player hedgehog as the engine (and HedgehogCustomization) sees it.
const toActorConfig = (stored) => ({
  id: "player",
  player: true,
  ...toActorOptions(stored || DEFAULT_CONFIG),
});

function Toggle({ label, checked, onChange, className = "toggle-pill" }) {
  return (
    <label className={className}>
      <span>{label}</span>
      <span className="toggle">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          aria-label={label}
        />
        <span className="toggle-slider" />
      </span>
    </label>
  );
}

function App() {
  const [enabled, setEnabled] = useState(false);
  const [disabledSites, setDisabledSites] = useState([]);
  const [hostname, setHostname] = useState(null);
  const [actorConfig, setActorConfig] = useState(() =>
    toActorConfig(DEFAULT_CONFIG)
  );
  // JSON of the stored config we last wrote or received, so an onChanged event that just echoes
  // our own edit doesn't re-render the whole customization grid again.
  const lastConfigJson = useRef(null);

  // Load initial state + the active tab's hostname.
  useEffect(() => {
    chrome.storage.sync.get(
      ["hedgehogEnabled", "hedgehogConfig", "disabledSites"],
      (result) => {
        setEnabled(!!result.hedgehogEnabled);
        setDisabledSites(result.disabledSites || []);
        lastConfigJson.current = JSON.stringify(result.hedgehogConfig ?? null);
        setActorConfig(toActorConfig(result.hedgehogConfig));
      }
    );
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      setHostname(tabs[0]?.url ? hostnameOf(tabs[0].url) : null);
    });
  }, []);

  // Stay in step with edits from other tabs / the in-page panel while the popup is open.
  useEffect(() => {
    const onChanged = (changes, area) => {
      if (area !== "sync") return;
      if (changes.hedgehogEnabled) {
        setEnabled(!!changes.hedgehogEnabled.newValue);
      }
      if (changes.disabledSites) {
        setDisabledSites(changes.disabledSites.newValue || []);
      }
      if (changes.hedgehogConfig) {
        const json = JSON.stringify(changes.hedgehogConfig.newValue ?? null);
        if (json !== lastConfigJson.current) {
          lastConfigJson.current = json;
          setActorConfig(toActorConfig(changes.hedgehogConfig.newValue));
        }
      }
    };
    chrome.storage.onChanged.addListener(onChanged);
    return () => chrome.storage.onChanged.removeListener(onChanged);
  }, []);

  const saveConfig = (next) => {
    setActorConfig(next);
    const stored = fromActorOptions(next);
    lastConfigJson.current = JSON.stringify(stored);
    chrome.storage.sync.set({ hedgehogConfig: stored });
  };

  const toggleEnabled = (value) => {
    setEnabled(value);
    // The background service worker watches this flag and injects into open tabs.
    chrome.storage.sync.set({ hedgehogEnabled: value });
  };

  const toggleSiteDisabled = (disabled) => {
    if (!hostname) return;
    const next = disabled
      ? [...new Set([...disabledSites, hostname])]
      : disabledSites.filter((s) => s !== hostname);
    setDisabledSites(next);
    chrome.storage.sync.set({ disabledSites: next });
  };

  const siteDisabled = !!hostname && disabledSites.includes(hostname);

  return (
    <>
      <div className="header">
        <h1>Hedgehog mode</h1>
      </div>

      <div className="top-toggles">
        <Toggle
          label="Enabled hedgehog mode"
          checked={enabled}
          onChange={toggleEnabled}
        />
        <Toggle
          label={hostname ? `Disable on ${hostname}` : "Disable on this site"}
          checked={siteDisabled}
          onChange={toggleSiteDisabled}
        />
      </div>

      <div className="options-toggles">
        <Toggle
          className="option-toggle"
          label="Interact with elements"
          checked={actorConfig.interactions_enabled ?? true}
          onChange={(v) =>
            saveConfig({ ...actorConfig, interactions_enabled: v })
          }
        />
      </div>

      <HedgehogModeRendererContent id="hedgehog-customization" theme="dark">
        <HedgehogCustomization
          config={actorConfig}
          setConfig={saveConfig}
          assetsUrl={ASSETS_URL}
        />
      </HedgehogModeRendererContent>

      <div className="footer">
        Made with love by{" "}
        <a href="https://posthog.com" target="_blank" rel="noreferrer">
          PostHog
        </a>
      </div>
    </>
  );
}

createRoot(document.getElementById("root")).render(<App />);
