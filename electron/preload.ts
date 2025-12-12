/**
 * Electron Preload Script
 * Exposes safe APIs to the renderer process
 * Includes Claude authentication APIs
 */

import { contextBridge, ipcRenderer } from "electron";

// Expose protected methods to the renderer process
contextBridge.exposeInMainWorld("electronAPI", {
  // File operations
  selectFile: (options?: { filters?: { name: string; extensions: string[] }[] }) =>
    ipcRenderer.invoke("select-file", options),

  saveFile: (options?: { defaultPath?: string; filters?: { name: string; extensions: string[] }[] }) =>
    ipcRenderer.invoke("save-file", options),

  // Open external URL in system browser
  openExternal: (url: string) => ipcRenderer.invoke("open-external", url),

  // Navigation events from menu
  onNavigate: (callback: (view: string) => void) => {
    ipcRenderer.on("navigate", (_event, view) => callback(view));
  },

  onToggleCommandPalette: (callback: () => void) => {
    ipcRenderer.on("toggle-command-palette", () => callback());
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
  claudeShow: (bounds: { x: number; y: number; width: number; height: number }) =>
    ipcRenderer.invoke("claude-show", bounds),

  // Hide Claude BrowserView
  claudeHide: () => ipcRenderer.invoke("claude-hide"),

  // Check if user is authenticated with Claude
  claudeCheckAuth: () => ipcRenderer.invoke("claude-check-auth"),

  // Get current Claude URL
  claudeGetUrl: () => ipcRenderer.invoke("claude-get-url"),

  // Navigate Claude to a URL
  claudeNavigate: (url: string) => ipcRenderer.invoke("claude-navigate", url),

  // Reload Claude
  claudeReload: () => ipcRenderer.invoke("claude-reload"),

  // Go back in Claude
  claudeGoBack: () => ipcRenderer.invoke("claude-go-back"),

  // Logout from Claude
  claudeLogout: () => ipcRenderer.invoke("claude-logout"),

  // Send a prompt to Claude
  claudeSendPrompt: (prompt: string) => ipcRenderer.invoke("claude-send-prompt", prompt),

  // Listen for Claude auth status changes
  onClaudeAuthChanged: (callback: (isAuthenticated: boolean) => void) => {
    ipcRenderer.on("claude-auth-changed", (_event, isAuthenticated) => callback(isAuthenticated));
  },

  // Listen for Claude URL changes
  onClaudeUrlChanged: (callback: (url: string) => void) => {
    ipcRenderer.on("claude-url-changed", (_event, url) => callback(url));
  },
});

// TypeScript declaration for window.electronAPI
declare global {
  interface Window {
    electronAPI: {
      // File operations
      selectFile: (options?: { filters?: { name: string; extensions: string[] }[] }) => Promise<string | undefined>;
      saveFile: (options?: { defaultPath?: string; filters?: { name: string; extensions: string[] }[] }) => Promise<string | undefined>;

      // Open external URL in system browser
      openExternal: (url: string) => Promise<void>;

      // Navigation
      onNavigate: (callback: (view: string) => void) => void;
      onToggleCommandPalette: (callback: () => void) => void;

      // Platform info
      platform: string;
      versions: {
        node: string;
        chrome: string;
        electron: string;
      };

      // Claude auth
      claudeShow: (bounds: { x: number; y: number; width: number; height: number }) => Promise<boolean>;
      claudeHide: () => Promise<void>;
      claudeCheckAuth: () => Promise<boolean>;
      claudeGetUrl: () => Promise<string>;
      claudeNavigate: (url: string) => Promise<boolean>;
      claudeReload: () => Promise<void>;
      claudeGoBack: () => Promise<void>;
      claudeLogout: () => Promise<void>;
      claudeSendPrompt: (prompt: string) => Promise<boolean>;
      onClaudeAuthChanged: (callback: (isAuthenticated: boolean) => void) => void;
      onClaudeUrlChanged: (callback: (url: string) => void) => void;
    };
  }
}
