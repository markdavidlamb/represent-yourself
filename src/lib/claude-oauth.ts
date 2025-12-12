/**
 * Claude OAuth Module
 *
 * Uses Claude Code's OAuth client ID for authentication.
 * This is the same approach used by OpenCode.
 */

// Claude Code's OAuth client ID (used by Claude Code and OpenCode)
const CLIENT_ID = "9d1c250a-e61b-44d9-88ed-5944d1962f5e";

// OAuth endpoints
const AUTHORIZATION_URL = "https://claude.ai/oauth/authorize";
const TOKEN_URL = "https://console.anthropic.com/v1/oauth/token";

// PKCE utilities
async function generateCodeVerifier(): Promise<string> {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, "0")).join("");
}

async function generateCodeChallenge(verifier: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(verifier);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);

  // Convert to base64url without spread operator
  const hashArray = new Uint8Array(hashBuffer);
  let binary = "";
  for (let i = 0; i < hashArray.length; i++) {
    binary += String.fromCharCode(hashArray[i]);
  }
  const base64 = btoa(binary);
  return base64
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

// Storage keys
const PKCE_VERIFIER_KEY = "claude_pkce_verifier";
const OAUTH_TOKEN_KEY = "claude_oauth_token";
const OAUTH_REFRESH_KEY = "claude_oauth_refresh";
const OAUTH_EXPIRY_KEY = "claude_oauth_expiry";

export interface OAuthTokens {
  access_token: string;
  refresh_token?: string;
  expires_in?: number;
}

/**
 * Generate PKCE values for the OAuth flow
 */
export async function generatePKCE(): Promise<{ verifier: string; challenge: string }> {
  const verifier = await generateCodeVerifier();
  const challenge = await generateCodeChallenge(verifier);
  return { verifier, challenge };
}

/**
 * Get the authorization URL for Claude OAuth
 */
export async function getAuthorizationUrl(): Promise<{ url: string; verifier: string }> {
  const { verifier, challenge } = await generatePKCE();

  // Store verifier for token exchange
  localStorage.setItem(PKCE_VERIFIER_KEY, verifier);

  const params = new URLSearchParams({
    response_type: "code",
    client_id: CLIENT_ID,
    redirect_uri: "https://claude.ai/oauth/callback",
    code_challenge: challenge,
    code_challenge_method: "S256",
    scope: "user:inference",
  });

  return {
    url: `${AUTHORIZATION_URL}?${params.toString()}`,
    verifier,
  };
}

/**
 * Exchange authorization code for tokens
 */
export async function exchangeCodeForTokens(code: string): Promise<OAuthTokens> {
  const verifier = localStorage.getItem(PKCE_VERIFIER_KEY);
  if (!verifier) {
    throw new Error("No PKCE verifier found. Please start the auth flow again.");
  }

  // Clean the code - remove any fragment identifier
  const cleanCode = code.split("#")[0].trim();

  const response = await fetch(TOKEN_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      client_id: CLIENT_ID,
      code: cleanCode,
      redirect_uri: "https://claude.ai/oauth/callback",
      code_verifier: verifier,
    }).toString(),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Token exchange failed: ${response.status} - ${errorText}`);
  }

  const tokens: OAuthTokens = await response.json();

  // Store tokens
  localStorage.setItem(OAUTH_TOKEN_KEY, tokens.access_token);
  if (tokens.refresh_token) {
    localStorage.setItem(OAUTH_REFRESH_KEY, tokens.refresh_token);
  }
  if (tokens.expires_in) {
    const expiry = Date.now() + tokens.expires_in * 1000;
    localStorage.setItem(OAUTH_EXPIRY_KEY, expiry.toString());
  }

  // Clear verifier
  localStorage.removeItem(PKCE_VERIFIER_KEY);

  return tokens;
}

/**
 * Get stored OAuth token
 */
export function getStoredToken(): string | null {
  const token = localStorage.getItem(OAUTH_TOKEN_KEY);
  const expiry = localStorage.getItem(OAUTH_EXPIRY_KEY);

  // Check if token is expired
  if (expiry && Date.now() > parseInt(expiry, 10)) {
    // Token expired - could implement refresh here
    return null;
  }

  return token;
}

/**
 * Clear stored OAuth tokens
 */
export function clearTokens(): void {
  localStorage.removeItem(OAUTH_TOKEN_KEY);
  localStorage.removeItem(OAUTH_REFRESH_KEY);
  localStorage.removeItem(OAUTH_EXPIRY_KEY);
  localStorage.removeItem(PKCE_VERIFIER_KEY);
}

/**
 * Check if user is authenticated via OAuth
 */
export function isOAuthAuthenticated(): boolean {
  return getStoredToken() !== null;
}
