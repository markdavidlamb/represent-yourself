"use client";

/**
 * Case Onboarding Wizard
 *
 * AI-first onboarding flow:
 * 1. User uploads all their legal documents
 * 2. AI processes everything and extracts case information
 * 3. AI asks clarifying questions based on what it found
 * 4. AI generates complete case profile
 */

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Upload,
  FileText,
  Sparkles,
  Check,
  ChevronRight,
  ArrowLeft,
  Loader2,
  MessageSquare,
  FolderOpen,
  AlertCircle,
  CheckCircle,
  Send,
  X,
  Key,
} from "lucide-react";
import { Button } from "../ui/Button";
import { Card, CardContent } from "../ui/Card";
import { cn } from "@/lib/utils";
import {
  deepAnalyzeDocument,
  buildCaseProfile,
  generateClarifyingQuestions,
  hasApiKey,
  setApiKey,
  getApiKey,
} from "@/lib/ai-service";
import { saveCaseData, saveExhibits, CaseData, Exhibit } from "@/lib/case-store";

interface CaseOnboardingProps {
  onComplete: (caseData: any) => void;
}

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  content?: string;
  status: "uploading" | "processing" | "processed" | "error";
  analysis?: any;
  error?: string;
}

interface AIQuestion {
  id: string;
  question: string;
  type: "text" | "select" | "multiselect" | "date";
  options?: string[];
  answer?: string;
  context?: string;
}

type OnboardingStep = "api-key" | "upload" | "processing" | "questions" | "building" | "complete";

export const CaseOnboarding: React.FC<CaseOnboardingProps> = ({ onComplete }) => {
  // Start with loading state, then check API key in useEffect
  const [step, setStep] = React.useState<OnboardingStep | "loading">("loading");
  const [files, setFiles] = React.useState<UploadedFile[]>([]);

  // Check API key on mount (client-side only)
  React.useEffect(() => {
    setStep(hasApiKey() ? "upload" : "api-key");
  }, []);
  const [processingProgress, setProcessingProgress] = React.useState(0);
  const [currentProcessingFile, setCurrentProcessingFile] = React.useState<string>("");
  const [questions, setQuestions] = React.useState<AIQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = React.useState(0);
  const [caseProfile, setCaseProfile] = React.useState<any>(null);
  const [isProcessing, setIsProcessing] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [apiKeyInput, setApiKeyInput] = React.useState("");
  const [apiKeyError, setApiKeyError] = React.useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Handle API key submission
  const handleApiKeySubmit = () => {
    if (!apiKeyInput.trim()) {
      setApiKeyError("Please enter an API key");
      return;
    }
    if (!apiKeyInput.startsWith("sk-")) {
      setApiKeyError("API key should start with 'sk-'");
      return;
    }
    setApiKey(apiKeyInput.trim());
    setApiKeyError(null);
    setStep("upload");
  };

  // Handle file selection
  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = event.target.files;
    if (!selectedFiles) return;

    const newFiles: UploadedFile[] = [];

    for (let i = 0; i < selectedFiles.length; i++) {
      const file = selectedFiles[i];
      const uploadedFile: UploadedFile = {
        id: `${Date.now()}-${i}`,
        name: file.name,
        size: file.size,
        type: file.type || getFileType(file.name),
        status: "uploading",
      };
      newFiles.push(uploadedFile);
    }

    setFiles((prev) => [...prev, ...newFiles]);

    // Read file contents
    for (let i = 0; i < selectedFiles.length; i++) {
      const file = selectedFiles[i];
      const fileId = newFiles[i].id;

      try {
        const content = await extractTextFromFile(file);
        setFiles((prev) =>
          prev.map((f) =>
            f.id === fileId ? { ...f, content, status: "processing" } : f
          )
        );
      } catch (err) {
        setFiles((prev) =>
          prev.map((f) =>
            f.id === fileId ? { ...f, status: "error", error: String(err) } : f
          )
        );
      }
    }

    // Reset input
    if (event.target) {
      event.target.value = "";
    }
  };

  // Extract text from various file types
  const extractTextFromFile = async (file: File): Promise<string> => {
    const fileType = file.type || getFileType(file.name);

    // Handle PDFs
    if (fileType === "application/pdf" || file.name.toLowerCase().endsWith(".pdf")) {
      return extractTextFromPDF(file);
    }

    // Handle text files and documents
    if (
      fileType.includes("text") ||
      fileType.includes("document") ||
      file.name.endsWith(".txt") ||
      file.name.endsWith(".md")
    ) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.onerror = reject;
        reader.readAsText(file);
      });
    }

    // Handle images - return placeholder (would need OCR in production)
    if (fileType.includes("image")) {
      return `[Image file: ${file.name}. Image analysis will be performed by AI.]`;
    }

    // Default: try to read as text
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string || `[File: ${file.name}]`);
      reader.onerror = () => resolve(`[Unable to read file: ${file.name}]`);
      reader.readAsText(file);
    });
  };

  // Extract text from PDF using PDF.js
  const extractTextFromPDF = async (file: File): Promise<string> => {
    try {
      // Dynamic import for PDF.js
      const pdfjsLib = await import("pdfjs-dist");

      // Set worker source
      pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

      let fullText = "";
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items
          .map((item: any) => item.str)
          .join(" ");
        fullText += pageText + "\n\n";
      }

      return fullText.trim() || `[PDF file: ${file.name} - no extractable text found. May be a scanned document.]`;
    } catch (err) {
      console.error("PDF extraction error:", err);
      return `[PDF file: ${file.name} - unable to extract text: ${err}]`;
    }
  };

  // Get file type from extension
  const getFileType = (filename: string): string => {
    const ext = filename.split(".").pop()?.toLowerCase();
    switch (ext) {
      case "pdf":
        return "application/pdf";
      case "doc":
      case "docx":
        return "application/msword";
      case "txt":
        return "text/plain";
      case "jpg":
      case "jpeg":
      case "png":
        return "image/*";
      default:
        return "application/octet-stream";
    }
  };

  // Remove file
  const removeFile = (id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  };

  // Format file size
  const formatSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  // Start AI processing - REAL AI CALLS
  const startProcessing = async () => {
    if (files.length === 0) return;

    setStep("processing");
    setIsProcessing(true);
    setProcessingProgress(0);
    setError(null);

    const processedFiles: UploadedFile[] = [...files];
    const documentSummaries: Array<{ name: string; summary: string; type: string; keyFacts: string[] }> = [];

    try {
      // Process each document with REAL AI analysis
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        setCurrentProcessingFile(file.name);
        setProcessingProgress(((i) / files.length) * 80); // 80% for document analysis

        if (!file.content || file.status === "error") {
          continue;
        }

        try {
          // Call the REAL AI analysis function
          const analysis = await deepAnalyzeDocument(
            file.content,
            file.name,
            documentSummaries.length > 0
              ? `Previous documents analyzed:\n${documentSummaries.map((d) => `- ${d.name}: ${d.summary}`).join("\n")}`
              : undefined
          );

          processedFiles[i] = {
            ...processedFiles[i],
            status: "processed",
            analysis,
          };

          documentSummaries.push({
            name: file.name,
            summary: analysis.summary,
            type: analysis.documentType,
            keyFacts: analysis.keyFacts.map((f) => f.fact),
          });

          setFiles([...processedFiles]);
        } catch (err) {
          console.error(`Error analyzing ${file.name}:`, err);
          processedFiles[i] = {
            ...processedFiles[i],
            status: "error",
            error: String(err),
          };
          setFiles([...processedFiles]);
        }
      }

      setProcessingProgress(85);
      setCurrentProcessingFile("Building case profile...");

      // Build case profile from all analyzed documents
      const profile = await buildCaseProfile(documentSummaries);

      setProcessingProgress(95);
      setCurrentProcessingFile("Generating questions...");

      // Generate clarifying questions based on the profile
      const questionsResult = await generateClarifyingQuestions(profile);

      // Convert to our question format
      const aiQuestions: AIQuestion[] = [
        // Add critical questions first
        ...questionsResult.criticalQuestions.slice(0, 3).map((q, i) => ({
          id: `critical-${i}`,
          question: q.question,
          type: "text" as const,
          context: `${q.why} Impact: ${q.impact}`,
        })),
        // Add background questions
        ...questionsResult.backgroundQuestions.slice(0, 3).map((q, i) => ({
          id: `bg-${i}`,
          question: q.question,
          type: "text" as const,
          context: `Category: ${q.category}`,
        })),
      ];

      // If no questions generated, add defaults
      if (aiQuestions.length === 0) {
        aiQuestions.push(
          {
            id: "1",
            question: "What is your case number?",
            type: "text",
            context: "We need this to identify your case in the system.",
          },
          {
            id: "2",
            question: "Are you the plaintiff/claimant or defendant/respondent?",
            type: "select",
            options: ["Plaintiff/Claimant", "Defendant/Respondent"],
            context: "This helps tailor our guidance to your position.",
          },
          {
            id: "3",
            question: "When is your next court date or deadline?",
            type: "date",
            context: "We need to track urgent deadlines.",
          }
        );
      }

      setQuestions(aiQuestions);
      setCaseProfile(profile);
      setProcessingProgress(100);

      setStep("questions");
    } catch (err) {
      console.error("Processing error:", err);
      setError(`Failed to process documents: ${err}. Please check your API key and try again.`);
      setStep("upload");
    } finally {
      setIsProcessing(false);
    }
  };

  // Answer a question
  const answerQuestion = (questionId: string, answer: string) => {
    setQuestions((prev) =>
      prev.map((q) => (q.id === questionId ? { ...q, answer } : q))
    );
  };

  // Go to next question
  const nextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    } else {
      buildFinalCaseProfile();
    }
  };

  // Go to previous question
  const prevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
    }
  };

  // Build final case profile and save to localStorage
  const buildFinalCaseProfile = async () => {
    setStep("building");
    setIsProcessing(true);

    try {
      // Merge question answers into case profile
      const finalProfile = {
        ...caseProfile,
        userAnswers: questions.reduce((acc, q) => {
          if (q.answer) {
            acc[q.id] = q.answer;
          }
          return acc;
        }, {} as Record<string, string>),
      };

      // Extract case number and role from answers
      const caseNumberAnswer = questions.find((q) =>
        q.question.toLowerCase().includes("case number")
      )?.answer;
      const roleAnswer = questions.find((q) =>
        q.question.toLowerCase().includes("plaintiff") ||
        q.question.toLowerCase().includes("defendant")
      )?.answer;
      const nextDeadlineAnswer = questions.find((q) =>
        q.question.toLowerCase().includes("deadline") ||
        q.question.toLowerCase().includes("court date")
      )?.answer;

      // Build proper CaseData structure for storage
      const caseData: CaseData = {
        case: {
          caseNumber: caseNumberAnswer || finalProfile.parties?.[0]?.name || "TBD",
          court: finalProfile.procedural?.currentStage || "Unknown Court",
          relatedProceedings: [],
          caseManagementJudge: "",
        },
        parties: {
          plaintiffs: finalProfile.parties
            ?.filter((p: any) => p.role?.toLowerCase().includes("plaintiff"))
            .map((p: any) => ({
              name: p.name,
              designation: p.role,
              jurisdiction: "",
            })) || [],
          defendants: finalProfile.parties
            ?.filter((p: any) => p.role?.toLowerCase().includes("defendant"))
            .map((p: any) => ({
              name: p.name,
              designation: p.role,
              isYou: roleAnswer?.toLowerCase().includes("defendant"),
              status: "Active" as const,
            })) || [],
          opposingSolicitors: {
            firm: "",
            partner: "",
          },
        },
        nextHearing: {
          date: nextDeadlineAnswer || "",
          judge: "",
          matters: finalProfile.nextActions?.map((a: any) => a.action) || [],
        },
        applications: finalProfile.claims?.map((c: any) => ({
          type: c.claim,
          filedBy: "Unknown",
          status: c.status || "Pending",
          yourPosition: "",
          priority: "medium" as const,
          nextStep: "",
        })) || [],
        yourStrengths: finalProfile.yourStrengths || [],
        theirWeaknesses: finalProfile.theirWeaknesses || [],
        timeline: finalProfile.timeline?.map((t: any) => ({
          date: t.date,
          event: t.event,
          type: t.type || "court",
        })) || [],
      };

      // Save case data to localStorage
      saveCaseData(caseData);

      // Save exhibits from uploaded files
      const exhibits: Exhibit[] = files
        .filter((f) => f.status === "processed")
        .map((f, i) => ({
          id: f.id,
          exhibitNumber: `EX-${String(i + 1).padStart(3, "0")}`,
          title: f.name,
          description: f.analysis?.summary || "",
          documentType: getDocumentType(f.type),
          fileName: f.name,
          fileSize: f.size,
          dateAdded: new Date().toISOString(),
          dateOfDocument: f.analysis?.dateOfDocument || "",
          tags: f.analysis?.keyFacts?.slice(0, 3).map((k: any) => k.fact?.slice(0, 20)) || [],
          status: "ready" as const,
        }));

      saveExhibits(exhibits);

      setCaseProfile(finalProfile);
      setStep("complete");
    } catch (err) {
      console.error("Error building case profile:", err);
      setError("Failed to build case profile. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  // Helper to determine document type
  const getDocumentType = (mimeType: string): Exhibit["documentType"] => {
    if (mimeType.includes("pdf")) return "pdf";
    if (mimeType.includes("word") || mimeType.includes("document")) return "docx";
    if (mimeType.includes("image")) return "image";
    if (mimeType.includes("spreadsheet") || mimeType.includes("excel")) return "spreadsheet";
    return "other";
  };

  // Complete onboarding
  const handleComplete = () => {
    onComplete(caseProfile);
  };

  // Render step content
  const renderStepContent = () => {
    switch (step) {
      case "loading":
        return (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="w-12 h-12 rounded-full border-4 border-primary-200 border-t-primary-600 animate-spin mx-auto mb-4" />
              <p className="text-neutral-500">Loading...</p>
            </div>
          </div>
        );

      case "api-key":
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-indigo-600 flex items-center justify-center mx-auto mb-4 shadow-lg">
                <Key className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-neutral-900 mb-2">
                Connect Your AI
              </h2>
              <p className="text-neutral-600 max-w-md mx-auto">
                Enter your Claude API key to enable AI-powered document analysis.
                Your key is stored locally and never sent to our servers.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Claude API Key
                </label>
                <input
                  type="password"
                  value={apiKeyInput}
                  onChange={(e) => setApiKeyInput(e.target.value)}
                  placeholder="sk-ant-api03-..."
                  className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                {apiKeyError && (
                  <p className="text-sm text-red-500 mt-1">{apiKeyError}</p>
                )}
              </div>

              <div className="text-sm text-neutral-500 bg-neutral-50 rounded-lg p-4">
                <p className="font-medium mb-2">How to get an API key:</p>
                <ol className="list-decimal list-inside space-y-1">
                  <li>Go to console.anthropic.com</li>
                  <li>Sign in or create an account</li>
                  <li>Navigate to API Keys</li>
                  <li>Create a new key and copy it here</li>
                </ol>
              </div>

              <Button
                size="lg"
                className="w-full"
                onClick={handleApiKeySubmit}
              >
                Continue
                <ChevronRight className="w-5 h-5 ml-2" />
              </Button>
            </div>
          </div>
        );

      case "upload":
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-indigo-600 flex items-center justify-center mx-auto mb-4 shadow-lg">
                <Upload className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-neutral-900 mb-2">
                Upload Your Legal Documents
              </h2>
              <p className="text-neutral-600 max-w-md mx-auto">
                Upload all your court documents, correspondence, and evidence.
                Our AI will analyze everything to understand your case.
              </p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 text-sm">
                <AlertCircle className="w-4 h-4 inline mr-2" />
                {error}
              </div>
            )}

            {/* Upload area */}
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-neutral-300 rounded-2xl p-12 text-center cursor-pointer hover:border-primary-400 hover:bg-primary-50/50 transition-all"
            >
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png"
                onChange={handleFileSelect}
                className="hidden"
              />
              <FolderOpen className="w-12 h-12 text-neutral-400 mx-auto mb-4" />
              <p className="text-lg font-medium text-neutral-700">
                Click to upload or drag and drop
              </p>
              <p className="text-sm text-neutral-500 mt-2">
                PDF, DOC, DOCX, TXT, and images supported
              </p>
              <p className="text-xs text-neutral-400 mt-4">
                Upload everything: court orders, pleadings, evidence, emails, contracts
              </p>
            </div>

            {/* Uploaded files list */}
            {files.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-neutral-700">
                  Uploaded ({files.length} files)
                </h3>
                <div className="max-h-48 overflow-y-auto space-y-2">
                  {files.map((file) => (
                    <div
                      key={file.id}
                      className="flex items-center gap-3 p-3 bg-neutral-50 rounded-lg"
                    >
                      <FileText className="w-5 h-5 text-neutral-400" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-neutral-900 truncate">
                          {file.name}
                        </p>
                        <p className="text-xs text-neutral-500">
                          {formatSize(file.size)}
                          {file.error && (
                            <span className="text-red-500 ml-2">{file.error}</span>
                          )}
                        </p>
                      </div>
                      {file.status === "uploading" && (
                        <Loader2 className="w-4 h-4 text-primary-500 animate-spin" />
                      )}
                      {file.status === "processing" && (
                        <span className="text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded">
                          Ready
                        </span>
                      )}
                      {file.status === "processed" && (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      )}
                      {file.status === "error" && (
                        <AlertCircle className="w-4 h-4 text-red-500" />
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeFile(file.id);
                        }}
                        className="p-1 hover:bg-neutral-200 rounded"
                      >
                        <X className="w-4 h-4 text-neutral-400" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Continue button */}
            <Button
              size="lg"
              className="w-full"
              disabled={files.length === 0 || files.some((f) => f.status === "uploading")}
              onClick={startProcessing}
            >
              <Sparkles className="w-5 h-5 mr-2" />
              Analyze Documents with AI
            </Button>

            {files.length === 0 && (
              <p className="text-sm text-neutral-500 text-center">
                Upload at least one document to continue
              </p>
            )}
          </div>
        );

      case "processing":
        return (
          <div className="space-y-6 text-center">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary-500 to-indigo-600 flex items-center justify-center mx-auto mb-4 shadow-lg">
              <Sparkles className="w-10 h-10 text-white animate-pulse" />
            </div>
            <h2 className="text-2xl font-bold text-neutral-900">
              AI is Analyzing Your Documents
            </h2>
            <p className="text-neutral-600 max-w-md mx-auto">
              Claude is reading through everything to understand your case.
              This may take a few minutes for large document sets.
            </p>

            {/* Progress bar */}
            <div className="w-full max-w-md mx-auto">
              <div className="h-3 bg-neutral-200 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-primary-500 to-indigo-600"
                  initial={{ width: 0 }}
                  animate={{ width: `${processingProgress}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
              <p className="text-sm text-neutral-500 mt-2">
                {Math.round(processingProgress)}% complete
              </p>
              {currentProcessingFile && (
                <p className="text-xs text-neutral-400 mt-1">
                  {currentProcessingFile}
                </p>
              )}
            </div>

            {/* Current file being processed */}
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {files.map((file) => (
                <div
                  key={file.id}
                  className={cn(
                    "flex items-center gap-3 p-3 rounded-lg transition-colors",
                    file.status === "processed"
                      ? "bg-green-50"
                      : file.status === "error"
                      ? "bg-red-50"
                      : "bg-neutral-50"
                  )}
                >
                  <FileText className="w-5 h-5 text-neutral-400" />
                  <span className="flex-1 text-sm text-left truncate">
                    {file.name}
                  </span>
                  {file.status === "processed" && (
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  )}
                  {file.status === "processing" && currentProcessingFile === file.name && (
                    <Loader2 className="w-4 h-4 text-primary-500 animate-spin" />
                  )}
                  {file.status === "error" && (
                    <AlertCircle className="w-4 h-4 text-red-500" />
                  )}
                </div>
              ))}
            </div>
          </div>
        );

      case "questions":
        const currentQuestion = questions[currentQuestionIndex];
        if (!currentQuestion) {
          // No questions, skip to building
          buildFinalCaseProfile();
          return null;
        }
        return (
          <div className="space-y-6">
            <div className="text-center mb-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-indigo-600 flex items-center justify-center mx-auto mb-4 shadow-lg">
                <MessageSquare className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-neutral-900">
                Help Me Understand Your Case
              </h2>
              <p className="text-sm text-neutral-500 mt-2">
                Question {currentQuestionIndex + 1} of {questions.length}
              </p>
            </div>

            {/* Progress dots */}
            <div className="flex justify-center gap-2">
              {questions.map((_, i) => (
                <div
                  key={i}
                  className={cn(
                    "w-2 h-2 rounded-full transition-colors",
                    i === currentQuestionIndex
                      ? "bg-primary-500"
                      : i < currentQuestionIndex
                      ? "bg-green-500"
                      : "bg-neutral-200"
                  )}
                />
              ))}
            </div>

            {/* Question card */}
            <Card className="border-primary-100">
              <CardContent className="p-6">
                {currentQuestion.context && (
                  <div className="flex items-start gap-2 mb-4 p-3 bg-amber-50 rounded-lg text-sm text-amber-800">
                    <Sparkles className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <p>{currentQuestion.context}</p>
                  </div>
                )}

                <h3 className="text-lg font-medium text-neutral-900 mb-4">
                  {currentQuestion.question}
                </h3>

                {currentQuestion.type === "text" && (
                  <input
                    type="text"
                    value={currentQuestion.answer || ""}
                    onChange={(e) => answerQuestion(currentQuestion.id, e.target.value)}
                    placeholder="Type your answer..."
                    className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                )}

                {currentQuestion.type === "date" && (
                  <input
                    type="date"
                    value={currentQuestion.answer || ""}
                    onChange={(e) => answerQuestion(currentQuestion.id, e.target.value)}
                    className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                )}

                {currentQuestion.type === "select" && currentQuestion.options && (
                  <div className="space-y-2">
                    {currentQuestion.options.map((option) => (
                      <button
                        key={option}
                        onClick={() => answerQuestion(currentQuestion.id, option)}
                        className={cn(
                          "w-full p-3 text-left rounded-lg border transition-all",
                          currentQuestion.answer === option
                            ? "border-primary-500 bg-primary-50 text-primary-700"
                            : "border-neutral-200 hover:border-neutral-300"
                        )}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Navigation */}
            <div className="flex gap-3">
              <Button
                variant="secondary"
                onClick={prevQuestion}
                disabled={currentQuestionIndex === 0}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <Button
                className="flex-1"
                onClick={nextQuestion}
              >
                {currentQuestionIndex === questions.length - 1 ? (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Build My Case Profile
                  </>
                ) : (
                  <>
                    Next
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            </div>
          </div>
        );

      case "building":
        return (
          <div className="space-y-6 text-center">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary-500 to-indigo-600 flex items-center justify-center mx-auto mb-4 shadow-lg">
              <Sparkles className="w-10 h-10 text-white animate-pulse" />
            </div>
            <h2 className="text-2xl font-bold text-neutral-900">
              Building Your Case Profile
            </h2>
            <p className="text-neutral-600 max-w-md mx-auto">
              Claude is combining your documents and answers to create a
              comprehensive understanding of your case.
            </p>
            <div className="w-12 h-12 rounded-full border-4 border-primary-200 border-t-primary-600 animate-spin mx-auto" />
          </div>
        );

      case "complete":
        return (
          <div className="space-y-6 text-center">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center mx-auto mb-4 shadow-lg">
              <Check className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-neutral-900">
              Your Case is Ready!
            </h2>
            <p className="text-neutral-600 max-w-md mx-auto">
              AI has analyzed {files.filter((f) => f.status === "processed").length} documents and built your case profile.
              You can now access all features of the app.
            </p>

            {/* Summary */}
            <Card className="text-left">
              <CardContent className="p-6 space-y-3">
                {caseProfile?.caseSummary && (
                  <div>
                    <span className="text-neutral-500 text-sm">Summary</span>
                    <p className="text-sm mt-1">{caseProfile.caseSummary.slice(0, 200)}...</p>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-neutral-500">Documents Analyzed</span>
                  <span className="font-medium">{files.filter((f) => f.status === "processed").length}</span>
                </div>
                {caseProfile?.yourStrengths?.length > 0 && (
                  <div className="flex justify-between">
                    <span className="text-neutral-500">Key Strengths Found</span>
                    <span className="font-medium">{caseProfile.yourStrengths.length}</span>
                  </div>
                )}
                {caseProfile?.nextActions?.length > 0 && (
                  <div className="flex justify-between">
                    <span className="text-neutral-500">Recommended Actions</span>
                    <span className="font-medium">{caseProfile.nextActions.length}</span>
                  </div>
                )}
              </CardContent>
            </Card>

            <Button size="lg" className="w-full" onClick={handleComplete}>
              Start Using the App
              <ChevronRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-primary-50/30 flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-xl w-full"
      >
        <Card className="shadow-xl">
          <CardContent className="p-8">{renderStepContent()}</CardContent>
        </Card>
      </motion.div>
    </div>
  );
};
