"use client";

/**
 * Provider Gate
 *
 * Multi-provider API key authentication for AI services.
 * Supports Gemini (free), Claude, and OpenAI.
 */

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  Shield,
  Zap,
  ExternalLink,
  Clipboard,
  RefreshCw,
  Key,
  CheckCircle,
  AlertCircle,
  ChevronRight,
} from "lucide-react";
import { Button } from "../ui/Button";
import { Card, CardContent } from "../ui/Card";
import {
  PROVIDERS,
  AIProvider,
  getProvider,
  setProvider,
  getApiKey,
  setApiKey,
  hasApiKey,
} from "../../lib/ai-service";

interface ProviderGateProps {
  children: React.ReactNode;
}

export const ProviderGate: React.FC<ProviderGateProps> = ({ children }) => {
  const [isAuthed, setIsAuthed] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(true);
  const [selectedProvider, setSelectedProvider] = React.useState<AIProvider>("gemini");
  const [showKeyInput, setShowKeyInput] = React.useState(false);
  const [apiKey, setApiKeyInput] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [isValidating, setIsValidating] = React.useState(false);

  // Check auth status on mount
  React.useEffect(() => {
    const currentProvider = getProvider();
    setSelectedProvider(currentProvider);
    if (hasApiKey(currentProvider)) {
      setIsAuthed(true);
    }
    setIsLoading(false);
  }, []);

  // Validate API key based on provider
  const validateAndSaveKey = async (key: string, provider: AIProvider) => {
    setIsValidating(true);
    setError(null);

    try {
      const providerInfo = PROVIDERS.find((p) => p.id === provider);
      if (!providerInfo) throw new Error("Unknown provider");

      // Validate key format
      if (provider === "gemini" && !key.startsWith("AIza")) {
        setError("Gemini API key should start with AIza...");
        setIsValidating(false);
        return;
      }
      if (provider === "claude" && !key.startsWith("sk-ant-")) {
        setError("Claude API key should start with sk-ant-...");
        setIsValidating(false);
        return;
      }
      if (provider === "openai" && !key.startsWith("sk-")) {
        setError("OpenAI API key should start with sk-...");
        setIsValidating(false);
        return;
      }

      // Test the key with a minimal request
      let isValid = false;

      if (provider === "gemini") {
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${key}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [{ parts: [{ text: "Hi" }] }],
              generationConfig: { maxOutputTokens: 10 },
            }),
          }
        );
        isValid = response.ok;
        if (!isValid && response.status === 400) {
          // 400 can happen with valid key but bad request
          const data = await response.json();
          if (!data.error?.message?.includes("API key")) {
            isValid = true;
          }
        }
      } else if (provider === "claude") {
        const response = await fetch("https://api.anthropic.com/v1/messages", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-api-key": key,
            "anthropic-version": "2023-06-01",
            "anthropic-dangerous-direct-browser-access": "true",
          },
          body: JSON.stringify({
            model: "claude-sonnet-4-20250514",
            max_tokens: 10,
            messages: [{ role: "user", content: "Hi" }],
          }),
        });
        isValid = response.ok || response.status === 400;
        if (response.status === 401) {
          setError("Invalid API key. Please check and try again.");
          setIsValidating(false);
          return;
        }
      } else if (provider === "openai") {
        const response = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${key}`,
          },
          body: JSON.stringify({
            model: "gpt-4o",
            max_tokens: 10,
            messages: [{ role: "user", content: "Hi" }],
          }),
        });
        isValid = response.ok || response.status === 400;
        if (response.status === 401) {
          setError("Invalid API key. Please check and try again.");
          setIsValidating(false);
          return;
        }
      }

      // Save key and set provider
      setApiKey(key, provider);
      setProvider(provider);
      setIsAuthed(true);
      setShowKeyInput(false);
      setApiKeyInput("");
    } catch (err) {
      // Network error - save anyway (user can retry later)
      setApiKey(key, provider);
      setProvider(provider);
      setIsAuthed(true);
    } finally {
      setIsValidating(false);
    }
  };

  // Handle provider selection
  const handleSelectProvider = (provider: AIProvider) => {
    setSelectedProvider(provider);
    setError(null);

    // Check if already have key for this provider
    if (hasApiKey(provider)) {
      setProvider(provider);
      setIsAuthed(true);
      return;
    }

    // Show key input
    const providerInfo = PROVIDERS.find((p) => p.id === provider);
    if (providerInfo?.keyUrl) {
      try {
        const link = document.createElement("a");
        link.href = providerInfo.keyUrl;
        link.target = "_blank";
        link.rel = "noopener noreferrer";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } catch {
        window.open(providerInfo.keyUrl, "_blank");
      }
    }
    setShowKeyInput(true);
  };

  // Handle paste
  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text.trim()) {
        setApiKeyInput(text.trim());
      }
    } catch {
      // User will type manually
    }
  };

  // Handle submit
  const handleSubmit = () => {
    if (!apiKey.trim()) {
      setError("Please enter your API key");
      return;
    }
    validateAndSaveKey(apiKey.trim(), selectedProvider);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-slate-900 to-slate-800">
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-indigo-600 flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-primary-500/30">
            <Sparkles className="w-8 h-8 text-white animate-pulse" />
          </div>
          <div className="w-12 h-12 rounded-full border-4 border-primary-200/30 border-t-primary-400 animate-spin mx-auto mb-4" />
          <p className="text-white/80 text-lg font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  // Authenticated - render children
  if (isAuthed) {
    return <>{children}</>;
  }

  const selectedProviderInfo = PROVIDERS.find((p) => p.id === selectedProvider);

  // Not authenticated - show provider selection gate
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-900 p-6">
      <AnimatePresence mode="wait">
        <motion.div
          key={showKeyInput ? "key-input" : "welcome"}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="max-w-xl w-full"
        >
          <Card className="bg-white/10 backdrop-blur-xl border-white/20 shadow-2xl">
            <CardContent className="p-8">
              {/* Header */}
              <div className="text-center mb-8">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary-500 to-indigo-600 flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-primary-500/30">
                  <Sparkles className="w-10 h-10 text-white" />
                </div>
                <h1 className="text-3xl font-bold text-white mb-2">
                  Represent Yourself
                </h1>
                <p className="text-white/60">AI-Powered Legal Assistant</p>
              </div>

              {error && (
                <div className="mb-6 p-4 bg-red-500/20 border border-red-500/30 rounded-lg text-red-200 text-sm flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              {showKeyInput ? (
                <>
                  {/* Key input UI */}
                  <div className="space-y-4 mb-6">
                    <div className="flex items-center gap-2 text-white/80 text-sm">
                      <CheckCircle className="w-4 h-4 text-green-400" />
                      <span>{selectedProviderInfo?.name} console opened in browser</span>
                    </div>

                    <div className="bg-white/5 rounded-lg p-4 space-y-2 text-sm text-white/70">
                      <p className="font-medium text-white">Quick steps:</p>
                      <ol className="list-decimal list-inside space-y-1">
                        <li>Sign in to {selectedProviderInfo?.company} (create free account if needed)</li>
                        <li>Click <span className="text-primary-300">"Create Key"</span> or similar</li>
                        <li>Copy the key</li>
                        <li>Paste it below</li>
                      </ol>
                    </div>

                    <div className="relative">
                      <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                      <input
                        type="password"
                        value={apiKey}
                        onChange={(e) => setApiKeyInput(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                        placeholder={selectedProviderInfo?.keyPlaceholder || "API key..."}
                        className="w-full pl-10 pr-12 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent font-mono text-sm"
                        autoFocus
                      />
                      <button
                        onClick={handlePaste}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60 hover:text-white"
                        title="Paste from clipboard"
                      >
                        <Clipboard className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Button
                      variant="secondary"
                      className="flex-1"
                      onClick={() => {
                        setShowKeyInput(false);
                        setApiKeyInput("");
                        setError(null);
                      }}
                    >
                      Back
                    </Button>
                    <Button
                      className="flex-1 gap-2 bg-gradient-to-r from-primary-500 to-indigo-600 hover:from-primary-600 hover:to-indigo-700"
                      onClick={handleSubmit}
                      disabled={isValidating || !apiKey.trim()}
                    >
                      {isValidating ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          Connecting...
                        </>
                      ) : (
                        "Connect"
                      )}
                    </Button>
                  </div>

                  <button
                    onClick={() => handleSelectProvider(selectedProvider)}
                    className="w-full mt-4 text-sm text-white/50 hover:text-white/70 flex items-center justify-center gap-2"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Open {selectedProviderInfo?.name} console again
                  </button>
                </>
              ) : (
                <>
                  {/* Provider selection */}
                  <div className="space-y-3 mb-8">
                    <p className="text-white/60 text-sm mb-4">Choose your AI provider:</p>

                    {PROVIDERS.filter(p => p.available).map((provider) => (
                      <button
                        key={provider.id}
                        onClick={() => handleSelectProvider(provider.id)}
                        className="w-full flex items-center gap-4 p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors border border-white/10 hover:border-white/20 text-left"
                      >
                        <div className={`w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 ${
                          provider.id === "gemini" ? "bg-blue-500/20" :
                          provider.id === "claude" ? "bg-orange-500/20" :
                          "bg-green-500/20"
                        }`}>
                          {provider.id === "gemini" ? (
                            <Sparkles className={`w-6 h-6 ${provider.id === "gemini" ? "text-blue-400" : "text-white/60"}`} />
                          ) : provider.id === "claude" ? (
                            <Zap className="w-6 h-6 text-orange-400" />
                          ) : (
                            <Shield className="w-6 h-6 text-green-400" />
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-white">{provider.name}</span>
                            {provider.free && (
                              <span className="px-2 py-0.5 text-xs bg-green-500/20 text-green-300 rounded-full">
                                FREE
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-white/60 mt-0.5">{provider.description}</p>
                        </div>
                        <ChevronRight className="w-5 h-5 text-white/40" />
                      </button>
                    ))}
                  </div>

                  {/* Feature highlights */}
                  <div className="space-y-4 mb-6">
                    <div className="flex items-start gap-4 p-4 rounded-xl bg-white/5">
                      <div className="w-10 h-10 rounded-lg bg-primary-500/20 flex items-center justify-center flex-shrink-0">
                        <Shield className="w-5 h-5 text-primary-400" />
                      </div>
                      <div>
                        <h3 className="font-medium text-white">Your Keys, Your Data</h3>
                        <p className="text-sm text-white/60 mt-1">
                          API calls go directly to your provider. We never see your documents or API keys.
                        </p>
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-white/40 text-center">
                    Start with Gemini for free, upgrade anytime in settings.
                  </p>
                </>
              )}
            </CardContent>
          </Card>

          {/* Features preview */}
          {!showKeyInput && (
            <div className="mt-8 grid grid-cols-3 gap-4">
              {[
                { icon: "📄", label: "Analyze Documents" },
                { icon: "⚖️", label: "Case Strategy" },
                { icon: "📝", label: "Draft Responses" },
              ].map((item) => (
                <div
                  key={item.label}
                  className="text-center p-4 rounded-xl bg-white/5 backdrop-blur"
                >
                  <span className="text-2xl">{item.icon}</span>
                  <p className="text-xs text-white/60 mt-2">{item.label}</p>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

// Re-export ClaudeOAuthGate for backward compatibility
export { ProviderGate as ClaudeOAuthGate };
