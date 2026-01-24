# Chrome Extension Troubleshooting

## `tabs.get` with invalid or missing tab IDs

If you see errors like:

- `Error at parameter 'tabId': Value must be at least 0.`
- `Unchecked runtime.lastError: No tab with id: <id>.`

it means the extension called `chrome.tabs.get` with a `tabId` that is either invalid (`-1`) or refers to a tab that was already closed. This happens most often when listening to web navigation events (including sub-frame navigation), where Chrome can emit events for:

- pre-rendered or discarded tabs (tabId `-1`), or
- frames whose parent tab has already closed by the time your async handler runs.

### Recommended guardrails

1. **Validate the tab ID before calling `chrome.tabs.get`.**
   - Only call `chrome.tabs.get` when `tabId >= 0`.
2. **Handle `runtime.lastError` in the callback or promise rejection.**
   - When a tab is closed between event emission and lookup, ignore the error instead of throwing.
3. **Short-circuit on missing tabs.**
   - If the lookup fails, skip downstream logic that requires tab metadata.

### Example pattern

```js
if (typeof tabId === 'number' && tabId >= 0) {
  chrome.tabs.get(tabId, (tab) => {
    if (chrome.runtime.lastError || !tab) {
      return; // Tab is gone or invalid; safely ignore.
    }

    // Safe to use tab data here.
  });
}
```

These guardrails prevent both the `tabId` validation error and the repeated `No tab with id` runtime errors when tabs close mid-flight.
