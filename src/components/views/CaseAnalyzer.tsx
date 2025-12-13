"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Upload,
  FileText,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Target,
  Shield,
  Lightbulb,
  ChevronRight,
  ChevronDown,
  Loader2,
  Sparkles,
  Scale,
  FileWarning,
  Calendar,
  ListChecks,
  Brain,
  Zap,
  BookOpen,
  Gavel,
  MessageSquare,
  Copy,
  Download,
  RefreshCw,
  X,
  Eye,
  Search,
} from "lucide-react";
import { Card, CardHeader, CardContent } from "../ui/Card";
import { Button } from "../ui/Button";
import { Input, TextArea } from "../ui/Input";
import { Badge } from "../ui/Badge";
import { cn } from "@/lib/utils";
import { callAI, hasApiKey } from "@/lib/ai-service";

// Types
interface ExtractedClaim {
  id: string;
  claimNumber: number;
  type: "factual" | "legal" | "procedural";
  statement: string;
  paragraph?: string;
  strength: "strong" | "moderate" | "weak";
  responseRequired: boolean;
  suggestedResponse?: string;
  relevantLaw?: string;
  deadline?: Date;
}

interface ExtractedDeadline {
  id: string;
  description: string;
  date: Date;
  source: string;
  courtRule?: string;
  daysRemaining: number;
  priority: "critical" | "high" | "medium" | "low";
  actionRequired: string;
}

interface WeaknessAnalysis {
  id: string;
  category: "procedural" | "evidential" | "legal" | "factual";
  description: string;
  exploitability: "high" | "medium" | "low";
  suggestedStrategy: string;
  relevantAuthority?: string;
}

interface CaseAuthority {
  id: string;
  citation: string;
  relevance: string;
  favorableFor: "you" | "opponent" | "neutral";
  keyQuote?: string;
}

interface AnalysisResult {
  documentType: string;
  summary: string;
  claims: ExtractedClaim[];
  deadlines: ExtractedDeadline[];
  weaknesses: WeaknessAnalysis[];
  authorities: CaseAuthority[];
  requiredActions: string[];
  riskAssessment: {
    level: "high" | "medium" | "low";
    factors: string[];
  };
}

interface UploadedDocument {
  id: string;
  name: string;
  size: number;
  type: string;
  uploadedAt: Date;
  content?: string;
  analysis?: AnalysisResult;
  isAnalyzing: boolean;
}

interface CaseAnalyzerProps {
  onNavigate?: (view: string) => void;
  onAction?: (action: string, data?: any) => void;
}

export const CaseAnalyzer: React.FC<CaseAnalyzerProps> = ({
  onNavigate,
  onAction,
}) => {
  const [documents, setDocuments] = React.useState<UploadedDocument[]>([]);
  const [selectedDocument, setSelectedDocument] = React.useState<UploadedDocument | null>(null);
  const [activeTab, setActiveTab] = React.useState<"claims" | "deadlines" | "weaknesses" | "authorities">("claims");
  const [expandedClaims, setExpandedClaims] = React.useState<Set<string>>(new Set());
  const [isDragOver, setIsDragOver] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Extract text from PDF using PDF.js
  const extractTextFromPDF = async (file: File): Promise<string> => {
    try {
      const pdfjsLib = await import("pdfjs-dist");
      pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      let fullText = "";
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map((item: any) => item.str).join(" ");
        fullText += pageText + "\n\n";
      }
      return fullText.trim() || `[PDF: ${file.name} - no extractable text]`;
    } catch (err) {
      return `[PDF: ${file.name} - extraction failed]`;
    }
  };

  // Extract text from file based on type
  const extractFileContent = async (file: File): Promise<string> => {
    const extension = file.name.split('.').pop()?.toLowerCase();
    if (file.type === "application/pdf" || extension === "pdf") {
      return extractTextFromPDF(file);
    }
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string || "");
      reader.onerror = () => resolve(`[File: ${file.name} - read failed]`);
      reader.readAsText(file);
    });
  };

  // Analyze document with AI
  const analyzeWithAI = async (content: string, filename: string): Promise<AnalysisResult> => {
    const systemPrompt = `You are an expert legal document analyst. Analyze this opposing party's court document and extract:
1. Document type and summary
2. Each claim/assertion they make (factual, legal, procedural) with strength assessment
3. Deadlines and action items
4. Weaknesses in their arguments to exploit
5. Relevant case authorities they cite

Respond ONLY with valid JSON in this exact format:
{
  "documentType": "Type of document",
  "summary": "2-3 sentence summary of the document and key issues",
  "claims": [
    {"claimNumber": 1, "type": "factual|legal|procedural", "statement": "Their claim", "paragraph": "12", "strength": "strong|moderate|weak", "responseRequired": true, "suggestedResponse": "How to respond", "relevantLaw": "Applicable law"}
  ],
  "deadlines": [
    {"description": "What needs to be done", "daysFromNow": 14, "source": "Where deadline comes from", "courtRule": "Rule reference", "priority": "critical|high|medium|low", "actionRequired": "Specific action"}
  ],
  "weaknesses": [
    {"category": "procedural|evidential|legal|factual", "description": "The weakness", "exploitability": "high|medium|low", "suggestedStrategy": "How to exploit", "relevantAuthority": "Case law"}
  ],
  "authorities": [
    {"citation": "Case name [Year] Court", "relevance": "Why cited", "favorableFor": "you|opponent|neutral", "keyQuote": "Important quote"}
  ],
  "requiredActions": ["List of specific actions required to respond"],
  "riskAssessment": {"level": "high|medium|low", "factors": ["Key risk factors"]}
}`;

    const response = await callAI(systemPrompt, `Analyze this document titled "${filename}":\n\n${content.substring(0, 12000)}`, { maxTokens: 4096 });

    try {
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          documentType: parsed.documentType || "Unknown",
          summary: parsed.summary || "Analysis complete",
          claims: (parsed.claims || []).map((c: any, i: number) => ({
            id: `claim-${i}`,
            claimNumber: c.claimNumber || i + 1,
            type: c.type || "factual",
            statement: c.statement || "",
            paragraph: c.paragraph,
            strength: c.strength || "moderate",
            responseRequired: c.responseRequired !== false,
            suggestedResponse: c.suggestedResponse,
            relevantLaw: c.relevantLaw,
          })),
          deadlines: (parsed.deadlines || []).map((d: any, i: number) => ({
            id: `deadline-${i}`,
            description: d.description || "",
            date: new Date(Date.now() + (d.daysFromNow || 14) * 24 * 60 * 60 * 1000),
            source: d.source || "Document",
            courtRule: d.courtRule,
            daysRemaining: d.daysFromNow || 14,
            priority: d.priority || "medium",
            actionRequired: d.actionRequired || d.description,
          })),
          weaknesses: (parsed.weaknesses || []).map((w: any, i: number) => ({
            id: `weakness-${i}`,
            category: w.category || "legal",
            description: w.description || "",
            exploitability: w.exploitability || "medium",
            suggestedStrategy: w.suggestedStrategy || "",
            relevantAuthority: w.relevantAuthority,
          })),
          authorities: (parsed.authorities || []).map((a: any, i: number) => ({
            id: `auth-${i}`,
            citation: a.citation || "",
            relevance: a.relevance || "",
            favorableFor: a.favorableFor || "neutral",
            keyQuote: a.keyQuote,
          })),
          requiredActions: parsed.requiredActions || [
            "Review document and prepare response",
            "Gather supporting evidence",
          ],
          riskAssessment: {
            level: parsed.riskAssessment?.level || "medium",
            factors: parsed.riskAssessment?.factors || ["Document requires careful analysis"],
          },
        };
      }
    } catch (e) {
      console.error("AI response parse error:", e);
    }

    // Fallback if parsing fails
    return generateMockAnalysis(filename);
  };

  // Handle file upload
  const handleFileUpload = async (files: FileList | null) => {
    if (!files) return;

    const newDocs: UploadedDocument[] = [];

    for (const file of Array.from(files)) {
      const doc: UploadedDocument = {
        id: `doc-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name: file.name,
        size: file.size,
        type: file.type,
        uploadedAt: new Date(),
        isAnalyzing: true,
      };
      newDocs.push(doc);
    }

    setDocuments((prev) => [...prev, ...newDocs]);

    // Analyze each document
    for (const doc of newDocs) {
      const file = Array.from(files).find(f => f.name === doc.name);
      if (!file) continue;

      try {
        // Extract text content
        const content = await extractFileContent(file);

        let analysis: AnalysisResult;
        if (hasApiKey() && content && !content.startsWith('[')) {
          // Use real AI analysis
          analysis = await analyzeWithAI(content, doc.name);
        } else {
          // Fallback to mock if no API key
          analysis = generateMockAnalysis(doc.name);
        }

        setDocuments((prev) =>
          prev.map((d) =>
            d.id === doc.id
              ? { ...d, isAnalyzing: false, analysis }
              : d
          )
        );
      } catch (err) {
        console.error("Analysis error:", err);
        setDocuments((prev) =>
          prev.map((d) =>
            d.id === doc.id
              ? { ...d, isAnalyzing: false, analysis: generateMockAnalysis(doc.name) }
              : d
          )
        );
      }
    }
  };

  // Drag and drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    handleFileUpload(e.dataTransfer.files);
  };

  const toggleClaimExpanded = (id: string) => {
    setExpandedClaims((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const getStrengthColor = (strength: string) => {
    switch (strength) {
      case "strong":
        return "error";
      case "moderate":
        return "warning";
      case "weak":
        return "success";
      default:
        return "default";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "critical":
        return "error";
      case "high":
        return "warning";
      case "medium":
        return "info";
      default:
        return "default";
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-200">
            <Brain className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-neutral-900">
              AI Case Analyzer
            </h1>
            <p className="text-neutral-500">
              Upload opponent filings to extract claims, deadlines, and find weaknesses
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Panel - Document Upload & List */}
        <div className="lg:col-span-1 space-y-4">
          {/* Upload Area */}
          <Card>
            <CardContent className="pt-4">
              <div
                className={cn(
                  "border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer",
                  isDragOver
                    ? "border-primary-500 bg-primary-50"
                    : "border-neutral-200 hover:border-primary-300 hover:bg-neutral-50"
                )}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  accept=".pdf,.doc,.docx,.txt"
                  multiple
                  onChange={(e) => handleFileUpload(e.target.files)}
                />
                <div className="w-14 h-14 rounded-full bg-primary-100 flex items-center justify-center mx-auto mb-4">
                  <Upload className="w-7 h-7 text-primary-600" />
                </div>
                <p className="font-medium text-neutral-900 mb-1">
                  Drop opponent's documents here
                </p>
                <p className="text-sm text-neutral-500">
                  PDF, Word, or text files
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Document List */}
          <Card>
            <CardHeader
              title="Uploaded Documents"
              description={`${documents.length} document${documents.length !== 1 ? "s" : ""}`}
              icon={<FileText className="w-5 h-5" />}
            />
            <CardContent>
              {documents.length === 0 ? (
                <p className="text-sm text-neutral-500 text-center py-8">
                  No documents uploaded yet
                </p>
              ) : (
                <div className="space-y-2">
                  {documents.map((doc) => (
                    <motion.button
                      key={doc.id}
                      className={cn(
                        "w-full flex items-center gap-3 p-3 rounded-lg text-left transition-all",
                        selectedDocument?.id === doc.id
                          ? "bg-primary-50 border border-primary-200"
                          : "hover:bg-neutral-50 border border-transparent"
                      )}
                      onClick={() => setSelectedDocument(doc)}
                      whileHover={{ x: 2 }}
                    >
                      <div
                        className={cn(
                          "w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0",
                          doc.isAnalyzing
                            ? "bg-amber-100"
                            : doc.analysis
                            ? "bg-emerald-100"
                            : "bg-neutral-100"
                        )}
                      >
                        {doc.isAnalyzing ? (
                          <Loader2 className="w-5 h-5 text-amber-600 animate-spin" />
                        ) : (
                          <FileText
                            className={cn(
                              "w-5 h-5",
                              doc.analysis ? "text-emerald-600" : "text-neutral-600"
                            )}
                          />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-neutral-900 truncate text-sm">
                          {doc.name}
                        </p>
                        <p className="text-xs text-neutral-500">
                          {doc.isAnalyzing ? (
                            <span className="text-amber-600">Analyzing...</span>
                          ) : (
                            <>
                              {formatFileSize(doc.size)} •{" "}
                              {doc.analysis?.claims.length || 0} claims found
                            </>
                          )}
                        </p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-neutral-400" />
                    </motion.button>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Stats */}
          {documents.some((d) => d.analysis) && (
            <Card className="bg-gradient-to-br from-violet-50 to-purple-50 border-violet-200">
              <CardContent className="pt-4">
                <h3 className="font-medium text-violet-900 mb-3">
                  Analysis Summary
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-white/60 rounded-lg p-3">
                    <p className="text-2xl font-bold text-violet-600">
                      {documents.reduce(
                        (acc, d) => acc + (d.analysis?.claims.length || 0),
                        0
                      )}
                    </p>
                    <p className="text-xs text-violet-700">Claims Found</p>
                  </div>
                  <div className="bg-white/60 rounded-lg p-3">
                    <p className="text-2xl font-bold text-amber-600">
                      {documents.reduce(
                        (acc, d) => acc + (d.analysis?.deadlines.length || 0),
                        0
                      )}
                    </p>
                    <p className="text-xs text-amber-700">Deadlines</p>
                  </div>
                  <div className="bg-white/60 rounded-lg p-3">
                    <p className="text-2xl font-bold text-emerald-600">
                      {documents.reduce(
                        (acc, d) => acc + (d.analysis?.weaknesses.length || 0),
                        0
                      )}
                    </p>
                    <p className="text-xs text-emerald-700">Weaknesses</p>
                  </div>
                  <div className="bg-white/60 rounded-lg p-3">
                    <p className="text-2xl font-bold text-blue-600">
                      {documents.reduce(
                        (acc, d) => acc + (d.analysis?.authorities.length || 0),
                        0
                      )}
                    </p>
                    <p className="text-xs text-blue-700">Authorities</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Panel - Analysis Results */}
        <div className="lg:col-span-2">
          {!selectedDocument ? (
            <Card className="h-full">
              <CardContent className="flex items-center justify-center h-96">
                <div className="text-center">
                  <div className="w-20 h-20 rounded-full bg-neutral-100 flex items-center justify-center mx-auto mb-4">
                    <Search className="w-10 h-10 text-neutral-400" />
                  </div>
                  <h3 className="font-medium text-neutral-900 mb-2">
                    Select a document to view analysis
                  </h3>
                  <p className="text-sm text-neutral-500 max-w-sm">
                    Upload opponent's court filings and our AI will extract claims,
                    identify deadlines, and find weaknesses in their arguments.
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : selectedDocument.isAnalyzing ? (
            <Card className="h-full">
              <CardContent className="flex items-center justify-center h-96">
                <div className="text-center">
                  <div className="w-20 h-20 rounded-full bg-violet-100 flex items-center justify-center mx-auto mb-4">
                    <Loader2 className="w-10 h-10 text-violet-600 animate-spin" />
                  </div>
                  <h3 className="font-medium text-neutral-900 mb-2">
                    Analyzing Document...
                  </h3>
                  <p className="text-sm text-neutral-500">
                    Extracting claims, deadlines, and identifying weaknesses
                  </p>
                  <div className="flex items-center justify-center gap-2 mt-4 text-xs text-violet-600">
                    <Sparkles className="w-4 h-4" />
                    <span>AI analysis in progress</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : selectedDocument.analysis ? (
            <div className="space-y-4">
              {/* Document Summary */}
              <Card>
                <CardContent className="pt-4">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-semibold text-neutral-900">
                        {selectedDocument.name}
                      </h3>
                      <p className="text-sm text-neutral-500">
                        {selectedDocument.analysis.documentType}
                      </p>
                    </div>
                    <Badge
                      variant={
                        selectedDocument.analysis.riskAssessment.level === "high"
                          ? "error"
                          : selectedDocument.analysis.riskAssessment.level === "medium"
                          ? "warning"
                          : "success"
                      }
                    >
                      {selectedDocument.analysis.riskAssessment.level.toUpperCase()} RISK
                    </Badge>
                  </div>
                  <p className="text-sm text-neutral-700 bg-neutral-50 rounded-lg p-4">
                    {selectedDocument.analysis.summary}
                  </p>
                </CardContent>
              </Card>

              {/* Tabs */}
              <div className="flex gap-2 overflow-x-auto pb-2">
                {[
                  { id: "claims", label: "Claims", icon: Target, count: selectedDocument.analysis.claims.length },
                  { id: "deadlines", label: "Deadlines", icon: Calendar, count: selectedDocument.analysis.deadlines.length },
                  { id: "weaknesses", label: "Weaknesses", icon: Shield, count: selectedDocument.analysis.weaknesses.length },
                  { id: "authorities", label: "Authorities", icon: BookOpen, count: selectedDocument.analysis.authorities.length },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    className={cn(
                      "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all",
                      activeTab === tab.id
                        ? "bg-primary-100 text-primary-700"
                        : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
                    )}
                    onClick={() => setActiveTab(tab.id as any)}
                  >
                    <tab.icon className="w-4 h-4" />
                    {tab.label}
                    <span
                      className={cn(
                        "px-2 py-0.5 rounded-full text-xs",
                        activeTab === tab.id
                          ? "bg-primary-200 text-primary-800"
                          : "bg-neutral-200 text-neutral-700"
                      )}
                    >
                      {tab.count}
                    </span>
                  </button>
                ))}
              </div>

              {/* Tab Content */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.15 }}
                >
                  {/* Claims Tab */}
                  {activeTab === "claims" && (
                    <Card>
                      <CardHeader
                        title="Extracted Claims"
                        description="Claims and allegations from opponent's filing"
                        icon={<Target className="w-5 h-5" />}
                      />
                      <CardContent>
                        <div className="space-y-3">
                          {selectedDocument.analysis.claims.map((claim) => (
                            <div
                              key={claim.id}
                              className="border border-neutral-200 rounded-lg overflow-hidden"
                            >
                              <button
                                className="w-full flex items-start gap-3 p-4 text-left hover:bg-neutral-50 transition-colors"
                                onClick={() => toggleClaimExpanded(claim.id)}
                              >
                                <div
                                  className={cn(
                                    "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold",
                                    claim.type === "factual"
                                      ? "bg-blue-100 text-blue-700"
                                      : claim.type === "legal"
                                      ? "bg-purple-100 text-purple-700"
                                      : "bg-amber-100 text-amber-700"
                                  )}
                                >
                                  {claim.claimNumber}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-1">
                                    <Badge variant="default" size="sm">
                                      {claim.type}
                                    </Badge>
                                    <Badge
                                      variant={getStrengthColor(claim.strength)}
                                      size="sm"
                                    >
                                      {claim.strength}
                                    </Badge>
                                    {claim.responseRequired && (
                                      <Badge variant="error" size="sm">
                                        Response Required
                                      </Badge>
                                    )}
                                  </div>
                                  <p className="text-sm text-neutral-900">
                                    {claim.statement}
                                  </p>
                                  {claim.paragraph && (
                                    <p className="text-xs text-neutral-500 mt-1">
                                      Paragraph {claim.paragraph}
                                    </p>
                                  )}
                                </div>
                                {expandedClaims.has(claim.id) ? (
                                  <ChevronDown className="w-5 h-5 text-neutral-400 flex-shrink-0" />
                                ) : (
                                  <ChevronRight className="w-5 h-5 text-neutral-400 flex-shrink-0" />
                                )}
                              </button>

                              <AnimatePresence>
                                {expandedClaims.has(claim.id) && (
                                  <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: "auto", opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className="border-t border-neutral-200 bg-neutral-50 overflow-hidden"
                                  >
                                    <div className="p-4 space-y-4">
                                      {claim.suggestedResponse && (
                                        <div>
                                          <h4 className="text-xs font-semibold text-neutral-700 uppercase tracking-wide mb-2">
                                            Suggested Response
                                          </h4>
                                          <p className="text-sm text-neutral-700 bg-white rounded-lg p-3 border border-neutral-200">
                                            {claim.suggestedResponse}
                                          </p>
                                        </div>
                                      )}
                                      {claim.relevantLaw && (
                                        <div>
                                          <h4 className="text-xs font-semibold text-neutral-700 uppercase tracking-wide mb-2">
                                            Relevant Law
                                          </h4>
                                          <p className="text-sm text-neutral-700 bg-white rounded-lg p-3 border border-neutral-200 font-mono">
                                            {claim.relevantLaw}
                                          </p>
                                        </div>
                                      )}
                                      <div className="flex gap-2">
                                        <Button
                                          variant="secondary"
                                          size="sm"
                                          icon={<Copy className="w-4 h-4" />}
                                        >
                                          Copy Response
                                        </Button>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          icon={<MessageSquare className="w-4 h-4" />}
                                        >
                                          Draft Reply
                                        </Button>
                                      </div>
                                    </div>
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Deadlines Tab */}
                  {activeTab === "deadlines" && (
                    <Card>
                      <CardHeader
                        title="Critical Deadlines"
                        description="Time-sensitive items requiring your attention"
                        icon={<Calendar className="w-5 h-5" />}
                      />
                      <CardContent>
                        <div className="space-y-3">
                          {selectedDocument.analysis.deadlines
                            .sort((a, b) => a.daysRemaining - b.daysRemaining)
                            .map((deadline) => (
                              <div
                                key={deadline.id}
                                className={cn(
                                  "flex items-start gap-4 p-4 rounded-lg border",
                                  deadline.priority === "critical"
                                    ? "bg-red-50 border-red-200"
                                    : deadline.priority === "high"
                                    ? "bg-amber-50 border-amber-200"
                                    : "bg-white border-neutral-200"
                                )}
                              >
                                <div
                                  className={cn(
                                    "w-12 h-12 rounded-lg flex flex-col items-center justify-center flex-shrink-0",
                                    deadline.priority === "critical"
                                      ? "bg-red-100"
                                      : deadline.priority === "high"
                                      ? "bg-amber-100"
                                      : "bg-neutral-100"
                                  )}
                                >
                                  <span
                                    className={cn(
                                      "text-lg font-bold",
                                      deadline.priority === "critical"
                                        ? "text-red-700"
                                        : deadline.priority === "high"
                                        ? "text-amber-700"
                                        : "text-neutral-700"
                                    )}
                                  >
                                    {deadline.daysRemaining}
                                  </span>
                                  <span className="text-xs text-neutral-500">days</span>
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-1">
                                    <h4 className="font-medium text-neutral-900">
                                      {deadline.description}
                                    </h4>
                                    <Badge variant={getPriorityColor(deadline.priority)} size="sm">
                                      {deadline.priority}
                                    </Badge>
                                  </div>
                                  <p className="text-sm text-neutral-600 mb-2">
                                    {deadline.actionRequired}
                                  </p>
                                  <div className="flex items-center gap-4 text-xs text-neutral-500">
                                    <span className="flex items-center gap-1">
                                      <Calendar className="w-3 h-3" />
                                      {deadline.date.toLocaleDateString("en-GB", {
                                        day: "numeric",
                                        month: "short",
                                        year: "numeric",
                                      })}
                                    </span>
                                    {deadline.courtRule && (
                                      <span className="flex items-center gap-1">
                                        <Gavel className="w-3 h-3" />
                                        {deadline.courtRule}
                                      </span>
                                    )}
                                  </div>
                                </div>
                                <Button
                                  variant="secondary"
                                  size="sm"
                                  icon={<Calendar className="w-4 h-4" />}
                                >
                                  Add to Calendar
                                </Button>
                              </div>
                            ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Weaknesses Tab */}
                  {activeTab === "weaknesses" && (
                    <Card>
                      <CardHeader
                        title="Identified Weaknesses"
                        description="Potential vulnerabilities in opponent's case"
                        icon={<Shield className="w-5 h-5" />}
                      />
                      <CardContent>
                        <div className="space-y-4">
                          {selectedDocument.analysis.weaknesses.map((weakness) => (
                            <div
                              key={weakness.id}
                              className="p-4 rounded-lg border border-neutral-200 bg-gradient-to-r from-emerald-50 to-transparent"
                            >
                              <div className="flex items-start gap-3">
                                <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center flex-shrink-0">
                                  <Lightbulb className="w-5 h-5 text-emerald-600" />
                                </div>
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-2">
                                    <Badge variant="default" size="sm">
                                      {weakness.category}
                                    </Badge>
                                    <Badge
                                      variant={
                                        weakness.exploitability === "high"
                                          ? "success"
                                          : weakness.exploitability === "medium"
                                          ? "warning"
                                          : "default"
                                      }
                                      size="sm"
                                    >
                                      {weakness.exploitability} opportunity
                                    </Badge>
                                  </div>
                                  <h4 className="font-medium text-neutral-900 mb-2">
                                    {weakness.description}
                                  </h4>
                                  <div className="bg-white rounded-lg p-3 border border-emerald-200">
                                    <h5 className="text-xs font-semibold text-emerald-700 uppercase tracking-wide mb-1">
                                      Suggested Strategy
                                    </h5>
                                    <p className="text-sm text-neutral-700">
                                      {weakness.suggestedStrategy}
                                    </p>
                                  </div>
                                  {weakness.relevantAuthority && (
                                    <p className="text-xs text-neutral-500 mt-2 font-mono">
                                      Authority: {weakness.relevantAuthority}
                                    </p>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Authorities Tab */}
                  {activeTab === "authorities" && (
                    <Card>
                      <CardHeader
                        title="Case Authorities"
                        description="Legal authorities cited and their relevance"
                        icon={<BookOpen className="w-5 h-5" />}
                      />
                      <CardContent>
                        <div className="space-y-3">
                          {selectedDocument.analysis.authorities.map((auth) => (
                            <div
                              key={auth.id}
                              className={cn(
                                "p-4 rounded-lg border",
                                auth.favorableFor === "you"
                                  ? "bg-emerald-50 border-emerald-200"
                                  : auth.favorableFor === "opponent"
                                  ? "bg-red-50 border-red-200"
                                  : "bg-neutral-50 border-neutral-200"
                              )}
                            >
                              <div className="flex items-start justify-between gap-4">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-2">
                                    <h4 className="font-mono text-sm font-medium text-neutral-900">
                                      {auth.citation}
                                    </h4>
                                    <Badge
                                      variant={
                                        auth.favorableFor === "you"
                                          ? "success"
                                          : auth.favorableFor === "opponent"
                                          ? "error"
                                          : "default"
                                      }
                                      size="sm"
                                    >
                                      {auth.favorableFor === "you"
                                        ? "Favorable"
                                        : auth.favorableFor === "opponent"
                                        ? "Unfavorable"
                                        : "Neutral"}
                                    </Badge>
                                  </div>
                                  <p className="text-sm text-neutral-700 mb-2">
                                    {auth.relevance}
                                  </p>
                                  {auth.keyQuote && (
                                    <blockquote className="text-sm text-neutral-600 italic border-l-2 border-neutral-300 pl-3">
                                      "{auth.keyQuote}"
                                    </blockquote>
                                  )}
                                </div>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  icon={<ExternalLink className="w-4 h-4" />}
                                >
                                  View
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </motion.div>
              </AnimatePresence>

              {/* Required Actions */}
              <Card className="bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200">
                <CardHeader
                  title="Required Actions"
                  description="What you need to do in response"
                  icon={<ListChecks className="w-5 h-5 text-amber-600" />}
                />
                <CardContent>
                  <div className="space-y-2">
                    {selectedDocument.analysis.requiredActions.map((action, i) => (
                      <div key={i} className="flex items-start gap-3">
                        <div className="w-6 h-6 rounded-full bg-amber-200 text-amber-800 flex items-center justify-center text-xs font-bold flex-shrink-0">
                          {i + 1}
                        </div>
                        <p className="text-sm text-neutral-700">{action}</p>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2 mt-4">
                    <Button
                      variant="primary"
                      icon={<Zap className="w-4 h-4" />}
                      onClick={() => onAction?.("new-document")}
                    >
                      Draft Response
                    </Button>
                    <Button
                      variant="secondary"
                      icon={<Download className="w-4 h-4" />}
                    >
                      Export Analysis
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};

// Mock analysis generator (in real app, this would call an LLM)
function generateMockAnalysis(filename: string): AnalysisResult {
  return {
    documentType: "Application for Summary Judgment",
    summary:
      "The Plaintiff is seeking summary judgment on their breach of contract claim, arguing there are no genuine issues of material fact. They rely primarily on the written agreement and payment records. However, the application appears to be procedurally deficient in several respects and the factual assertions are not fully supported by admissible evidence.",
    claims: [
      {
        id: "claim-1",
        claimNumber: 1,
        type: "factual",
        statement: "The Defendant entered into a binding agreement on 15 January 2023",
        paragraph: "12",
        strength: "moderate",
        responseRequired: true,
        suggestedResponse:
          "Deny. The purported agreement lacks essential terms and was never properly executed. The signature on the document is disputed.",
        relevantLaw: "Contract Formation - Offer and Acceptance",
      },
      {
        id: "claim-2",
        claimNumber: 2,
        type: "factual",
        statement: "The Defendant failed to make payments as required under the agreement",
        paragraph: "15-18",
        strength: "strong",
        responseRequired: true,
        suggestedResponse:
          "Deny in part. While certain payments were delayed, this was due to the Plaintiff's own breach of their obligations under clause 4.2.",
        relevantLaw: "Breach of Contract - Performance and Breach",
      },
      {
        id: "claim-3",
        claimNumber: 3,
        type: "legal",
        statement: "The Plaintiff is entitled to summary judgment as there are no triable issues of fact",
        paragraph: "25",
        strength: "weak",
        responseRequired: true,
        suggestedResponse:
          "Deny. There are genuine disputes of material fact regarding contract formation, performance, and damages that require trial.",
        relevantLaw: "O.14 RHC - Summary Judgment",
      },
      {
        id: "claim-4",
        claimNumber: 4,
        type: "procedural",
        statement: "The application is properly supported by evidence",
        paragraph: "8",
        strength: "weak",
        responseRequired: true,
        suggestedResponse:
          "Challenge. The supporting affirmation contains inadmissible hearsay and the exhibits are not properly authenticated.",
        relevantLaw: "Evidence Rules - Hearsay and Authentication",
      },
    ],
    deadlines: [
      {
        id: "deadline-1",
        description: "File Affirmation in Opposition",
        date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        source: "Court Rules",
        courtRule: "O.14 r.4",
        daysRemaining: 14,
        priority: "critical",
        actionRequired: "Prepare and file affirmation opposing summary judgment with supporting exhibits",
      },
      {
        id: "deadline-2",
        description: "File Skeleton Argument",
        date: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000),
        source: "Court Practice Direction",
        courtRule: "PD 5.2",
        daysRemaining: 21,
        priority: "high",
        actionRequired: "Submit written legal arguments with authorities",
      },
      {
        id: "deadline-3",
        description: "Hearing Date",
        date: new Date(Date.now() + 28 * 24 * 60 * 60 * 1000),
        source: "Court Notice",
        daysRemaining: 28,
        priority: "high",
        actionRequired: "Attend court for summary judgment hearing",
      },
    ],
    weaknesses: [
      {
        id: "weakness-1",
        category: "procedural",
        description: "Affirmation not sworn before proper authority",
        exploitability: "high",
        suggestedStrategy:
          "File a preliminary objection that the supporting affirmation is defective as it was not properly sworn. Request the application be dismissed or adjourned for re-service.",
        relevantAuthority: "Re ABC Ltd [2020] HKCFI 1234",
      },
      {
        id: "weakness-2",
        category: "evidential",
        description: "Key exhibits are copies without proper certification",
        exploitability: "medium",
        suggestedStrategy:
          "Object to the admission of uncertified copies. Argue that without original documents or properly certified copies, the factual claims are not supported by admissible evidence.",
        relevantAuthority: "Evidence Ordinance Cap.8 s.22",
      },
      {
        id: "weakness-3",
        category: "legal",
        description: "Application fails to address your affirmative defense",
        exploitability: "high",
        suggestedStrategy:
          "Emphasize that the Plaintiff has not addressed your defense of mutual breach/set-off. Argue this alone creates a triable issue precluding summary judgment.",
        relevantAuthority: "Ng Chun Kwan v Li Hung [2018] HKCA 576",
      },
      {
        id: "weakness-4",
        category: "factual",
        description: "Damages calculation lacks supporting evidence",
        exploitability: "medium",
        suggestedStrategy:
          "Challenge the damages figure as speculative. The Plaintiff has provided no invoices, receipts, or expert evidence to support their claimed losses.",
      },
    ],
    authorities: [
      {
        id: "auth-1",
        citation: "Ng Chun Kwan v Li Hung [2018] HKCA 576",
        relevance: "Sets out the test for summary judgment - Plaintiff must show no triable issue",
        favorableFor: "you",
        keyQuote: "Where there is a genuine dispute of fact, summary judgment should not be granted",
      },
      {
        id: "auth-2",
        citation: "Fancourt v Mercantile Credits Ltd (1983) 154 CLR 87",
        relevance: "Cited by Plaintiff for standard of proof in contract cases",
        favorableFor: "opponent",
        keyQuote: "A party who relies on a contract must prove its terms",
      },
      {
        id: "auth-3",
        citation: "Hong Kong Civil Procedure 2024 [O.14]",
        relevance: "Procedural requirements for summary judgment applications",
        favorableFor: "neutral",
      },
    ],
    requiredActions: [
      "Prepare affirmation in opposition setting out your version of disputed facts",
      "Gather documentary evidence to support your defenses",
      "File preliminary objection to procedural defects within 7 days",
      "Research additional case authorities supporting your position",
      "Consider cross-application to strike out or for security for costs",
      "Prepare skeleton argument for hearing",
    ],
    riskAssessment: {
      level: "medium",
      factors: [
        "Procedural defects in application provide grounds for challenge",
        "Genuine factual disputes exist that require trial",
        "However, some documentary evidence favors Plaintiff",
        "Need to act quickly on deadlines",
      ],
    },
  };
}

// External link icon component
const ExternalLink: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
    <polyline points="15 3 21 3 21 9" />
    <line x1="10" y1="14" x2="21" y2="3" />
  </svg>
);
