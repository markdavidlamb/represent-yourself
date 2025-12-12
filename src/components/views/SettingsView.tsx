"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Check, Eye, EyeOff, Sparkles, AlertCircle } from "lucide-react";
import { Card, CardContent } from "../ui/Card";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { Badge } from "../ui/Badge";
import { cn } from "@/lib/utils";
import {
  PROVIDERS,
  getProvider,
  setProvider,
  getApiKey,
  setApiKey,
  hasApiKey,
  clearApiKey,
  type AIProvider,
} from "@/lib/ai-service";

export const SettingsView: React.FC = () => {
  const [selectedProvider, setSelectedProvider] = React.useState<AIProvider>(getProvider());
  const [apiKeys, setApiKeys] = React.useState<Record<AIProvider, string>>({
    claude: "",
    openai: "",
    mistral: "",
  });
  const [showKeys, setShowKeys] = React.useState<Record<AIProvider, boolean>>({
    claude: false,
    openai: false,
    mistral: false,
  });
  const [savedStatus, setSavedStatus] = React.useState<string | null>(null);

  // Load saved keys on mount
  React.useEffect(() => {
    setApiKeys({
      claude: getApiKey("claude") || "",
      openai: getApiKey("openai") || "",
      mistral: getApiKey("mistral") || "",
    });
    setSelectedProvider(getProvider());
  }, []);

  const handleProviderChange = (provider: AIProvider) => {
    const providerInfo = PROVIDERS.find((p) => p.id === provider);
    if (!providerInfo?.available) return;

    setSelectedProvider(provider);
    setProvider(provider);
    setSavedStatus("Provider updated!");
    setTimeout(() => setSavedStatus(null), 2000);
  };

  const handleSaveKey = (provider: AIProvider) => {
    const key = apiKeys[provider];
    if (key.trim()) {
      setApiKey(key.trim(), provider);
      setSavedStatus(`${PROVIDERS.find((p) => p.id === provider)?.name} API key saved!`);
    } else {
      clearApiKey(provider);
      setSavedStatus("API key removed");
    }
    setTimeout(() => setSavedStatus(null), 2000);
  };

  const toggleShowKey = (provider: AIProvider) => {
    setShowKeys((prev) => ({ ...prev, [provider]: !prev[provider] }));
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-semibold text-neutral-900 mb-6">Settings</h1>

      {savedStatus && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center gap-2 text-emerald-700"
        >
          <Check className="w-4 h-4" />
          {savedStatus}
        </motion.div>
      )}

      <div className="space-y-6">
        {/* AI Provider Selection */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-5 h-5 text-primary-600" />
              <h2 className="font-semibold text-neutral-900">AI Provider</h2>
            </div>
            <p className="text-sm text-neutral-500 mb-4">
              Choose which AI model powers your legal assistant. You'll need to provide your own API key.
            </p>

            <div className="space-y-3">
              {PROVIDERS.map((provider) => (
                <button
                  key={provider.id}
                  onClick={() => handleProviderChange(provider.id)}
                  disabled={!provider.available}
                  className={cn(
                    "w-full flex items-center gap-4 p-4 rounded-xl border-2 text-left transition-all",
                    selectedProvider === provider.id
                      ? "border-primary-500 bg-primary-50"
                      : provider.available
                      ? "border-neutral-200 hover:border-neutral-300"
                      : "border-neutral-100 bg-neutral-50 cursor-not-allowed opacity-60"
                  )}
                >
                  <div
                    className={cn(
                      "w-10 h-10 rounded-lg flex items-center justify-center",
                      selectedProvider === provider.id
                        ? "bg-primary-600 text-white"
                        : "bg-neutral-100 text-neutral-600"
                    )}
                  >
                    {provider.id === "claude" && "C"}
                    {provider.id === "openai" && "O"}
                    {provider.id === "mistral" && "M"}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-neutral-900">{provider.name}</span>
                      <span className="text-sm text-neutral-400">by {provider.company}</span>
                      {!provider.available && (
                        <Badge variant="default" size="sm">
                          Coming Soon
                        </Badge>
                      )}
                      {selectedProvider === provider.id && provider.available && (
                        <Badge variant="success" size="sm">
                          Active
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-neutral-500 mt-0.5">{provider.description}</p>
                  </div>
                  {selectedProvider === provider.id && provider.available && (
                    <Check className="w-5 h-5 text-primary-600" />
                  )}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* API Keys */}
        <Card>
          <CardContent className="pt-6">
            <h2 className="font-semibold text-neutral-900 mb-4">API Keys</h2>
            <p className="text-sm text-neutral-500 mb-4">
              Your API keys are stored locally on your device and never sent to our servers.
            </p>

            <div className="space-y-4">
              {PROVIDERS.filter((p) => p.available).map((provider) => (
                <div key={provider.id}>
                  <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                    {provider.name} API Key
                  </label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <input
                        type={showKeys[provider.id] ? "text" : "password"}
                        value={apiKeys[provider.id]}
                        onChange={(e) =>
                          setApiKeys((prev) => ({ ...prev, [provider.id]: e.target.value }))
                        }
                        placeholder={provider.keyPlaceholder}
                        className="w-full px-3 py-2 pr-10 rounded-lg border border-neutral-200 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      />
                      <button
                        type="button"
                        onClick={() => toggleShowKey(provider.id)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                      >
                        {showKeys[provider.id] ? (
                          <EyeOff className="w-5 h-5" />
                        ) : (
                          <Eye className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                    <Button variant="secondary" onClick={() => handleSaveKey(provider.id)}>
                      Save
                    </Button>
                  </div>
                  {provider.id === "claude" && (
                    <p className="text-xs text-neutral-400 mt-1">
                      Get your key at{" "}
                      <a
                        href="https://console.anthropic.com/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary-600 hover:underline"
                      >
                        console.anthropic.com
                      </a>
                    </p>
                  )}
                  {provider.id === "openai" && (
                    <p className="text-xs text-neutral-400 mt-1">
                      Get your key at{" "}
                      <a
                        href="https://platform.openai.com/api-keys"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary-600 hover:underline"
                      >
                        platform.openai.com
                      </a>
                    </p>
                  )}
                </div>
              ))}
            </div>

            {!hasApiKey() && (
              <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-amber-800">No API key configured</p>
                  <p className="text-sm text-amber-700">
                    Add an API key above to enable AI-powered document generation.
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Case Information */}
        <Card>
          <CardContent className="pt-6">
            <h2 className="font-semibold text-neutral-900 mb-4">Default Case Information</h2>
            <p className="text-sm text-neutral-500 mb-4">
              These defaults will be pre-filled when creating new documents.
            </p>

            <div className="space-y-4">
              <Input
                label="Case Number"
                placeholder="e.g., HCA 1646/2023"
              />
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                  Court
                </label>
                <select className="w-full px-3 py-2 rounded-lg border border-neutral-200 focus:ring-2 focus:ring-primary-500">
                  <option>High Court of Hong Kong</option>
                  <option>District Court of Hong Kong</option>
                  <option>Court of Appeal</option>
                  <option>Family Court</option>
                  <option>Labour Tribunal</option>
                  <option>Small Claims Tribunal</option>
                  <option>Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                  Your Role
                </label>
                <select className="w-full px-3 py-2 rounded-lg border border-neutral-200 focus:ring-2 focus:ring-primary-500">
                  <option>Plaintiff</option>
                  <option>Defendant</option>
                  <option>Applicant</option>
                  <option>Respondent</option>
                  <option>Petitioner</option>
                  <option>Claimant</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Profile */}
        <Card>
          <CardContent className="pt-6">
            <h2 className="font-semibold text-neutral-900 mb-4">Profile</h2>

            <div className="space-y-4">
              <Input
                label="Display Name"
                placeholder="Your name"
              />
              <Input
                label="Email"
                type="email"
                placeholder="you@example.com"
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
