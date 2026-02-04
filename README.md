<p align="center">
  <img src="icons/logo.png" alt="Sidebarzz Logo" width="275" />
</p>

<h1 align="center">Sidebarzz</h1>

<p align="center">
  Workspace-based browsing via a <strong>custom injected sidebar</strong>.
</p>

<p align="center">
  <em>The only supported UI is the injected sidebar. Chrome’s built-in side panel is not used.</em>
</p>

---

## Overview

**Sidebarzz** is a Chrome extension for managing **workspaces, bookmarks, and tabs** using a **sidebar injected into every page**. Each workspace is isolated, making it easy to separate work, personal, and project contexts.

The **injected sidebar** (content script + `sidebar.css`) is the **only supported UI**. There is no dependency on Chrome’s native side panel.

---

## Project Structure

```
├── dist/                # Runtime output
│   ├── background.js    # Built from src/
│   ├── content.js      # Injected sidebar logic
│   ├── sidebar.css      # Injected sidebar styles
│   ├── popup.html/js    # Toolbar popup (toggle sidebar)
│   ├── options.html/js  # Extension options
│   └── ...
│
├── src/                 # TypeScript / CSS sources
│   ├── background.ts
│   ├── storage.ts
│   ├── content.js
│   └── sidebar.css
│
├── build.js
├── manifest.json
└── package.json
```

---

## Setup

```bash
pnpm install
pnpm run build
```

Load unpacked via `chrome://extensions` (Developer Mode enabled).

---

## Features

- Workspace-specific bookmarks and tabs
- Automatic tab restoration per workspace
- Adjustable sidebar width, margins, and mode
- Fixed or floating (hover) sidebar
- Collapsible panel
- Drag-and-drop bookmark ordering
- Per-workspace behavior and appearance settings

---

## Development

- **TypeScript** (strict)
- **esbuild** bundling
- **Manifest V3**
- **Storage:** `chrome.storage.local`
- **Primary UI:** injected content script

---

## Privacy

Sidebarzz does **not** collect or transmit data.

All data stays on your device:

- Workspace names and IDs
- Bookmarks (URLs, titles)
- Tabs for restoration
- Sidebar settings

---

## Known Issues

- Switching workspaces across multiple Chrome windows may clear tabs for that workspace.

---

## Future Roadmap

- Workspace-scoped history, passwords, and autofill
- Multiple sidebars per workspace
- Bottom-docked sidebar support
- Improved multi-window handling
