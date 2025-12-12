"use client";

import { useState, useCallback } from "react";
import {
  Upload,
  FileText,
  Clock,
  AlertTriangle,
  CheckCircle,
  Loader2,
  Sparkles,
  Download,
  Copy,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { useStore } from "@/lib/store";

interface AnalysisResult {
  summary: string;
  claims: Claim[];
  timeline: TimelineEvent[];
  weaknesses: Weakness[];
  arguments: Argument[];
}

interface Claim {
  id: string;
  text: string;
  date?: string;
  paragraph?: string;
  type: "factual" | "legal";
}

interface TimelineEvent {
  date: string;
  event: string;
  source: string;
}

interface Weakness {
  id: string;
  issue: string;
  severity: "high" | "medium" | "low";
  explanation: string;
}

interface Argument {
  id: string;
  claim: string;
  support: string;
  strength: "strong" | "medium" | "weak";
  counter?: string;
}

export function DocumentAnalyzer() {
  const [file, setFile] = useState<File | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [activeTab, setActiveTab] = useState<"summary" | "timeline" | "claims" | "weaknesses" | "arguments">("summary");

  const llmConfig = useStore((s) => s.llmConfig);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && (droppedFile.type === "application/pdf" || droppedFile.name.endsWith(".txt") || droppedFile.name.endsWith(".docx"))) {
      setFile(droppedFile);
    }
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  const analyzeDocument = async () => {
    if (!file) return;

    setAnalyzing(true);

    // Simulate analysis (in real app, would call LLM service)
    await new Promise((resolve) => setTimeout(resolve, 3000));

    // Mock result
    setResult({
      summary: `This document is a Statement of Claim filed by Liquidity Technologies Ltd against Mark David Lamb. The Plaintiffs allege breach of fiduciary duty and unauthorized transactions. Key issues include the timing of alleged breaches relative to injunction orders, and questions of authority.`,
      claims: [
        {
          id: "1",
          text: "D1 transferred 26.14M FLEX tokens to OTHL without authorization",
          date: "15 January 2023",
          paragraph: "¶12",
          type: "factual",
        },
        {
          id: "2",
          text: "D1 lacked authority to settle the Roger Ver arbitration",
          paragraph: "¶28",
          type: "legal",
        },
        {
          id: "3",
          text: "D1 breached the Injunction Order dated 12 October 2023",
          paragraph: "¶35",
          type: "legal",
        },
      ],
      timeline: [
        { date: "15 Jan 2023", event: "FLEX transfer to OTHL (26.14M)", source: "¶12" },
        { date: "30 May - 23 Jun 2023", event: "Hodlnaut transfers (17M FLEX)", source: "¶18" },
        { date: "12 Aug 2023", event: "Settlement Agreement signed", source: "¶28" },
        { date: "25-26 Sep 2023", event: "Fireblocks Assignment Agreement", source: "¶22" },
        { date: "12 Oct 2023", event: "INJUNCTION ORDER MADE", source: "Court file" },
        { date: "20 Oct 2023", event: "Amended Injunction Order", source: "Court file" },
      ],
      weaknesses: [
        {
          id: "1",
          issue: "Time Travel Problem",
          severity: "high",
          explanation: "Most alleged acts occurred BEFORE the injunction was made. The FLEX transfer (Jan 2023), Hodlnaut transfers (May-Jun 2023), and Fireblocks agreement (Sep 2023) all predate the 12 October 2023 injunction.",
        },
        {
          id: "2",
          issue: "OPNX Carve-Out Ignored",
          severity: "high",
          explanation: "The Amended Injunction expressly permits OPNX business operations, yet claims relate to OPNX activities.",
        },
        {
          id: "3",
          issue: "Speculation as Evidence",
          severity: "medium",
          explanation: "Key allegations use phrases like 'believed to be' rather than direct evidence. The Hodlnaut transfers lack evidence of D1's personal involvement.",
        },
      ],
      arguments: [
        {
          id: "1",
          claim: "D1 lacked authority to settle arbitration",
          support: "Board reconstitution, Seychelles judgment",
          strength: "weak",
          counter: "HKIAC Tribunal examined authority dispute and proceeded with settlement. Same argument made to Tribunal by Plaintiffs' lawyers and failed.",
        },
        {
          id: "2",
          claim: "D1 breached injunction",
          support: "Post-injunction conduct",
          strength: "weak",
          counter: "Only 3 post-injunction acts alleged: (1) call D1 wasn't on, (2) OPNX business (permitted), (3) 'believed to be' approved transfer (speculation).",
        },
      ],
    });

    setAnalyzing(false);
  };

  return (
    <div className="h-full flex flex-col p-6">
      {/* Upload Section */}
      {!result && (
        <div className="flex-1 flex flex-col items-center justify-center">
          <div
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            className={`w-full max-w-lg p-8 border-2 border-dashed rounded-xl text-center ${
              file ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
            }`}
          >
            {file ? (
              <div>
                <FileText className="w-12 h-12 mx-auto text-primary mb-4" />
                <p className="font-medium">{file.name}</p>
                <p className="text-sm text-muted-foreground">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </p>
                <button
                  onClick={() => setFile(null)}
                  className="mt-4 text-sm text-muted-foreground hover:text-foreground"
                >
                  Remove
                </button>
              </div>
            ) : (
              <div>
                <Upload className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <p className="font-medium mb-2">Drop a document here</p>
                <p className="text-sm text-muted-foreground mb-4">
                  PDF, DOCX, or TXT files supported
                </p>
                <label className="px-4 py-2 bg-primary text-primary-foreground rounded-lg cursor-pointer hover:bg-primary/90">
                  Browse Files
                  <input
                    type="file"
                    className="hidden"
                    accept=".pdf,.docx,.txt"
                    onChange={handleFileSelect}
                  />
                </label>
              </div>
            )}
          </div>

          {file && (
            <button
              onClick={analyzeDocument}
              disabled={analyzing}
              className="mt-6 flex items-center px-6 py-3 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 disabled:opacity-50"
            >
              {analyzing ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 mr-2" />
                  Analyze Document
                </>
              )}
            </button>
          )}

          <p className="mt-4 text-xs text-muted-foreground">
            Using {llmConfig.provider === "ollama" ? "Local Mistral" : "Claude"} for analysis
          </p>
        </div>
      )}

      {/* Results Section */}
      {result && (
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-semibold">Analysis Results</h2>
              <p className="text-sm text-muted-foreground">{file?.name}</p>
            </div>
            <div className="flex items-center space-x-2">
              <button className="flex items-center px-3 py-1.5 text-sm border border-border rounded-lg hover:bg-accent">
                <Copy className="w-4 h-4 mr-1" />
                Copy
              </button>
              <button className="flex items-center px-3 py-1.5 text-sm border border-border rounded-lg hover:bg-accent">
                <Download className="w-4 h-4 mr-1" />
                Export
              </button>
              <button
                onClick={() => {
                  setFile(null);
                  setResult(null);
                }}
                className="px-3 py-1.5 text-sm bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
              >
                New Analysis
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-border mb-6">
            {(["summary", "timeline", "claims", "weaknesses", "arguments"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px ${
                  activeTab === tab
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
                {tab === "weaknesses" && result.weaknesses.length > 0 && (
                  <span className="ml-1 px-1.5 py-0.5 text-xs bg-destructive text-destructive-foreground rounded-full">
                    {result.weaknesses.length}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="flex-1 overflow-auto">
            {activeTab === "summary" && (
              <div className="prose prose-sm dark:prose-invert max-w-none">
                <p>{result.summary}</p>
              </div>
            )}

            {activeTab === "timeline" && (
              <div className="relative pl-6">
                <div className="absolute left-2 top-0 bottom-0 w-px bg-border" />
                {result.timeline.map((event, i) => (
                  <div key={i} className="relative mb-4">
                    <div className="absolute -left-4 w-3 h-3 rounded-full bg-primary border-2 border-background" />
                    <div className="p-3 bg-muted rounded-lg">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium">{event.date}</span>
                        <span className="text-xs text-muted-foreground">{event.source}</span>
                      </div>
                      <p className="text-sm">{event.event}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === "claims" && (
              <div className="space-y-3">
                {result.claims.map((claim) => (
                  <div key={claim.id} className="p-4 border border-border rounded-lg">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-medium">{claim.text}</p>
                        <div className="flex items-center mt-2 text-xs text-muted-foreground space-x-3">
                          {claim.date && (
                            <span className="flex items-center">
                              <Clock className="w-3 h-3 mr-1" />
                              {claim.date}
                            </span>
                          )}
                          {claim.paragraph && <span>{claim.paragraph}</span>}
                        </div>
                      </div>
                      <span
                        className={`px-2 py-0.5 text-xs rounded ${
                          claim.type === "factual"
                            ? "bg-blue-500/10 text-blue-500"
                            : "bg-purple-500/10 text-purple-500"
                        }`}
                      >
                        {claim.type}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === "weaknesses" && (
              <div className="space-y-3">
                {result.weaknesses.map((weakness) => (
                  <WeaknessCard key={weakness.id} weakness={weakness} />
                ))}
              </div>
            )}

            {activeTab === "arguments" && (
              <div className="space-y-3">
                {result.arguments.map((arg) => (
                  <ArgumentCard key={arg.id} argument={arg} />
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function WeaknessCard({ weakness }: { weakness: Weakness }) {
  const [expanded, setExpanded] = useState(false);

  const severityColors = {
    high: "border-red-500 bg-red-500/5",
    medium: "border-yellow-500 bg-yellow-500/5",
    low: "border-blue-500 bg-blue-500/5",
  };

  const severityIcons = {
    high: <AlertTriangle className="w-4 h-4 text-red-500" />,
    medium: <AlertTriangle className="w-4 h-4 text-yellow-500" />,
    low: <CheckCircle className="w-4 h-4 text-blue-500" />,
  };

  return (
    <div className={`p-4 border-l-4 rounded-lg ${severityColors[weakness.severity]}`}>
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between"
      >
        <div className="flex items-center">
          {severityIcons[weakness.severity]}
          <span className="ml-2 font-medium">{weakness.issue}</span>
          <span className="ml-2 px-2 py-0.5 text-xs rounded bg-background">
            {weakness.severity}
          </span>
        </div>
        {expanded ? (
          <ChevronUp className="w-4 h-4" />
        ) : (
          <ChevronDown className="w-4 h-4" />
        )}
      </button>
      {expanded && (
        <p className="mt-3 text-sm text-muted-foreground">{weakness.explanation}</p>
      )}
    </div>
  );
}

function ArgumentCard({ argument }: { argument: Argument }) {
  const [expanded, setExpanded] = useState(false);

  const strengthColors = {
    strong: "text-green-500",
    medium: "text-yellow-500",
    weak: "text-red-500",
  };

  return (
    <div className="p-4 border border-border rounded-lg">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between"
      >
        <div className="flex-1 text-left">
          <p className="font-medium">{argument.claim}</p>
          <p className="text-sm text-muted-foreground mt-1">
            Support: {argument.support}
          </p>
        </div>
        <div className="flex items-center ml-4">
          <span className={`text-sm font-medium ${strengthColors[argument.strength]}`}>
            {argument.strength}
          </span>
          {expanded ? (
            <ChevronUp className="w-4 h-4 ml-2" />
          ) : (
            <ChevronDown className="w-4 h-4 ml-2" />
          )}
        </div>
      </button>
      {expanded && argument.counter && (
        <div className="mt-3 p-3 bg-muted rounded-lg">
          <p className="text-xs font-medium text-muted-foreground mb-1">
            COUNTER-ARGUMENT
          </p>
          <p className="text-sm">{argument.counter}</p>
        </div>
      )}
    </div>
  );
}
