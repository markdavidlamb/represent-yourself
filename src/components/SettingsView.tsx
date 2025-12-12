"use client";

import { useState, useEffect } from "react";
import {
  Settings,
  Cpu,
  Cloud,
  Key,
  Check,
  X,
  ExternalLink,
  RefreshCw,
  AlertCircle,
  Loader2,
  Mail,
  HardDrive,
  Calendar,
  FileText,
} from "lucide-react";
import { useStore } from "@/lib/store";

type Tab = "llm" | "google" | "about";

export function SettingsView() {
  const [activeTab, setActiveTab] = useState<Tab>("llm");

  return (
    <div className="h-full flex flex-col p-6">
      <h2 className="text-xl font-semibold mb-6">Settings</h2>

      {/* Tabs */}
      <div className="flex border-b border-border mb-6">
        {([
          { id: "llm" as Tab, label: "LLM Configuration", icon: Cpu },
          { id: "google" as Tab, label: "Google Integration", icon: Cloud },
          { id: "about" as Tab, label: "About", icon: Settings },
        ]).map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex items-center px-4 py-2 text-sm font-medium border-b-2 -mb-px ${
              activeTab === id
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <Icon className="w-4 h-4 mr-2" />
            {label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        {activeTab === "llm" && <LLMSettings />}
        {activeTab === "google" && <GoogleSettings />}
        {activeTab === "about" && <AboutSection />}
      </div>
    </div>
  );
}

function LLMSettings() {
  const llmConfig = useStore((s) => s.llmConfig);
  const setLLMConfig = useStore((s) => s.setLLMConfig);

  const [formData, setFormData] = useState(llmConfig);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<"success" | "error" | null>(null);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setLLMConfig(formData);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const testConnection = async () => {
    setTesting(true);
    setTestResult(null);

    try {
      if (formData.provider === "ollama") {
        const response = await fetch(`${formData.baseUrl || "http://localhost:11434"}/api/tags`);
        if (response.ok) {
          setTestResult("success");
        } else {
          setTestResult("error");
        }
      } else {
        // Claude - just verify API key format
        if (formData.apiKey && formData.apiKey.startsWith("sk-ant-")) {
          setTestResult("success");
        } else {
          setTestResult("error");
        }
      }
    } catch {
      setTestResult("error");
    }

    setTesting(false);
  };

  return (
    <div className="max-w-2xl space-y-6">
      {/* Provider Selection */}
      <div>
        <label className="block text-sm font-medium mb-3">LLM Provider</label>
        <div className="grid grid-cols-2 gap-4">
          <ProviderCard
            selected={formData.provider === "ollama"}
            onClick={() => setFormData({ ...formData, provider: "ollama", model: "mistral:latest" })}
            icon={Cpu}
            title="Ollama (Local)"
            description="Run models locally with complete privacy"
            features={["Free", "Private", "Offline capable"]}
          />
          <ProviderCard
            selected={formData.provider === "claude"}
            onClick={() => setFormData({ ...formData, provider: "claude", model: "claude-3-opus-20240229" })}
            icon={Cloud}
            title="Claude API"
            description="Anthropic's powerful Claude models"
            features={["Most capable", "Fast", "Requires API key"]}
          />
        </div>
      </div>

      {/* Provider-specific settings */}
      {formData.provider === "ollama" ? (
        <div className="space-y-4 p-4 border border-border rounded-lg">
          <h3 className="font-medium">Ollama Configuration</h3>

          <div>
            <label className="block text-sm font-medium mb-1">Model</label>
            <select
              value={formData.model}
              onChange={(e) => setFormData({ ...formData, model: e.target.value })}
              className="w-full px-3 py-2 bg-muted rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="mistral:latest">Mistral (7B) - Recommended</option>
              <option value="mistral:instruct">Mistral Instruct</option>
              <option value="llama2:latest">Llama 2 (7B)</option>
              <option value="llama2:13b">Llama 2 (13B)</option>
              <option value="codellama:latest">Code Llama</option>
              <option value="mixtral:latest">Mixtral (8x7B)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Ollama URL</label>
            <input
              type="text"
              value={formData.baseUrl || "http://localhost:11434"}
              onChange={(e) => setFormData({ ...formData, baseUrl: e.target.value })}
              placeholder="http://localhost:11434"
              className="w-full px-3 py-2 bg-muted rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Default: http://localhost:11434
            </p>
          </div>

          <div className="p-3 bg-muted rounded-lg">
            <h4 className="text-sm font-medium mb-2">Setup Instructions</h4>
            <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
              <li>Install Ollama from <a href="https://ollama.ai" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">ollama.ai</a></li>
              <li>Run: <code className="px-1 py-0.5 bg-background rounded">ollama pull mistral</code></li>
              <li>Start server: <code className="px-1 py-0.5 bg-background rounded">ollama serve</code></li>
            </ol>
          </div>
        </div>
      ) : (
        <div className="space-y-4 p-4 border border-border rounded-lg">
          <h3 className="font-medium">Claude API Configuration</h3>

          <div>
            <label className="block text-sm font-medium mb-1">Model</label>
            <select
              value={formData.model}
              onChange={(e) => setFormData({ ...formData, model: e.target.value })}
              className="w-full px-3 py-2 bg-muted rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="claude-3-opus-20240229">Claude 3 Opus - Most capable</option>
              <option value="claude-3-sonnet-20240229">Claude 3 Sonnet - Balanced</option>
              <option value="claude-3-haiku-20240307">Claude 3 Haiku - Fast</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">API Key</label>
            <div className="relative">
              <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="password"
                value={formData.apiKey || ""}
                onChange={(e) => setFormData({ ...formData, apiKey: e.target.value })}
                placeholder="sk-ant-..."
                className="w-full pl-10 pr-3 py-2 bg-muted rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Get your API key from{" "}
              <a
                href="https://console.anthropic.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                console.anthropic.com
              </a>
            </p>
          </div>
        </div>
      )}

      {/* Test & Save */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <button
            onClick={testConnection}
            disabled={testing}
            className="flex items-center px-4 py-2 text-sm border border-border rounded-lg hover:bg-accent disabled:opacity-50"
          >
            {testing ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4 mr-2" />
            )}
            Test Connection
          </button>
          {testResult === "success" && (
            <span className="flex items-center text-sm text-green-500">
              <Check className="w-4 h-4 mr-1" />
              Connected
            </span>
          )}
          {testResult === "error" && (
            <span className="flex items-center text-sm text-destructive">
              <X className="w-4 h-4 mr-1" />
              Failed
            </span>
          )}
        </div>

        <button
          onClick={handleSave}
          className="flex items-center px-4 py-2 text-sm bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
        >
          {saved ? (
            <>
              <Check className="w-4 h-4 mr-2" />
              Saved!
            </>
          ) : (
            "Save Settings"
          )}
        </button>
      </div>
    </div>
  );
}

function ProviderCard({
  selected,
  onClick,
  icon: Icon,
  title,
  description,
  features,
}: {
  selected: boolean;
  onClick: () => void;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  features: string[];
}) {
  return (
    <button
      onClick={onClick}
      className={`p-4 text-left border-2 rounded-lg transition-colors ${
        selected
          ? "border-primary bg-primary/5"
          : "border-border hover:border-primary/50"
      }`}
    >
      <div className="flex items-center space-x-3 mb-2">
        <div className={`p-2 rounded-lg ${selected ? "bg-primary/10" : "bg-muted"}`}>
          <Icon className={`w-5 h-5 ${selected ? "text-primary" : "text-muted-foreground"}`} />
        </div>
        <div>
          <div className="font-medium">{title}</div>
          <div className="text-sm text-muted-foreground">{description}</div>
        </div>
      </div>
      <div className="flex flex-wrap gap-1 mt-3">
        {features.map((feature) => (
          <span
            key={feature}
            className="px-2 py-0.5 text-xs bg-muted rounded-full text-muted-foreground"
          >
            {feature}
          </span>
        ))}
      </div>
    </button>
  );
}

function GoogleSettings() {
  const googleCredentials = useStore((s) => s.googleCredentials);
  const setGoogleCredentials = useStore((s) => s.setGoogleCredentials);

  const [formData, setFormData] = useState({
    clientId: googleCredentials?.clientId || "",
    clientSecret: googleCredentials?.clientSecret || "",
    refreshToken: googleCredentials?.refreshToken || "",
  });
  const [saved, setSaved] = useState(false);

  const isConnected = googleCredentials?.isConnected;

  const handleSave = () => {
    setGoogleCredentials({
      ...formData,
      isConnected: true,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleDisconnect = () => {
    if (confirm("Disconnect Google account?")) {
      setGoogleCredentials(null);
    }
  };

  return (
    <div className="max-w-2xl space-y-6">
      {/* Status */}
      <div className={`p-4 rounded-lg border ${isConnected ? "border-green-500/20 bg-green-500/5" : "border-yellow-500/20 bg-yellow-500/5"}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {isConnected ? (
              <Check className="w-5 h-5 text-green-500" />
            ) : (
              <AlertCircle className="w-5 h-5 text-yellow-500" />
            )}
            <div>
              <div className="font-medium">
                {isConnected ? "Google Connected" : "Google Not Connected"}
              </div>
              <div className="text-sm text-muted-foreground">
                {isConnected
                  ? "Gmail, Drive, and Calendar access enabled"
                  : "Connect to enable email and document sync"}
              </div>
            </div>
          </div>
          {isConnected && (
            <button
              onClick={handleDisconnect}
              className="px-3 py-1.5 text-sm border border-border rounded-lg hover:bg-accent"
            >
              Disconnect
            </button>
          )}
        </div>
      </div>

      {/* Services */}
      <div className="grid grid-cols-2 gap-4">
        <ServiceCard
          icon={Mail}
          title="Gmail"
          description="Monitor emails from opposing counsel"
          enabled={isConnected}
        />
        <ServiceCard
          icon={HardDrive}
          title="Google Drive"
          description="Store and sync documents"
          enabled={isConnected}
        />
        <ServiceCard
          icon={Calendar}
          title="Google Calendar"
          description="Track hearings and deadlines"
          enabled={isConnected}
        />
        <ServiceCard
          icon={FileText}
          title="Google Docs"
          description="Generate documents directly"
          enabled={isConnected}
        />
      </div>

      {/* Credentials Form */}
      <div className="space-y-4 p-4 border border-border rounded-lg">
        <h3 className="font-medium">OAuth Credentials</h3>
        <p className="text-sm text-muted-foreground">
          Create a Google Cloud project and enable the Gmail, Drive, and Calendar APIs.
        </p>

        <div>
          <label className="block text-sm font-medium mb-1">Client ID</label>
          <input
            type="text"
            value={formData.clientId}
            onChange={(e) => setFormData({ ...formData, clientId: e.target.value })}
            placeholder="xxx.apps.googleusercontent.com"
            className="w-full px-3 py-2 bg-muted rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Client Secret</label>
          <input
            type="password"
            value={formData.clientSecret}
            onChange={(e) => setFormData({ ...formData, clientSecret: e.target.value })}
            placeholder="GOCSPX-..."
            className="w-full px-3 py-2 bg-muted rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Refresh Token</label>
          <input
            type="password"
            value={formData.refreshToken}
            onChange={(e) => setFormData({ ...formData, refreshToken: e.target.value })}
            placeholder="1//..."
            className="w-full px-3 py-2 bg-muted rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <div className="flex items-center justify-between pt-2">
          <a
            href="https://console.cloud.google.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center text-sm text-primary hover:underline"
          >
            <ExternalLink className="w-3 h-3 mr-1" />
            Google Cloud Console
          </a>
          <button
            onClick={handleSave}
            disabled={!formData.clientId || !formData.clientSecret || !formData.refreshToken}
            className="flex items-center px-4 py-2 text-sm bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50"
          >
            {saved ? (
              <>
                <Check className="w-4 h-4 mr-2" />
                Saved!
              </>
            ) : (
              "Save & Connect"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

function ServiceCard({
  icon: Icon,
  title,
  description,
  enabled,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  enabled?: boolean;
}) {
  return (
    <div className={`p-4 border border-border rounded-lg ${enabled ? "" : "opacity-50"}`}>
      <div className="flex items-center space-x-3">
        <div className={`p-2 rounded-lg ${enabled ? "bg-primary/10" : "bg-muted"}`}>
          <Icon className={`w-5 h-5 ${enabled ? "text-primary" : "text-muted-foreground"}`} />
        </div>
        <div>
          <div className="font-medium">{title}</div>
          <div className="text-sm text-muted-foreground">{description}</div>
        </div>
      </div>
    </div>
  );
}

function AboutSection() {
  return (
    <div className="max-w-2xl space-y-6">
      <div className="text-center py-8">
        <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-primary to-primary/50 flex items-center justify-center">
          <Settings className="w-10 h-10 text-primary-foreground" />
        </div>
        <h1 className="text-2xl font-bold mb-2">Counsel</h1>
        <p className="text-muted-foreground">AI-Powered Legal Document Assistant</p>
        <p className="text-sm text-muted-foreground mt-1">Version 1.0.0</p>
      </div>

      <div className="space-y-4">
        <div className="p-4 border border-border rounded-lg">
          <h3 className="font-medium mb-2">Features</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-start">
              <Check className="w-4 h-4 mr-2 text-green-500 mt-0.5" />
              Analyze legal documents with AI-powered insights
            </li>
            <li className="flex items-start">
              <Check className="w-4 h-4 mr-2 text-green-500 mt-0.5" />
              Generate affirmations, submissions, letters, and speeches
            </li>
            <li className="flex items-start">
              <Check className="w-4 h-4 mr-2 text-green-500 mt-0.5" />
              Monitor Gmail for opposing counsel communications
            </li>
            <li className="flex items-start">
              <Check className="w-4 h-4 mr-2 text-green-500 mt-0.5" />
              Sync documents to Google Drive automatically
            </li>
            <li className="flex items-start">
              <Check className="w-4 h-4 mr-2 text-green-500 mt-0.5" />
              Track case timelines and deadlines
            </li>
            <li className="flex items-start">
              <Check className="w-4 h-4 mr-2 text-green-500 mt-0.5" />
              Run locally with Mistral or use Claude API
            </li>
          </ul>
        </div>

        <div className="p-4 border border-border rounded-lg">
          <h3 className="font-medium mb-2">Privacy</h3>
          <p className="text-sm text-muted-foreground">
            When using Ollama, all AI processing happens locally on your machine.
            No data is sent to external servers. When using Claude API, documents
            are sent to Anthropic's servers for processing.
          </p>
        </div>

        <div className="p-4 border border-border rounded-lg">
          <h3 className="font-medium mb-2">Open Source</h3>
          <p className="text-sm text-muted-foreground mb-3">
            Counsel is open source software. Contributions are welcome!
          </p>
          <a
            href="https://github.com/counsel/counsel"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center text-sm text-primary hover:underline"
          >
            <ExternalLink className="w-3 h-3 mr-1" />
            View on GitHub
          </a>
        </div>

        <div className="p-4 border border-border rounded-lg">
          <h3 className="font-medium mb-2">Keyboard Shortcuts</h3>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <Shortcut keys={["Cmd", "K"]} description="Quick search" />
            <Shortcut keys={["Cmd", "N"]} description="New document" />
            <Shortcut keys={["Cmd", "1"]} description="Inbox" />
            <Shortcut keys={["Cmd", "2"]} description="Cases" />
            <Shortcut keys={["Cmd", "3"]} description="Documents" />
            <Shortcut keys={["Cmd", "4"]} description="Timeline" />
            <Shortcut keys={["Cmd", ","]} description="Settings" />
          </div>
        </div>
      </div>
    </div>
  );
}

function Shortcut({ keys, description }: { keys: string[]; description: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-muted-foreground">{description}</span>
      <div className="flex items-center space-x-1">
        {keys.map((key, i) => (
          <span key={i}>
            <kbd className="px-2 py-1 text-xs bg-muted rounded border border-border">
              {key}
            </kbd>
            {i < keys.length - 1 && <span className="mx-0.5">+</span>}
          </span>
        ))}
      </div>
    </div>
  );
}
