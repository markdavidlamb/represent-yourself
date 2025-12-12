/**
 * Claude OAuth Authentication
 *
 * Uses Claude Code's OAuth client ID to enable click-to-auth flow.
 * Users sign in with their Claude account (Free/Pro/Max) - no API keys needed.
 *
 * Based on: https://github.com/sst/opencode/blob/main/packages/opencode/src/auth/anthropic.ts
 */

// Claude Code's OAuth client ID (same one used by OpenCode)
const CLIENT_ID = "9d1c250a-e61b-44d9-88ed-5944d1962f5e";

// OAuth endpoints
const AUTH_URL = "https://claude.ai/oauth/authorize";
const TOKEN_URL = "https://console.anthropic.com/v1/oauth/token";
const REDIRECT_URI = "https://console.anthropic.com/oauth/code/callback";

// Scopes needed for API access
const SCOPES = "org:create_api_key user:profile user:inference";

// Storage keys
const STORAGE_KEYS = {
  accessToken: "claude_oauth_access_token",
  refreshToken: "claude_oauth_refresh_token",
  expiresAt: "claude_oauth_expires_at",
  codeVerifier: "claude_oauth_code_verifier",
  state: "claude_oauth_state",
};

/**
 * Generate a random string for PKCE
 */
function generateRandomString(length: number): string {
  const charset = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~";
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  return Array.from(array, (byte) => charset[byte % charset.length]).join("");
}

/**
 * Generate PKCE code verifier and challenge
 */
async function generatePKCE(): Promise<{ verifier: string; challenge: string }> {
  const verifier = generateRandomString(64);

  // Create SHA-256 hash of verifier
  const encoder = new TextEncoder();
  const data = encoder.encode(verifier);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);

  // Base64url encode the hash
  const hashArray = new Uint8Array(hashBuffer);
  const base64 = btoa(String.fromCharCode(...hashArray));
  const challenge = base64
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");

  return { verifier, challenge };
}

/**
 * Get the authorization URL to open in browser
 */
export async function getAuthorizationUrl(): Promise<string> {
  const { verifier, challenge } = await generatePKCE();
  const state = generateRandomString(32);

  // Store verifier and state for later use
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEYS.codeVerifier, verifier);
    localStorage.setItem(STORAGE_KEYS.state, state);
  }

  const params = new URLSearchParams({
    response_type: "code",
    client_id: CLIENT_ID,
    redirect_uri: REDIRECT_URI,
    scope: SCOPES,
    state: state,
    code_challenge: challenge,
    code_challenge_method: "S256",
  });

  return `${AUTH_URL}?${params.toString()}`;
}

/**
 * Exchange authorization code for tokens
 */
export async function exchangeCodeForTokens(
  code: string,
  state: string
): Promise<{ success: boolean; error?: string }> {
  if (typeof window === "undefined") {
    return { success: false, error: "Not in browser environment" };
  }

  // Verify state matches
  const storedState = localStorage.getItem(STORAGE_KEYS.state);
  if (state !== storedState) {
    return { success: false, error: "State mismatch - possible CSRF attack" };
  }

  const codeVerifier = localStorage.getItem(STORAGE_KEYS.codeVerifier);
  if (!codeVerifier) {
    return { success: false, error: "No code verifier found" };
  }

  try {
    const response = await fetch(TOKEN_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code: code,
        client_id: CLIENT_ID,
        redirect_uri: REDIRECT_URI,
        code_verifier: codeVerifier,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error("Token exchange failed:", error);
      return { success: false, error: `Token exchange failed: ${response.status}` };
    }

    const data = await response.json();

    // Store tokens
    const expiresAt = Date.now() + (data.expires_in * 1000);
    localStorage.setItem(STORAGE_KEYS.accessToken, data.access_token);
    localStorage.setItem(STORAGE_KEYS.refreshToken, data.refresh_token);
    localStorage.setItem(STORAGE_KEYS.expiresAt, expiresAt.toString());

    // Clean up PKCE data
    localStorage.removeItem(STORAGE_KEYS.codeVerifier);
    localStorage.removeItem(STORAGE_KEYS.state);

    return { success: true };
  } catch (error) {
    console.error("Token exchange error:", error);
    return { success: false, error: String(error) };
  }
}

/**
 * Refresh the access token
 */
export async function refreshAccessToken(): Promise<boolean> {
  if (typeof window === "undefined") return false;

  const refreshToken = localStorage.getItem(STORAGE_KEYS.refreshToken);
  if (!refreshToken) return false;

  try {
    const response = await fetch(TOKEN_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        grant_type: "refresh_token",
        refresh_token: refreshToken,
        client_id: CLIENT_ID,
      }),
    });

    if (!response.ok) {
      console.error("Token refresh failed:", response.status);
      return false;
    }

    const data = await response.json();

    // Store new tokens
    const expiresAt = Date.now() + (data.expires_in * 1000);
    localStorage.setItem(STORAGE_KEYS.accessToken, data.access_token);
    if (data.refresh_token) {
      localStorage.setItem(STORAGE_KEYS.refreshToken, data.refresh_token);
    }
    localStorage.setItem(STORAGE_KEYS.expiresAt, expiresAt.toString());

    return true;
  } catch (error) {
    console.error("Token refresh error:", error);
    return false;
  }
}

/**
 * Get a valid access token (refreshing if needed)
 */
export async function getAccessToken(): Promise<string | null> {
  if (typeof window === "undefined") return null;

  const accessToken = localStorage.getItem(STORAGE_KEYS.accessToken);
  const expiresAt = localStorage.getItem(STORAGE_KEYS.expiresAt);

  if (!accessToken) return null;

  // Check if token is expired or will expire in next 5 minutes
  const expiresAtMs = expiresAt ? parseInt(expiresAt, 10) : 0;
  const fiveMinutes = 5 * 60 * 1000;

  if (Date.now() + fiveMinutes >= expiresAtMs) {
    // Token expired or expiring soon - try to refresh
    const refreshed = await refreshAccessToken();
    if (!refreshed) {
      // Refresh failed - user needs to re-authenticate
      return null;
    }
    return localStorage.getItem(STORAGE_KEYS.accessToken);
  }

  return accessToken;
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated(): boolean {
  if (typeof window === "undefined") return false;

  const accessToken = localStorage.getItem(STORAGE_KEYS.accessToken);
  return !!accessToken;
}

/**
 * Sign out - clear all stored tokens
 */
export function signOut(): void {
  if (typeof window === "undefined") return;

  Object.values(STORAGE_KEYS).forEach((key) => {
    localStorage.removeItem(key);
  });
}

/**
 * Make an authenticated API call to Claude
 */
export async function callClaudeWithOAuth(
  systemPrompt: string,
  userMessage: string,
  maxTokens: number = 4096
): Promise<string> {
  const accessToken = await getAccessToken();

  if (!accessToken) {
    throw new Error("Not authenticated - please sign in with Claude");
  }

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${accessToken}`,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: maxTokens,
      temperature: 0.3,
      system: systemPrompt,
      messages: [{ role: "user", content: userMessage }],
    }),
  });

  if (!response.ok) {
    if (response.status === 401) {
      // Token invalid - try to refresh
      const refreshed = await refreshAccessToken();
      if (refreshed) {
        // Retry with new token
        return callClaudeWithOAuth(systemPrompt, userMessage, maxTokens);
      }
      throw new Error("Authentication expired - please sign in again");
    }

    const error = await response.json().catch(() => ({ error: { message: response.statusText } }));
    throw new Error(error.error?.message || `Claude API error: ${response.status}`);
  }

  const data = await response.json();
  return data.content[0]?.text || "";
}
