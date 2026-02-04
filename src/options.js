// Options page: injected sidebar and extension settings only. Uses workspaceData as single source of truth.

// Minimal default settings for new workspaces (must match storage.ts DEFAULT_SETTINGS shape)
const DEFAULT_SETTINGS = {
  roundedCorners: true,
  marginFromSide: 0,
  marginTop: 0,
  marginBottom: 0,
  width: 52,
  borderRadius: 0,
  iconBorderRadius: 25,
  position: 'left',
  alignment: 'top',
  backgroundColor: '#252526',
  iconBackgroundColor: '#2d2d2d',
  iconTextColor: '#d4d4d4',
  borderColor: '#3e3e42',
  accentColor: '#007acc',
  mode: 'fixed',
  collapsible: false,
  collapsed: false,
  onCloseBehavior: 'continue',
  defaultTabs: [],
  iconPackId: 'minimalist',
  themeId: 'dark',
  customThemes: []
};

function getDefaultWorkspaceData() {
  const now = Date.now();
  return {
    workspaces: [{
      id: 'default',
      name: 'Default',
      active: true,
      bookmarks: [],
      openTabs: [],
      closedTabs: [],
      settings: { ...DEFAULT_SETTINGS },
      createdAt: now,
      updatedAt: now
    }],
    currentWorkspaceId: 'default'
  };
}

document.addEventListener('DOMContentLoaded', () => {
  loadSettings();
  setupEventListeners();
});

function loadSettings() {
  chrome.storage.local.get('workspaceData', (data) => {
    let wd = data.workspaceData;
    if (!wd || !wd.workspaces || wd.workspaces.length === 0) {
      wd = getDefaultWorkspaceData();
      chrome.storage.local.set({ workspaceData: wd });
    }
    const currentId = wd.currentWorkspaceId || wd.workspaces[0].id;
    const current = wd.workspaces.find((w) => w.id === currentId) || wd.workspaces[0];
    const position = (current.settings && current.settings.position) ? current.settings.position : 'left';
    const positionEl = document.querySelector(`input[name="position"][value="${position}"]`);
    if (positionEl) positionEl.checked = true;
    renderWorkspaces(wd.workspaces, wd.currentWorkspaceId);
    renderBookmarks(current.bookmarks || []);
  });
}

function renderWorkspaces(workspaces, currentWorkspaceId) {
  const container = document.getElementById('workspaces-list');
  container.innerHTML = '';
  workspaces.forEach((ws) => {
    const item = document.createElement('div');
    item.className = 'list-item';
    item.setAttribute('data-workspace-id', ws.id);
    item.innerHTML = `
      <div class="item-info">
        <input type="text" class="workspace-name" value="${escapeAttr(ws.name)}" placeholder="Workspace name">
      </div>
      <button class="btn btn-small btn-danger" type="button">Delete</button>
    `;
    const deleteBtn = item.querySelector('.btn-danger');
    deleteBtn.addEventListener('click', () => deleteWorkspace(ws.id));
    container.appendChild(item);
  });
}

function renderBookmarks(bookmarks) {
  const container = document.getElementById('bookmarks-list');
  container.innerHTML = '';
  (bookmarks || []).forEach((bm) => {
    const item = document.createElement('div');
    item.className = 'list-item';
    item.setAttribute('data-bookmark-id', bm.id);
    item.innerHTML = `
      <div class="item-info">
        <input type="text" class="bookmark-title" value="${escapeAttr(bm.title)}" placeholder="Title">
        <input type="url" class="bookmark-url" value="${escapeAttr(bm.url)}" placeholder="https://example.com">
      </div>
      <button class="btn btn-small btn-danger" type="button">Delete</button>
    `;
    const deleteBtn = item.querySelector('.btn-danger');
    deleteBtn.addEventListener('click', () => deleteBookmark(bm.id, item));
    container.appendChild(item);
  });
}

function escapeAttr(s) {
  if (s == null) return '';
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function setupEventListeners() {
  document.getElementById('save-btn').addEventListener('click', saveSettings);
  document.getElementById('reset-btn').addEventListener('click', resetToDefaults);
  document.getElementById('add-workspace-btn').addEventListener('click', addWorkspace);
  document.getElementById('add-bookmark-btn').addEventListener('click', addBookmark);
}

function saveSettings() {
  chrome.storage.local.get('workspaceData', (data) => {
    let wd = data.workspaceData;
    if (!wd || !wd.workspaces || wd.workspaces.length === 0) {
      wd = getDefaultWorkspaceData();
    }
    const position = (document.querySelector('input[name="position"]:checked') || {}).value || 'left';
    const workspaceRows = document.querySelectorAll('#workspaces-list .list-item');
    const existingIds = new Set(wd.workspaces.map((w) => w.id));
    const now = Date.now();
    const updatedWorkspaces = [];
    workspaceRows.forEach((row, i) => {
      const id = row.getAttribute('data-workspace-id');
      const name = (row.querySelector('.workspace-name') || {}).value || 'Workspace';
      const existing = wd.workspaces.find((w) => w.id === id);
      if (existing) {
        existing.name = name;
        existing.updatedAt = now;
        updatedWorkspaces.push(existing);
      } else {
        updatedWorkspaces.push({
          id: id || `workspace-${now}-${i}`,
          name,
          active: false,
          bookmarks: [],
          openTabs: [],
          closedTabs: [],
          settings: { ...DEFAULT_SETTINGS },
          createdAt: now,
          updatedAt: now
        });
      }
    });
    wd.workspaces = updatedWorkspaces;
    if (!wd.workspaces.some((w) => w.id === wd.currentWorkspaceId)) {
      wd.currentWorkspaceId = wd.workspaces[0].id;
    }
    const current = wd.workspaces.find((w) => w.id === wd.currentWorkspaceId) || wd.workspaces[0];
    current.settings = current.settings || {};
    current.settings.position = position;
    const bookmarkRows = document.querySelectorAll('#bookmarks-list .list-item');
    const bookmarks = [];
    bookmarkRows.forEach((row, i) => {
      const bid = row.getAttribute('data-bookmark-id');
      const titleInput = row.querySelector('.bookmark-title');
      const urlInput = row.querySelector('.bookmark-url');
      const title = (titleInput && titleInput.value) ? titleInput.value.trim() : '';
      const url = (urlInput && urlInput.value) ? urlInput.value.trim() : '';
      if (!url) return;
      bookmarks.push({
        id: bid || `bookmark-${now}-${i}`,
        title: title || new URL(url).hostname,
        url
      });
    });
    current.bookmarks = bookmarks;
    current.updatedAt = now;
    chrome.storage.local.set({ workspaceData: wd }, () => {
      showStatus('Settings saved!', 'success');
      loadSettings();
      chrome.tabs.query({}, (tabs) => {
        tabs.forEach((tab) => {
          chrome.tabs.sendMessage(tab.id, { type: 'RELOAD_SIDEBAR' }).catch(() => {});
        });
      });
    });
  });
}

function resetToDefaults() {
  if (!confirm('Reset all settings to defaults? This will replace workspaces and bookmarks with one default workspace.')) return;
  const wd = getDefaultWorkspaceData();
  chrome.storage.local.set({ workspaceData: wd }, () => {
    loadSettings();
    showStatus('Settings reset to defaults', 'success');
    chrome.tabs.query({}, (tabs) => {
      tabs.forEach((tab) => {
        chrome.tabs.sendMessage(tab.id, { type: 'RELOAD_SIDEBAR' }).catch(() => {});
      });
    });
  });
}

function addWorkspace() {
  const name = prompt('Enter workspace name:') || 'New Workspace';
  const container = document.getElementById('workspaces-list');
  const item = document.createElement('div');
  item.className = 'list-item';
  item.setAttribute('data-workspace-id', '');
  item.innerHTML = `
    <div class="item-info">
      <input type="text" class="workspace-name" value="${escapeAttr(name)}" placeholder="Workspace name">
    </div>
    <button class="btn btn-small btn-danger" type="button">Delete</button>
  `;
  const deleteBtn = item.querySelector('.btn-danger');
  deleteBtn.addEventListener('click', () => {
    const id = item.getAttribute('data-workspace-id');
    if (id) deleteWorkspace(id);
    else item.remove();
  });
  container.appendChild(item);
}

function addBookmark() {
  const title = prompt('Enter bookmark title:') || '';
  const url = prompt('Enter bookmark URL:') || '';
  if (!url) return;
  const container = document.getElementById('bookmarks-list');
  const item = document.createElement('div');
  item.className = 'list-item';
  item.setAttribute('data-bookmark-id', '');
  item.innerHTML = `
    <div class="item-info">
      <input type="text" class="bookmark-title" value="${escapeAttr(title)}" placeholder="Title">
      <input type="url" class="bookmark-url" value="${escapeAttr(url)}" placeholder="https://example.com">
    </div>
    <button class="btn btn-small btn-danger" type="button">Delete</button>
  `;
  const deleteBtn = item.querySelector('.btn-danger');
  deleteBtn.addEventListener('click', () => item.remove());
  container.appendChild(item);
}

function deleteWorkspace(id) {
  if (!confirm('Delete this workspace?')) return;
  chrome.storage.local.get('workspaceData', (data) => {
    let wd = data.workspaceData;
    if (!wd || !wd.workspaces || wd.workspaces.length <= 1) {
      alert('Cannot delete the last workspace');
      return;
    }
    wd.workspaces = wd.workspaces.filter((w) => w.id !== id);
    if (wd.currentWorkspaceId === id) {
      wd.currentWorkspaceId = wd.workspaces[0].id;
    }
    chrome.storage.local.set({ workspaceData: wd }, () => {
      loadSettings();
    });
  });
}

function deleteBookmark(id, rowEl) {
  if (!confirm('Delete this bookmark?')) return;
  if (rowEl) {
    rowEl.remove();
    saveSettings();
  }
}

function showStatus(message, type = 'info') {
  const statusEl = document.getElementById('status-message');
  statusEl.textContent = message;
  statusEl.className = `status-message status-${type}`;
  setTimeout(() => {
    statusEl.textContent = '';
  }, 3000);
}
