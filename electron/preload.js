"use strict";
/**
 * Electron Preload Script
 * Exposes safe APIs to the renderer process
 * Includes Claude authentication APIs
 */
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
// Expose protected methods to the renderer process
electron_1.contextBridge.exposeInMainWorld("electronAPI", {
    // File operations
    selectFile: (options) => electron_1.ipcRenderer.invoke("select-file", options),
    saveFile: (options) => electron_1.ipcRenderer.invoke("save-file", options),
    // Open external URL in system browser
    openExternal: (url) => electron_1.ipcRenderer.invoke("open-external", url),
    // Navigation events from menu
    onNavigate: (callback) => {
        electron_1.ipcRenderer.on("navigate", (_event, view) => callback(view));
    },
    onToggleCommandPalette: (callback) => {
        electron_1.ipcRenderer.on("toggle-command-palette", () => callback());
    },
    // Platform info
    platform: process.platform,
    // Version info
    versions: {
        node: process.versions.node,
        chrome: process.versions.chrome,
        electron: process.versions.electron,
    },
    // ============================================================
    // CLAUDE AUTHENTICATION APIs
    // ============================================================
    // Show Claude BrowserView in specified bounds
    claudeShow: (bounds) => electron_1.ipcRenderer.invoke("claude-show", bounds),
    // Hide Claude BrowserView
    claudeHide: () => electron_1.ipcRenderer.invoke("claude-hide"),
    // Check if user is authenticated with Claude
    claudeCheckAuth: () => electron_1.ipcRenderer.invoke("claude-check-auth"),
    // Get current Claude URL
    claudeGetUrl: () => electron_1.ipcRenderer.invoke("claude-get-url"),
    // Navigate Claude to a URL
    claudeNavigate: (url) => electron_1.ipcRenderer.invoke("claude-navigate", url),
    // Reload Claude
    claudeReload: () => electron_1.ipcRenderer.invoke("claude-reload"),
    // Go back in Claude
    claudeGoBack: () => electron_1.ipcRenderer.invoke("claude-go-back"),
    // Logout from Claude
    claudeLogout: () => electron_1.ipcRenderer.invoke("claude-logout"),
    // Send a prompt to Claude
    claudeSendPrompt: (prompt) => electron_1.ipcRenderer.invoke("claude-send-prompt", prompt),
    // Listen for Claude auth status changes
    onClaudeAuthChanged: (callback) => {
        electron_1.ipcRenderer.on("claude-auth-changed", (_event, isAuthenticated) => callback(isAuthenticated));
    },
    // Listen for Claude URL changes
    onClaudeUrlChanged: (callback) => {
        electron_1.ipcRenderer.on("claude-url-changed", (_event, url) => callback(url));
    },
});
