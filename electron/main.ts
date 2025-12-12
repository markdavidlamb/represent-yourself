/**
 * Electron Main Process
 * Creates the native Mac window and handles system integration
 * Includes Claude authentication via BrowserView
 */

import { app, BrowserWindow, BrowserView, shell, Menu, ipcMain, dialog, protocol, session } from "electron";
import * as path from "path";
import * as fs from "fs";

// Keep a global reference of the window object
let mainWindow: BrowserWindow | null = null;
let claudeView: BrowserView | null = null;
let isClaudeAuthenticated = false;

// Development mode check
const isDev = process.env.NODE_ENV === "development";

// Claude auth configuration
const CLAUDE_URL = "https://claude.ai";
const AUTH_CHECK_INTERVAL = 5000; // Check auth status every 5 seconds when view is visible

// Register custom protocol for serving static files
function registerProtocol() {
  protocol.registerFileProtocol("app", (request, callback) => {
    let url = request.url.replace("app://", "");

    // Remove leading ./ or /
    url = url.replace(/^\.\//, "").replace(/^\//, "");

    // Handle root path
    if (url === "" || url === "index.html") {
      url = "index.html";
    }

    // Remove query strings and hash
    url = url.split("?")[0].split("#")[0];

    // Construct the file path
    const filePath = path.join(__dirname, "../out", url);

    // Check if it's a directory, serve index.html
    if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
      callback({ path: path.join(filePath, "index.html") });
    } else if (fs.existsSync(filePath)) {
      callback({ path: filePath });
    } else if (fs.existsSync(filePath + ".html")) {
      callback({ path: filePath + ".html" });
    } else {
      // Fallback to index.html for SPA routing
      callback({ path: path.join(__dirname, "../out/index.html") });
    }
  });
}

function createWindow() {
  // Create the browser window with Mac-native styling
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1000,
    minHeight: 600,
    titleBarStyle: "hiddenInset", // Mac-native title bar
    vibrancy: "sidebar", // Mac vibrancy effect
    backgroundColor: "#000000",
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, "preload.js"),
    },
    icon: path.join(__dirname, "../public/icon.png"),
  });

  // Load the app
  if (isDev) {
    // Development: Load from Next.js dev server
    mainWindow.loadURL("http://localhost:3000");
    mainWindow.webContents.openDevTools();
  } else {
    // Production: Load from custom protocol
    mainWindow.loadURL("app://./index.html");
  }

  // Open external links in default browser
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: "deny" };
  });

  // Handle window closed
  mainWindow.on("closed", () => {
    mainWindow = null;
  });

  // Create application menu
  createMenu();
}

function createMenu() {
  const template: Electron.MenuItemConstructorOptions[] = [
    {
      label: "Counsel",
      submenu: [
        { role: "about" },
        { type: "separator" },
        {
          label: "Preferences...",
          accelerator: "Cmd+,",
          click: () => {
            mainWindow?.webContents.send("navigate", "settings");
          },
        },
        { type: "separator" },
        { role: "services" },
        { type: "separator" },
        { role: "hide" },
        { role: "hideOthers" },
        { role: "unhide" },
        { type: "separator" },
        { role: "quit" },
      ],
    },
    {
      label: "File",
      submenu: [
        {
          label: "New Document",
          accelerator: "Cmd+N",
          click: () => {
            mainWindow?.webContents.send("navigate", "generate");
          },
        },
        {
          label: "Analyze Document...",
          accelerator: "Cmd+O",
          click: () => {
            mainWindow?.webContents.send("navigate", "analyze");
          },
        },
        { type: "separator" },
        { role: "close" },
      ],
    },
    {
      label: "Edit",
      submenu: [
        { role: "undo" },
        { role: "redo" },
        { type: "separator" },
        { role: "cut" },
        { role: "copy" },
        { role: "paste" },
        { role: "selectAll" },
      ],
    },
    {
      label: "View",
      submenu: [
        {
          label: "Inbox",
          accelerator: "Cmd+1",
          click: () => {
            mainWindow?.webContents.send("navigate", "inbox");
          },
        },
        {
          label: "Cases",
          accelerator: "Cmd+2",
          click: () => {
            mainWindow?.webContents.send("navigate", "cases");
          },
        },
        {
          label: "Analyze",
          accelerator: "Cmd+3",
          click: () => {
            mainWindow?.webContents.send("navigate", "analyze");
          },
        },
        {
          label: "Timeline",
          accelerator: "Cmd+4",
          click: () => {
            mainWindow?.webContents.send("navigate", "timeline");
          },
        },
        { type: "separator" },
        { role: "reload" },
        { role: "forceReload" },
        { role: "toggleDevTools" },
        { type: "separator" },
        { role: "resetZoom" },
        { role: "zoomIn" },
        { role: "zoomOut" },
        { type: "separator" },
        { role: "togglefullscreen" },
      ],
    },
    {
      label: "Go",
      submenu: [
        {
          label: "Search",
          accelerator: "Cmd+K",
          click: () => {
            mainWindow?.webContents.send("toggle-command-palette");
          },
        },
        { type: "separator" },
        {
          label: "Back",
          accelerator: "Cmd+[",
          click: () => {
            mainWindow?.webContents.goBack();
          },
        },
        {
          label: "Forward",
          accelerator: "Cmd+]",
          click: () => {
            mainWindow?.webContents.goForward();
          },
        },
      ],
    },
    {
      label: "Window",
      submenu: [
        { role: "minimize" },
        { role: "zoom" },
        { type: "separator" },
        { role: "front" },
      ],
    },
    {
      label: "Help",
      submenu: [
        {
          label: "Documentation",
          click: () => {
            shell.openExternal("https://github.com/counsel/counsel");
          },
        },
        {
          label: "Report Issue",
          click: () => {
            shell.openExternal("https://github.com/counsel/counsel/issues");
          },
        },
      ],
    },
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

// IPC handlers for file operations
ipcMain.handle("select-file", async (_event, options) => {
  const result = await dialog.showOpenDialog(mainWindow!, {
    properties: ["openFile"],
    filters: options?.filters || [
      { name: "Documents", extensions: ["pdf", "docx", "txt"] },
    ],
  });
  return result.filePaths[0];
});

ipcMain.handle("save-file", async (_event, options) => {
  const result = await dialog.showSaveDialog(mainWindow!, {
    defaultPath: options?.defaultPath,
    filters: options?.filters || [
      { name: "Documents", extensions: ["pdf", "docx", "txt"] },
    ],
  });
  return result.filePath;
});

// Open external URL in system browser
ipcMain.handle("open-external", async (_event, url: string) => {
  await shell.openExternal(url);
});

// App lifecycle
app.whenReady().then(() => {
  registerProtocol();
  createWindow();
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (mainWindow === null) {
    createWindow();
  }
});

// Security: Prevent navigation to external URLs (except Claude)
app.on("web-contents-created", (_event, contents) => {
  contents.on("will-navigate", (event, navigationUrl) => {
    const parsedUrl = new URL(navigationUrl);
    // Allow Claude.ai navigation in BrowserView
    if (parsedUrl.origin === CLAUDE_URL) {
      return;
    }
    if (parsedUrl.origin !== "http://localhost:3000" && !parsedUrl.protocol.startsWith("file:") && !parsedUrl.protocol.startsWith("app:")) {
      event.preventDefault();
      shell.openExternal(navigationUrl);
    }
  });
});

// ============================================================
// CLAUDE AUTHENTICATION VIA BROWSERVIEW
// ============================================================

// Create or get the Claude BrowserView
function getOrCreateClaudeView(): BrowserView {
  if (claudeView) {
    return claudeView;
  }

  claudeView = new BrowserView({
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      partition: "persist:claude", // Persist session across app restarts
    },
  });

  // Load Claude.ai
  claudeView.webContents.loadURL(CLAUDE_URL);

  // Track navigation to detect authentication
  claudeView.webContents.on("did-navigate", async (_event, url) => {
    await checkClaudeAuth();
    // Notify renderer of URL change
    mainWindow?.webContents.send("claude-url-changed", url);
  });

  claudeView.webContents.on("did-navigate-in-page", async (_event, url) => {
    await checkClaudeAuth();
    mainWindow?.webContents.send("claude-url-changed", url);
  });

  return claudeView;
}

// Check if user is authenticated with Claude
async function checkClaudeAuth(): Promise<boolean> {
  try {
    // Get cookies for claude.ai
    const cookies = await session.fromPartition("persist:claude").cookies.get({ domain: ".claude.ai" });

    // Check for session cookies that indicate authentication
    // Claude uses __cf_bm and other session cookies when logged in
    const hasSessionCookie = cookies.some(
      (c) => c.name.includes("session") || c.name === "__cf_bm" || c.name === "sessionKey"
    );

    // Also check the current URL - if on /new or /chat, likely authenticated
    const currentUrl = claudeView?.webContents.getURL() || "";
    const isOnAuthenticatedPage =
      currentUrl.includes("/new") ||
      currentUrl.includes("/chat") ||
      currentUrl.includes("/project");

    const wasAuthenticated = isClaudeAuthenticated;
    isClaudeAuthenticated = hasSessionCookie && isOnAuthenticatedPage;

    // Notify renderer if auth status changed
    if (wasAuthenticated !== isClaudeAuthenticated) {
      mainWindow?.webContents.send("claude-auth-changed", isClaudeAuthenticated);
    }

    return isClaudeAuthenticated;
  } catch (error) {
    console.error("Error checking Claude auth:", error);
    return false;
  }
}

// Show Claude BrowserView in the main window
function showClaudeView(bounds: { x: number; y: number; width: number; height: number }) {
  const view = getOrCreateClaudeView();

  if (mainWindow && !mainWindow.getBrowserViews().includes(view)) {
    mainWindow.addBrowserView(view);
  }

  view.setBounds(bounds);
  view.setAutoResize({ width: true, height: true });
}

// Hide Claude BrowserView
function hideClaudeView() {
  if (claudeView && mainWindow) {
    mainWindow.removeBrowserView(claudeView);
  }
}

// IPC handlers for Claude auth
ipcMain.handle("claude-show", async (_event, bounds) => {
  showClaudeView(bounds);
  return await checkClaudeAuth();
});

ipcMain.handle("claude-hide", async () => {
  hideClaudeView();
});

ipcMain.handle("claude-check-auth", async () => {
  return await checkClaudeAuth();
});

ipcMain.handle("claude-get-url", async () => {
  return claudeView?.webContents.getURL() || "";
});

ipcMain.handle("claude-navigate", async (_event, url) => {
  const view = getOrCreateClaudeView();
  await view.webContents.loadURL(url);
  return await checkClaudeAuth();
});

ipcMain.handle("claude-reload", async () => {
  claudeView?.webContents.reload();
});

ipcMain.handle("claude-go-back", async () => {
  if (claudeView?.webContents.canGoBack()) {
    claudeView.webContents.goBack();
  }
});

ipcMain.handle("claude-logout", async () => {
  // Clear Claude session cookies
  const ses = session.fromPartition("persist:claude");
  await ses.clearStorageData({ storages: ["cookies"] });
  isClaudeAuthenticated = false;
  mainWindow?.webContents.send("claude-auth-changed", false);

  // Reload to login page
  claudeView?.webContents.loadURL(CLAUDE_URL);
});

// Send a message to Claude (navigate to new chat with prefilled prompt)
ipcMain.handle("claude-send-prompt", async (_event, prompt: string) => {
  const view = getOrCreateClaudeView();
  // Navigate to new chat - the prompt will need to be entered manually
  // (Claude doesn't support URL-based prompt injection for security)
  await view.webContents.loadURL(`${CLAUDE_URL}/new`);
  return true;
});
