"use client";

import { useState } from "react";
import {
  FileText,
  Sparkles,
  Loader2,
  Copy,
  Download,
  ExternalLink,
  Check,
  ChevronRight,
} from "lucide-react";
import { useStore, useSelectedCase } from "@/lib/store";

type Template = "affirmation" | "submission" | "letter" | "speech" | "skeleton";

interface TemplateConfig {
  name: string;
  description: string;
  fields: Field[];
  icon: string;
}

interface Field {
  id: string;
  label: string;
  type: "text" | "textarea" | "select" | "date";
  placeholder?: string;
  options?: string[];
  required?: boolean;
}

const TEMPLATES: Record<Template, TemplateConfig> = {
  affirmation: {
    name: "Affirmation / Affidavit",
    description: "Sworn statement of facts",
    icon: "📜",
    fields: [
      { id: "title", label: "Document Title", type: "text", placeholder: "Affirmation of [Name]", required: true },
      { id: "purpose", label: "Purpose", type: "select", options: ["In Opposition to Summary Judgment", "In Support of Application", "In Response to", "General"], required: true },
      { id: "facts", label: "Key Facts", type: "textarea", placeholder: "Enter the facts you want to include, one per line...", required: true },
      { id: "exhibits", label: "Exhibits to Reference", type: "textarea", placeholder: "List any exhibits (e.g., MDL-1: Email dated 15 Jan 2023)" },
    ],
  },
  submission: {
    name: "Written Submissions",
    description: "Legal arguments for the court",
    icon: "⚖️",
    fields: [
      { id: "title", label: "Title", type: "text", placeholder: "Written Submissions on behalf of [Party]", required: true },
      { id: "hearing", label: "Hearing Type", type: "select", options: ["Summary Judgment", "Interlocutory", "Trial", "Appeal", "Costs"], required: true },
      { id: "arguments", label: "Key Arguments", type: "textarea", placeholder: "Enter your main arguments, one per line...", required: true },
      { id: "authorities", label: "Legal Authorities", type: "textarea", placeholder: "List relevant cases and statutes..." },
      { id: "relief", label: "Relief Sought", type: "textarea", placeholder: "What orders are you asking for?", required: true },
    ],
  },
  letter: {
    name: "Letter to Court",
    description: "Formal correspondence with registry",
    icon: "✉️",
    fields: [
      { id: "subject", label: "Subject", type: "text", placeholder: "RE: HCA 1646/2023 - [Matter]", required: true },
      { id: "purpose", label: "Purpose", type: "select", options: ["Filing Notice", "Extension Request", "Hearing Arrangements", "General Correspondence"], required: true },
      { id: "content", label: "Letter Content", type: "textarea", placeholder: "What do you need to communicate?", required: true },
    ],
  },
  speech: {
    name: "Oral Submissions",
    description: "Speech for court appearance",
    icon: "🎤",
    fields: [
      { id: "duration", label: "Duration", type: "select", options: ["15 minutes", "30 minutes", "45 minutes", "60 minutes"], required: true },
      { id: "hearing", label: "Hearing Type", type: "select", options: ["Summary Judgment", "Interlocutory Application", "Trial", "Appeal"], required: true },
      { id: "keyPoints", label: "Key Points", type: "textarea", placeholder: "What are the main points you want to make?", required: true },
      { id: "exhibits", label: "Exhibits to Reference", type: "textarea", placeholder: "Which exhibits will you refer to?" },
    ],
  },
  skeleton: {
    name: "Skeleton Argument",
    description: "Structured outline of arguments",
    icon: "🦴",
    fields: [
      { id: "title", label: "Title", type: "text", placeholder: "Skeleton Argument on behalf of [Party]", required: true },
      { id: "issues", label: "Issues", type: "textarea", placeholder: "What are the key issues for determination?", required: true },
      { id: "facts", label: "Agreed Facts", type: "textarea", placeholder: "List the key undisputed facts..." },
      { id: "arguments", label: "Arguments", type: "textarea", placeholder: "Your arguments on each issue...", required: true },
    ],
  },
};

export function DocumentGenerator() {
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [generating, setGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const selectedCase = useSelectedCase();
  const llmConfig = useStore((s) => s.llmConfig);

  const handleGenerate = async () => {
    if (!selectedTemplate) return;

    setGenerating(true);

    // Simulate generation (in real app, would call LLM service)
    await new Promise((resolve) => setTimeout(resolve, 2500));

    const template = TEMPLATES[selectedTemplate];

    // Mock generated content based on template
    let content = "";

    if (selectedTemplate === "affirmation") {
      content = `HCA 1646 OF 2023

IN THE HIGH COURT OF THE
HONG KONG SPECIAL ADMINISTRATIVE REGION
COURT OF FIRST INSTANCE

BETWEEN

LIQUIDITY TECHNOLOGIES LTD                    1st Plaintiff
LIQUIDITY TECHNOLOGIES SOFTWARE LIMITED       2nd Plaintiff

and

MARK DAVID LAMB                               1st Defendant

_____________________________________________

${formData.title || "AFFIRMATION OF MARK DAVID LAMB"}
${formData.purpose || "In Opposition to Summary Judgment"}
_____________________________________________

I, MARK DAVID LAMB, of Majestique Residence 2, Dubai South, Dubai, UAE, do solemnly and sincerely affirm and say as follows:

1. I am the 1st Defendant in these proceedings. I make this Affirmation ${formData.purpose?.toLowerCase() || "in these proceedings"}.

2. Unless otherwise stated, the facts set out in this Affirmation are within my own knowledge and are true.

${formData.facts?.split('\n').map((fact, i) => `${i + 3}. ${fact}`).join('\n\n') || "3. [Facts to be inserted]"}

${formData.exhibits ? `\nEXHIBITS:\n${formData.exhibits}` : ""}

AFFIRMED at [ ]
this [ ] day of [ ] 2026

Before me,

_______________________
Notary Public / Commissioner for Oaths

_______________________
MARK DAVID LAMB`;
    } else if (selectedTemplate === "speech") {
      content = `ORAL SUBMISSIONS - ${formData.duration || "30 MINUTES"}
${selectedCase?.number || "HCA 1646/2023"}
${formData.hearing || "Summary Judgment Hearing"}

═══════════════════════════════════════════════════════════════

OPENING (2 minutes)

"May it please the Court.

I am [Name], the [Party], appearing in person / represented by [Counsel].

This hearing concerns [describe matter].

My central submission is this: [one sentence summary of position]."

═══════════════════════════════════════════════════════════════

KEY ARGUMENTS

${formData.keyPoints?.split('\n').map((point, i) => `
ARGUMENT ${i + 1}: ${point}
${'─'.repeat(50)}

[Detailed argument to be developed]

Supporting evidence: ${formData.exhibits?.split('\n')[i] || "[Reference exhibits]"}
`).join('\n') || "[Arguments to be developed]"}

═══════════════════════════════════════════════════════════════

CONCLUSION (2 minutes)

"In conclusion, Your Honour/Ladyship:

[Summary of key points]

Unless Your Honour/Ladyship has questions, those are my submissions."

═══════════════════════════════════════════════════════════════

TIMING NOTES
- Allocate time for each section
- Leave buffer for questions
- Practice delivery at speaking pace`;
    } else {
      content = `[Generated ${template.name} content would appear here based on:\n\n${JSON.stringify(formData, null, 2)}]`;
    }

    setGeneratedContent(content);
    setGenerating(false);
  };

  const copyToClipboard = async () => {
    if (generatedContent) {
      await navigator.clipboard.writeText(generatedContent);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const createGoogleDoc = async () => {
    // In real app, would call Google Docs API
    alert("Would create Google Doc with this content");
  };

  if (generatedContent) {
    return (
      <div className="h-full flex flex-col p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold">Generated Document</h2>
            <p className="text-sm text-muted-foreground">
              {TEMPLATES[selectedTemplate!].name}
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={copyToClipboard}
              className="flex items-center px-3 py-1.5 text-sm border border-border rounded-lg hover:bg-accent"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 mr-1 text-green-500" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 mr-1" />
                  Copy
                </>
              )}
            </button>
            <button
              onClick={createGoogleDoc}
              className="flex items-center px-3 py-1.5 text-sm bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
            >
              <ExternalLink className="w-4 h-4 mr-1" />
              Create Google Doc
            </button>
            <button
              onClick={() => {
                setGeneratedContent(null);
                setFormData({});
                setSelectedTemplate(null);
              }}
              className="px-3 py-1.5 text-sm border border-border rounded-lg hover:bg-accent"
            >
              New Document
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto">
          <pre className="p-6 bg-muted rounded-lg text-sm font-mono whitespace-pre-wrap">
            {generatedContent}
          </pre>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col p-6">
      <h2 className="text-xl font-semibold mb-6">Generate Document</h2>

      {!selectedTemplate ? (
        /* Template Selection */
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          {(Object.keys(TEMPLATES) as Template[]).map((key) => {
            const template = TEMPLATES[key];
            return (
              <button
                key={key}
                onClick={() => setSelectedTemplate(key)}
                className="p-6 text-left border border-border rounded-xl hover:border-primary/50 hover:bg-accent/50 transition-colors group"
              >
                <span className="text-3xl mb-3 block">{template.icon}</span>
                <h3 className="font-medium mb-1">{template.name}</h3>
                <p className="text-sm text-muted-foreground">
                  {template.description}
                </p>
                <ChevronRight className="w-4 h-4 mt-3 text-muted-foreground group-hover:text-primary" />
              </button>
            );
          })}
        </div>
      ) : (
        /* Form */
        <div className="flex-1 flex flex-col">
          <button
            onClick={() => setSelectedTemplate(null)}
            className="text-sm text-muted-foreground hover:text-foreground mb-4 self-start"
          >
            ← Back to templates
          </button>

          <div className="flex items-center mb-6">
            <span className="text-2xl mr-3">{TEMPLATES[selectedTemplate].icon}</span>
            <div>
              <h3 className="font-medium">{TEMPLATES[selectedTemplate].name}</h3>
              <p className="text-sm text-muted-foreground">
                {selectedCase ? `Case: ${selectedCase.name}` : "No case selected"}
              </p>
            </div>
          </div>

          <div className="flex-1 overflow-auto space-y-4">
            {TEMPLATES[selectedTemplate].fields.map((field) => (
              <div key={field.id}>
                <label className="block text-sm font-medium mb-1.5">
                  {field.label}
                  {field.required && <span className="text-red-500 ml-1">*</span>}
                </label>
                {field.type === "text" && (
                  <input
                    type="text"
                    value={formData[field.id] || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, [field.id]: e.target.value })
                    }
                    placeholder={field.placeholder}
                    className="w-full px-3 py-2 bg-muted rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                )}
                {field.type === "textarea" && (
                  <textarea
                    value={formData[field.id] || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, [field.id]: e.target.value })
                    }
                    placeholder={field.placeholder}
                    rows={4}
                    className="w-full px-3 py-2 bg-muted rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                  />
                )}
                {field.type === "select" && (
                  <select
                    value={formData[field.id] || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, [field.id]: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-muted rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="">Select...</option>
                    {field.options?.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            ))}
          </div>

          <div className="pt-4 border-t border-border mt-4">
            <button
              onClick={handleGenerate}
              disabled={generating}
              className="flex items-center px-6 py-3 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 disabled:opacity-50"
            >
              {generating ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 mr-2" />
                  Generate Document
                </>
              )}
            </button>
            <p className="mt-2 text-xs text-muted-foreground">
              Using {llmConfig.provider === "ollama" ? "Local Mistral" : "Claude"} for generation
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
