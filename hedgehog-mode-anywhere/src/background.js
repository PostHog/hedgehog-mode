// The manifest content script only reaches tabs loaded after the extension is enabled; tabs
// already open when the toggle flips stay empty until a refresh. On enable, inject into them
// here (in the worker, so it runs whether or not the popup is open). Tabs that already have the
// script answer the ping and start via their own storage.onChanged listener — don't double-inject.

const injectIntoOpenTabs = () => {
  chrome.tabs.query({}, (tabs) => {
    for (const tab of tabs) {
      const tabId = tab.id;
      // executeScript only works on http(s) pages — skip chrome://, the web store, etc.
      if (tabId == null || !/^https?:/.test(tab.url || "")) continue;
      chrome.tabs.sendMessage(tabId, { type: "GET_STATUS" }, () => {
        if (!chrome.runtime.lastError) return;
        chrome.scripting.executeScript(
          { target: { tabId }, files: ["dist/content.js"] },
          () => void chrome.runtime.lastError
        );
      });
    }
  });
};

chrome.storage.onChanged.addListener((changes, area) => {
  if (area !== "sync") return;
  if (changes.hedgehogEnabled?.newValue) injectIntoOpenTabs();
});
