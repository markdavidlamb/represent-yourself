"use client";

import * as React from "react";
import { motion, AnimatePresence, Reorder } from "framer-motion";
import {
  FolderOpen,
  FileText,
  Image,
  File,
  Plus,
  Trash2,
  Edit2,
  GripVertical,
  Download,
  Upload,
  Eye,
  Search,
  Filter,
  Tag,
  Calendar,
  CheckCircle2,
  Circle,
  X,
  ChevronRight,
  ChevronDown,
  Copy,
  ExternalLink,
  Printer,
  FileImage,
  FileVideo,
  FileAudio,
  FileSpreadsheet,
  Paperclip,
  Hash,
  MoreVertical,
  FolderPlus,
  Move,
  Link2,
  AlertCircle,
  Info,
  Sparkles,
} from "lucide-react";
import { Card, CardHeader, CardContent } from "../ui/Card";
import { Button } from "../ui/Button";
import { Input, SearchInput, TextArea } from "../ui/Input";
import { Badge, StatusBadge } from "../ui/Badge";
import { cn } from "@/lib/utils";
import { analyzeDocument, hasApiKey } from "@/lib/ai-service";

// Types
interface DocumentAnalysis {
  summary: string;
  documentType: string;
  keyPoints: string[];
  parties: string[];
  dates: string[];
  legalIssues: string[];
  suggestedActions: string[];
}
type DocumentType = "pdf" | "docx" | "image" | "video" | "audio" | "spreadsheet" | "other";
type ExhibitStatus = "draft" | "ready" | "filed" | "admitted";

interface Exhibit {
  id: string;
  exhibitNumber: string;
  title: string;
  description?: string;
  documentType: DocumentType;
  fileName: string;
  fileSize: number;
  fileContent?: string; // Extracted text content for AI analysis
  dateAdded: Date;
  dateOfDocument?: Date;
  source?: string;
  tags: string[];
  status: ExhibitStatus;
  bundleId?: string;
  pageStart?: number;
  pageEnd?: number;
  notes?: string;
  relatedExhibits?: string[];
  aiAnalysis?: DocumentAnalysis; // AI-generated analysis
}

interface ExhibitBundle {
  id: string;
  name: string;
  description?: string;
  caseId?: string;
  exhibits: string[]; // Exhibit IDs in order
  createdAt: Date;
  updatedAt: Date;
  status: "draft" | "finalized";
  totalPages?: number;
}

interface EvidenceManagerProps {
  onNavigate?: (view: string) => void;
  onAction?: (action: string, data?: any) => void;
}

// Helper to get document icon
const getDocumentIcon = (type: DocumentType) => {
  switch (type) {
    case "pdf":
      return <FileText className="w-5 h-5 text-red-500" />;
    case "docx":
      return <FileText className="w-5 h-5 text-blue-500" />;
    case "image":
      return <FileImage className="w-5 h-5 text-green-500" />;
    case "video":
      return <FileVideo className="w-5 h-5 text-purple-500" />;
    case "audio":
      return <FileAudio className="w-5 h-5 text-orange-500" />;
    case "spreadsheet":
      return <FileSpreadsheet className="w-5 h-5 text-emerald-500" />;
    default:
      return <File className="w-5 h-5 text-neutral-500" />;
  }
};

// Helper to format file size
const formatFileSize = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

export const EvidenceManager: React.FC<EvidenceManagerProps> = ({
  onNavigate,
  onAction,
}) => {
  // State
  const [view, setView] = React.useState<"all" | "bundles" | "upload">("all");
  const [exhibits, setExhibits] = React.useState<Exhibit[]>([]);
  const [bundles, setBundles] = React.useState<ExhibitBundle[]>([]);
  const [selectedBundle, setSelectedBundle] = React.useState<ExhibitBundle | null>(null);
  const [selectedExhibits, setSelectedExhibits] = React.useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = React.useState("");
  const [filterType, setFilterType] = React.useState<DocumentType | "all">("all");
  const [filterStatus, setFilterStatus] = React.useState<ExhibitStatus | "all">("all");
  const [showAddExhibit, setShowAddExhibit] = React.useState(false);
  const [showCreateBundle, setShowCreateBundle] = React.useState(false);
  const [editingExhibit, setEditingExhibit] = React.useState<Exhibit | null>(null);
  const [draggedExhibit, setDraggedExhibit] = React.useState<string | null>(null);
  const [newExhibit, setNewExhibit] = React.useState<Partial<Exhibit>>({
    documentType: "pdf",
    status: "draft",
    tags: [],
  });
  const [newBundle, setNewBundle] = React.useState<Partial<ExhibitBundle>>({
    status: "draft",
  });
  const [analyzingDocument, setAnalyzingDocument] = React.useState(false);
  const [analysisError, setAnalysisError] = React.useState<string | null>(null);
  const [selectedExhibitForAnalysis, setSelectedExhibitForAnalysis] = React.useState<Exhibit | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Load exhibits and bundles from localStorage
  // NO hardcoded data - everything is user-uploaded and AI-analyzed
  React.useEffect(() => {
    const loadFromStorage = () => {
      try {
        const storedExhibits = localStorage.getItem('legalcli_exhibits');
        const storedBundles = localStorage.getItem('legalcli_bundles');

        if (storedExhibits) {
          const parsed = JSON.parse(storedExhibits);
          // Convert date strings back to Date objects
          const exhibitsWithDates = parsed.map((e: any) => ({
            ...e,
            dateAdded: new Date(e.dateAdded),
            dateOfDocument: e.dateOfDocument ? new Date(e.dateOfDocument) : undefined,
          }));
          setExhibits(exhibitsWithDates);
        }

        if (storedBundles) {
          const parsed = JSON.parse(storedBundles);
          const bundlesWithDates = parsed.map((b: any) => ({
            ...b,
            createdAt: new Date(b.createdAt),
            updatedAt: new Date(b.updatedAt),
          }));
          setBundles(bundlesWithDates);
        }
      } catch (error) {
        console.error('Failed to load from localStorage:', error);
      }
    };

    loadFromStorage();
  }, []);

  // Save exhibits to localStorage when they change
  React.useEffect(() => {
    if (exhibits.length > 0) {
      localStorage.setItem('legalcli_exhibits', JSON.stringify(exhibits));
    }
  }, [exhibits]);

  // Save bundles to localStorage when they change
  React.useEffect(() => {
    if (bundles.length > 0) {
      localStorage.setItem('legalcli_bundles', JSON.stringify(bundles));
    }
  }, [bundles]);

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
        const pageText = textContent.items.map((item: any) => item.str).join(" ");
        fullText += pageText + "\n\n";
      }

      return fullText.trim() || `[PDF file: ${file.name} - no extractable text found. May be a scanned document.]`;
    } catch (err) {
      console.error("PDF extraction error:", err);
      return `[PDF file: ${file.name} - unable to extract text: ${err}]`;
    }
  };

  // Extract file content based on type
  const extractFileContent = async (file: File): Promise<string> => {
    const extension = file.name.split('.').pop()?.toLowerCase();
    const fileType = file.type;

    // Handle PDFs
    if (fileType === "application/pdf" || extension === "pdf") {
      return extractTextFromPDF(file);
    }

    // Handle text files
    if (fileType.startsWith("text/") || ["txt", "md", "csv"].includes(extension || "")) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target?.result as string || "");
        reader.onerror = () => reject(new Error("Failed to read file"));
        reader.readAsText(file);
      });
    }

    // Handle images - return placeholder
    if (fileType.startsWith("image/")) {
      return `[Image file: ${file.name} - visual content not extractable as text]`;
    }

    // Handle Word documents - basic extraction
    if (extension === "docx" || fileType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          // DOCX is a zip with XML inside - extract what text we can
          const content = e.target?.result as string || "";
          // Try to extract readable text from the XML
          const textMatch = content.match(/<w:t[^>]*>([^<]*)<\/w:t>/g);
          if (textMatch) {
            resolve(textMatch.map(t => t.replace(/<[^>]+>/g, '')).join(' '));
          } else {
            resolve(`[Word document: ${file.name} - for best results, save as PDF or TXT]`);
          }
        };
        reader.onerror = () => reject(new Error("Failed to read file"));
        reader.readAsText(file);
      });
    }

    // Default: try to read as text
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string || `[File: ${file.name}]`);
      reader.onerror = () => resolve(`[File: ${file.name} - unable to extract text]`);
      reader.readAsText(file);
    });
  };

  // Handle file upload with AI analysis
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Determine document type
    const extension = file.name.split('.').pop()?.toLowerCase();
    let docType: DocumentType = 'other';
    if (extension === 'pdf') docType = 'pdf';
    else if (['doc', 'docx'].includes(extension || '')) docType = 'docx';
    else if (['jpg', 'jpeg', 'png', 'gif', 'bmp'].includes(extension || '')) docType = 'image';
    else if (['xls', 'xlsx', 'csv'].includes(extension || '')) docType = 'spreadsheet';

    // Show loading state
    setAnalyzingDocument(true);
    setAnalysisError(null);

    try {
      // Extract text content from file
      const content = await extractFileContent(file);

      // Create new exhibit
      const newExhibitData: Exhibit = {
        id: Date.now().toString(),
        exhibitNumber: String.fromCharCode(65 + exhibits.length),
        title: file.name.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' '),
        documentType: docType,
        fileName: file.name,
        fileSize: file.size,
        fileContent: content,
        dateAdded: new Date(),
        tags: [],
        status: 'draft',
      };

      // Add exhibit first
      setExhibits(prev => [...prev, newExhibitData]);
      setShowAddExhibit(false);
      setSelectedExhibitForAnalysis(newExhibitData);

      // If API key is available and we have content, run AI analysis
      if (hasApiKey() && content && !content.startsWith('[')) {
        try {
          const analysis = await analyzeDocument(content.substring(0, 15000), file.name);

          // Update exhibit with AI analysis
          setExhibits(prev => prev.map(ex =>
            ex.id === newExhibitData.id
              ? {
                  ...ex,
                  aiAnalysis: analysis,
                  description: analysis.summary,
                  tags: [...ex.tags, ...analysis.legalIssues.slice(0, 3)].filter((v, i, a) => a.indexOf(v) === i),
                }
              : ex
          ));

          // Update the selected exhibit for display
          setSelectedExhibitForAnalysis(prev => prev ? {
            ...prev,
            aiAnalysis: analysis,
            description: analysis.summary,
          } : null);
        } catch (err) {
          setAnalysisError(err instanceof Error ? err.message : 'Failed to analyze document');
        }
      }
    } catch (err) {
      setAnalysisError(err instanceof Error ? err.message : 'Failed to read file');
    } finally {
      setAnalyzingDocument(false);
    }
  };


  // Run AI analysis on existing exhibit
  const runAIAnalysis = async (exhibit: Exhibit) => {
    if (!hasApiKey()) {
      setAnalysisError('Please add an API key in Settings before using AI analysis.');
      return;
    }

    if (!exhibit.fileContent) {
      setAnalysisError('No document content available for analysis.');
      return;
    }

    setAnalyzingDocument(true);
    setAnalysisError(null);
    setSelectedExhibitForAnalysis(exhibit);

    try {
      const analysis = await analyzeDocument(exhibit.fileContent.substring(0, 15000), exhibit.fileName);

      setExhibits(prev => prev.map(ex =>
        ex.id === exhibit.id
          ? {
              ...ex,
              aiAnalysis: analysis,
              description: ex.description || analysis.summary,
              tags: [...ex.tags, ...analysis.legalIssues.slice(0, 3)].filter((v, i, a) => a.indexOf(v) === i),
            }
          : ex
      ));

      setSelectedExhibitForAnalysis({ ...exhibit, aiAnalysis: analysis });
    } catch (err) {
      setAnalysisError(err instanceof Error ? err.message : 'Failed to analyze document');
    } finally {
      setAnalyzingDocument(false);
    }
  };

  // Filter exhibits
  const filteredExhibits = React.useMemo(() => {
    return exhibits.filter((e) => {
      const matchesSearch =
        e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.exhibitNumber.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesType = filterType === "all" || e.documentType === filterType;
      const matchesStatus = filterStatus === "all" || e.status === filterStatus;
      return matchesSearch && matchesType && matchesStatus;
    });
  }, [exhibits, searchQuery, filterType, filterStatus]);

  // Get exhibits for a bundle
  const getBundleExhibits = (bundle: ExhibitBundle) => {
    return bundle.exhibits.map((id) => exhibits.find((e) => e.id === id)).filter(Boolean) as Exhibit[];
  };

  // Toggle exhibit selection
  const toggleExhibitSelection = (id: string) => {
    setSelectedExhibits((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  // Add exhibit
  const addExhibit = () => {
    if (!newExhibit.title) return;

    const exhibit: Exhibit = {
      id: Date.now().toString(),
      exhibitNumber: String.fromCharCode(65 + exhibits.length), // A, B, C, etc.
      title: newExhibit.title!,
      description: newExhibit.description,
      documentType: newExhibit.documentType as DocumentType,
      fileName: newExhibit.fileName || "document.pdf",
      fileSize: 0,
      dateAdded: new Date(),
      dateOfDocument: newExhibit.dateOfDocument ? new Date(newExhibit.dateOfDocument) : undefined,
      source: newExhibit.source,
      tags: newExhibit.tags || [],
      status: newExhibit.status as ExhibitStatus,
      notes: newExhibit.notes,
    };

    setExhibits((prev) => [...prev, exhibit]);
    setShowAddExhibit(false);
    setNewExhibit({
      documentType: "pdf",
      status: "draft",
      tags: [],
    });
  };

  // Delete exhibit
  const deleteExhibit = (id: string) => {
    setExhibits((prev) => prev.filter((e) => e.id !== id));
    // Remove from bundles too
    setBundles((prev) =>
      prev.map((b) => ({
        ...b,
        exhibits: b.exhibits.filter((eid) => eid !== id),
      }))
    );
  };

  // Create bundle
  const createBundle = () => {
    if (!newBundle.name) return;

    const bundle: ExhibitBundle = {
      id: Date.now().toString(),
      name: newBundle.name,
      description: newBundle.description,
      exhibits: Array.from(selectedExhibits),
      createdAt: new Date(),
      updatedAt: new Date(),
      status: "draft",
    };

    setBundles((prev) => [...prev, bundle]);
    setShowCreateBundle(false);
    setSelectedExhibits(new Set());
    setNewBundle({ status: "draft" });
  };

  // Reorder exhibits in bundle
  const reorderBundleExhibits = (bundleId: string, newOrder: string[]) => {
    setBundles((prev) =>
      prev.map((b) =>
        b.id === bundleId ? { ...b, exhibits: newOrder, updatedAt: new Date() } : b
      )
    );
  };

  // Render all exhibits view
  const renderAllExhibitsView = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-neutral-900">Evidence Manager</h1>
          <p className="text-neutral-500 mt-1">
            Organize your exhibits and create bundles for court
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="secondary"
            onClick={() => setShowCreateBundle(true)}
            disabled={selectedExhibits.size === 0}
            icon={<FolderPlus className="w-4 h-4" />}
          >
            Create Bundle ({selectedExhibits.size})
          </Button>
          <Button
            variant="primary"
            onClick={() => setShowAddExhibit(true)}
            icon={<Plus className="w-4 h-4" />}
          >
            Add Exhibit
          </Button>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <SearchInput
            placeholder="Search exhibits..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onClear={() => setSearchQuery("")}
          />
        </div>
        <div className="flex gap-2">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as DocumentType | "all")}
            className="px-3 py-2 rounded-lg border border-neutral-200 text-sm"
          >
            <option value="all">All Types</option>
            <option value="pdf">PDF</option>
            <option value="docx">Word Doc</option>
            <option value="image">Image</option>
            <option value="spreadsheet">Spreadsheet</option>
          </select>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as ExhibitStatus | "all")}
            className="px-3 py-2 rounded-lg border border-neutral-200 text-sm"
          >
            <option value="all">All Status</option>
            <option value="draft">Draft</option>
            <option value="ready">Ready</option>
            <option value="filed">Filed</option>
            <option value="admitted">Admitted</option>
          </select>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-neutral-200">
        <button
          onClick={() => setView("all")}
          className={cn(
            "px-4 py-2 text-sm font-medium border-b-2 transition-colors -mb-px",
            view === "all"
              ? "border-primary-500 text-primary-700"
              : "border-transparent text-neutral-500 hover:text-neutral-700"
          )}
        >
          All Exhibits ({exhibits.length})
        </button>
        <button
          onClick={() => setView("bundles")}
          className={cn(
            "px-4 py-2 text-sm font-medium border-b-2 transition-colors -mb-px",
            view === "bundles"
              ? "border-primary-500 text-primary-700"
              : "border-transparent text-neutral-500 hover:text-neutral-700"
          )}
        >
          Bundles ({bundles.length})
        </button>
      </div>

      {/* Exhibits Grid/List */}
      {view === "all" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredExhibits.map((exhibit) => (
            <ExhibitCard
              key={exhibit.id}
              exhibit={exhibit}
              selected={selectedExhibits.has(exhibit.id)}
              onSelect={() => toggleExhibitSelection(exhibit.id)}
              onEdit={() => setEditingExhibit(exhibit)}
              onDelete={() => deleteExhibit(exhibit.id)}
              onView={() => onAction?.("view-exhibit", exhibit)}
            />
          ))}
        </div>
      )}

      {/* Bundles View */}
      {view === "bundles" && (
        <div className="space-y-4">
          {bundles.map((bundle) => (
            <BundleCard
              key={bundle.id}
              bundle={bundle}
              exhibits={getBundleExhibits(bundle)}
              onSelect={() => setSelectedBundle(bundle)}
              onExport={() => onAction?.("export-bundle", bundle)}
              onEdit={() => onAction?.("edit-bundle", bundle)}
            />
          ))}

          {bundles.length === 0 && (
            <div className="text-center py-12">
              <FolderOpen className="w-12 h-12 text-neutral-300 mx-auto mb-4" />
              <p className="text-neutral-500">No bundles created yet</p>
              <p className="text-sm text-neutral-400 mt-1">
                Select exhibits and click "Create Bundle" to get started
              </p>
            </div>
          )}
        </div>
      )}

      {filteredExhibits.length === 0 && view === "all" && (
        <div className="text-center py-12">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary-100 to-indigo-100 flex items-center justify-center mx-auto mb-6">
            <Upload className="w-10 h-10 text-primary-600" />
          </div>
          <h3 className="text-xl font-semibold text-neutral-900 mb-2">No exhibits yet</h3>
          <p className="text-neutral-500 max-w-md mx-auto">
            Upload your legal documents and our AI will automatically analyze them,
            extract key information, identify parties, dates, and legal issues.
          </p>
          <div className="flex justify-center gap-3 mt-6">
            <Button
              variant="primary"
              onClick={() => setShowAddExhibit(true)}
              icon={<Plus className="w-4 h-4" />}
            >
              Upload Documents
            </Button>
          </div>
          {!hasApiKey() && (
            <p className="text-sm text-amber-600 mt-4">
              <AlertCircle className="w-4 h-4 inline mr-1" />
              Add your AI API key in Settings to enable document analysis
            </p>
          )}
        </div>
      )}
    </div>
  );

  // Add exhibit modal
  const renderAddExhibitModal = () => (
    <AnimatePresence>
      {(showAddExhibit || editingExhibit) && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => {
            setShowAddExhibit(false);
            setEditingExhibit(null);
          }}
        >
          <motion.div
            initial={{ scale: 0.95, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, y: 20 }}
            className="bg-white rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-neutral-900">
                  {editingExhibit ? "Edit Exhibit" : "Add Exhibit"}
                </h2>
                <button
                  onClick={() => {
                    setShowAddExhibit(false);
                    setEditingExhibit(null);
                  }}
                  className="p-2 rounded-lg hover:bg-neutral-100"
                >
                  <X className="w-5 h-5 text-neutral-400" />
                </button>
              </div>

              <div className="space-y-4">
                {/* Hidden file input */}
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  className="hidden"
                  accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.gif,.xls,.xlsx,.csv"
                />

                {/* Upload area */}
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-neutral-200 rounded-lg p-6 text-center hover:border-primary-300 hover:bg-primary-50/50 transition-colors cursor-pointer"
                >
                  <Upload className="w-8 h-8 text-neutral-400 mx-auto mb-2" />
                  <p className="text-sm text-neutral-600">
                    Click to upload a file for AI analysis
                  </p>
                  <p className="text-xs text-neutral-400 mt-1">
                    PDF, DOCX, TXT, images, spreadsheets supported
                  </p>
                  {hasApiKey() && (
                    <div className="flex items-center justify-center gap-1 mt-2 text-xs text-primary-600">
                      <Sparkles className="w-3 h-3" />
                      <span>AI will automatically analyze your document</span>
                    </div>
                  )}
                </div>

                <Input
                  label="Exhibit Number"
                  placeholder="e.g., A, B, C or 1, 2, 3"
                  value={editingExhibit?.exhibitNumber || newExhibit.exhibitNumber || ""}
                  onChange={(e) =>
                    editingExhibit
                      ? setEditingExhibit({ ...editingExhibit, exhibitNumber: e.target.value })
                      : setNewExhibit({ ...newExhibit, exhibitNumber: e.target.value })
                  }
                />

                <Input
                  label="Title"
                  placeholder="e.g., Investment Agreement"
                  value={editingExhibit?.title || newExhibit.title || ""}
                  onChange={(e) =>
                    editingExhibit
                      ? setEditingExhibit({ ...editingExhibit, title: e.target.value })
                      : setNewExhibit({ ...newExhibit, title: e.target.value })
                  }
                />

                <TextArea
                  label="Description"
                  placeholder="What is this document and why is it relevant?"
                  rows={2}
                  value={editingExhibit?.description || newExhibit.description || ""}
                  onChange={(e) =>
                    editingExhibit
                      ? setEditingExhibit({ ...editingExhibit, description: e.target.value })
                      : setNewExhibit({ ...newExhibit, description: e.target.value })
                  }
                />

                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Date of Document"
                    type="date"
                    value={
                      editingExhibit?.dateOfDocument
                        ? editingExhibit.dateOfDocument.toISOString().split("T")[0]
                        : newExhibit.dateOfDocument instanceof Date
                        ? newExhibit.dateOfDocument.toISOString().split("T")[0]
                        : ""
                    }
                    onChange={(e) =>
                      editingExhibit
                        ? setEditingExhibit({
                            ...editingExhibit,
                            dateOfDocument: new Date(e.target.value),
                          })
                        : setNewExhibit({ ...newExhibit, dateOfDocument: new Date(e.target.value) })
                    }
                  />
                  <Input
                    label="Source"
                    placeholder="e.g., Defendant's records"
                    value={editingExhibit?.source || newExhibit.source || ""}
                    onChange={(e) =>
                      editingExhibit
                        ? setEditingExhibit({ ...editingExhibit, source: e.target.value })
                        : setNewExhibit({ ...newExhibit, source: e.target.value })
                    }
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Status
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {[
                      { value: "draft", label: "Draft" },
                      { value: "ready", label: "Ready" },
                      { value: "filed", label: "Filed" },
                      { value: "admitted", label: "Admitted" },
                    ].map((status) => (
                      <button
                        key={status.value}
                        onClick={() =>
                          editingExhibit
                            ? setEditingExhibit({
                                ...editingExhibit,
                                status: status.value as ExhibitStatus,
                              })
                            : setNewExhibit({
                                ...newExhibit,
                                status: status.value as ExhibitStatus,
                              })
                        }
                        className={cn(
                          "p-2 rounded-lg border text-sm font-medium transition-colors",
                          (editingExhibit?.status || newExhibit.status) === status.value
                            ? "border-primary-500 bg-primary-50 text-primary-700"
                            : "border-neutral-200 hover:border-neutral-300 text-neutral-600"
                        )}
                      >
                        {status.label}
                      </button>
                    ))}
                  </div>
                </div>

                <TextArea
                  label="Notes (optional)"
                  placeholder="Any notes about this exhibit..."
                  rows={2}
                  value={editingExhibit?.notes || newExhibit.notes || ""}
                  onChange={(e) =>
                    editingExhibit
                      ? setEditingExhibit({ ...editingExhibit, notes: e.target.value })
                      : setNewExhibit({ ...newExhibit, notes: e.target.value })
                  }
                />
              </div>

              <div className="flex gap-2 mt-6">
                <Button
                  variant="ghost"
                  className="flex-1"
                  onClick={() => {
                    setShowAddExhibit(false);
                    setEditingExhibit(null);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  className="flex-1"
                  onClick={() => {
                    if (editingExhibit) {
                      setExhibits((prev) =>
                        prev.map((e) => (e.id === editingExhibit.id ? editingExhibit : e))
                      );
                      setEditingExhibit(null);
                    } else {
                      addExhibit();
                    }
                  }}
                >
                  {editingExhibit ? "Save Changes" : "Add Exhibit"}
                </Button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  // Create bundle modal
  const renderCreateBundleModal = () => (
    <AnimatePresence>
      {showCreateBundle && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setShowCreateBundle(false)}
        >
          <motion.div
            initial={{ scale: 0.95, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, y: 20 }}
            className="bg-white rounded-xl shadow-xl max-w-lg w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-neutral-900">Create Bundle</h2>
                <button
                  onClick={() => setShowCreateBundle(false)}
                  className="p-2 rounded-lg hover:bg-neutral-100"
                >
                  <X className="w-5 h-5 text-neutral-400" />
                </button>
              </div>

              <div className="space-y-4">
                <Input
                  label="Bundle Name"
                  placeholder="e.g., Trial Bundle, Hearing Bundle"
                  value={newBundle.name || ""}
                  onChange={(e) => setNewBundle({ ...newBundle, name: e.target.value })}
                />

                <TextArea
                  label="Description (optional)"
                  placeholder="What is this bundle for?"
                  rows={2}
                  value={newBundle.description || ""}
                  onChange={(e) => setNewBundle({ ...newBundle, description: e.target.value })}
                />

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Selected Exhibits ({selectedExhibits.size})
                  </label>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {Array.from(selectedExhibits).map((id) => {
                      const exhibit = exhibits.find((e) => e.id === id);
                      if (!exhibit) return null;
                      return (
                        <div
                          key={id}
                          className="flex items-center gap-2 p-2 bg-neutral-50 rounded-lg"
                        >
                          {getDocumentIcon(exhibit.documentType)}
                          <span className="text-sm font-medium">{exhibit.exhibitNumber}</span>
                          <span className="text-sm text-neutral-500 flex-1 truncate">
                            {exhibit.title}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="flex gap-2 mt-6">
                <Button variant="ghost" className="flex-1" onClick={() => setShowCreateBundle(false)}>
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  className="flex-1"
                  onClick={createBundle}
                  disabled={!newBundle.name}
                >
                  Create Bundle
                </Button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  // Render AI Analysis Panel
  const renderAnalysisPanel = () => (
    <AnimatePresence>
      {(selectedExhibitForAnalysis || analyzingDocument) && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => {
            setSelectedExhibitForAnalysis(null);
            setAnalysisError(null);
          }}
        >
          <motion.div
            initial={{ scale: 0.95, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, y: 20 }}
            className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary-500 to-indigo-600 flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-neutral-900">AI Document Analysis</h2>
                    <p className="text-sm text-neutral-500">
                      {selectedExhibitForAnalysis?.fileName || 'Analyzing document...'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setSelectedExhibitForAnalysis(null);
                    setAnalysisError(null);
                  }}
                  className="p-2 rounded-lg hover:bg-neutral-100"
                >
                  <X className="w-5 h-5 text-neutral-400" />
                </button>
              </div>

              {analyzingDocument && (
                <div className="py-12 text-center">
                  <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto mb-4" />
                  <p className="text-neutral-600 font-medium">Analyzing your document...</p>
                  <p className="text-sm text-neutral-400 mt-1">
                    Our AI is extracting key information, parties, dates, and legal issues
                  </p>
                </div>
              )}

              {analysisError && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg mb-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-red-800">Analysis Error</p>
                      <p className="text-sm text-red-700 mt-1">{analysisError}</p>
                    </div>
                  </div>
                </div>
              )}

              {selectedExhibitForAnalysis?.aiAnalysis && !analyzingDocument && (
                <div className="space-y-6">
                  {/* Summary */}
                  <div>
                    <h3 className="text-sm font-medium text-neutral-500 uppercase tracking-wider mb-2">
                      Summary
                    </h3>
                    <p className="text-neutral-900 bg-neutral-50 p-3 rounded-lg">
                      {selectedExhibitForAnalysis.aiAnalysis.summary}
                    </p>
                  </div>

                  {/* Document Type */}
                  <div className="flex items-center gap-4">
                    <div>
                      <h3 className="text-sm font-medium text-neutral-500 uppercase tracking-wider mb-2">
                        Document Type
                      </h3>
                      <Badge variant="info" size="sm">
                        {selectedExhibitForAnalysis.aiAnalysis.documentType}
                      </Badge>
                    </div>
                  </div>

                  {/* Key Points */}
                  {selectedExhibitForAnalysis.aiAnalysis.keyPoints.length > 0 && (
                    <div>
                      <h3 className="text-sm font-medium text-neutral-500 uppercase tracking-wider mb-2">
                        Key Points
                      </h3>
                      <ul className="space-y-2">
                        {selectedExhibitForAnalysis.aiAnalysis.keyPoints.map((point, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-neutral-700">
                            <CheckCircle2 className="w-4 h-4 text-primary-600 flex-shrink-0 mt-0.5" />
                            {point}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Parties */}
                  {selectedExhibitForAnalysis.aiAnalysis.parties.length > 0 && (
                    <div>
                      <h3 className="text-sm font-medium text-neutral-500 uppercase tracking-wider mb-2">
                        Parties Identified
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {selectedExhibitForAnalysis.aiAnalysis.parties.map((party, i) => (
                          <Badge key={i} variant="default" size="sm">{party}</Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Important Dates */}
                  {selectedExhibitForAnalysis.aiAnalysis.dates.length > 0 && (
                    <div>
                      <h3 className="text-sm font-medium text-neutral-500 uppercase tracking-wider mb-2">
                        Important Dates
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {selectedExhibitForAnalysis.aiAnalysis.dates.map((date, i) => (
                          <Badge key={i} variant="warning" size="sm">
                            <Calendar className="w-3 h-3 mr-1" />
                            {date}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Legal Issues */}
                  {selectedExhibitForAnalysis.aiAnalysis.legalIssues.length > 0 && (
                    <div>
                      <h3 className="text-sm font-medium text-neutral-500 uppercase tracking-wider mb-2">
                        Legal Issues
                      </h3>
                      <ul className="space-y-2">
                        {selectedExhibitForAnalysis.aiAnalysis.legalIssues.map((issue, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-neutral-700">
                            <AlertCircle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                            {issue}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Suggested Actions */}
                  {selectedExhibitForAnalysis.aiAnalysis.suggestedActions.length > 0 && (
                    <div>
                      <h3 className="text-sm font-medium text-neutral-500 uppercase tracking-wider mb-2">
                        Suggested Actions
                      </h3>
                      <ul className="space-y-2">
                        {selectedExhibitForAnalysis.aiAnalysis.suggestedActions.map((action, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-neutral-700 bg-primary-50 p-2 rounded-lg">
                            <Sparkles className="w-4 h-4 text-primary-600 flex-shrink-0 mt-0.5" />
                            {action}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              <div className="flex gap-2 mt-6 pt-4 border-t border-neutral-100">
                <Button
                  variant="ghost"
                  className="flex-1"
                  onClick={() => {
                    setSelectedExhibitForAnalysis(null);
                    setAnalysisError(null);
                  }}
                >
                  Close
                </Button>
                {selectedExhibitForAnalysis && !analyzingDocument && (
                  <Button
                    variant="primary"
                    className="flex-1"
                    onClick={() => setSelectedExhibitForAnalysis(null)}
                  >
                    Done
                  </Button>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {renderAllExhibitsView()}
      {renderAddExhibitModal()}
      {renderCreateBundleModal()}
      {renderAnalysisPanel()}
    </div>
  );
};

// Exhibit Card Component
interface ExhibitCardProps {
  exhibit: Exhibit;
  selected: boolean;
  onSelect: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onView: () => void;
}

const ExhibitCard: React.FC<ExhibitCardProps> = ({
  exhibit,
  selected,
  onSelect,
  onEdit,
  onDelete,
  onView,
}) => {
  const statusColors = {
    draft: "neutral",
    ready: "success",
    filed: "info",
    admitted: "primary",
  };

  return (
    <motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }}>
      <Card
        variant="interactive"
        className={cn(
          "transition-all",
          selected && "ring-2 ring-primary-500 bg-primary-50/30"
        )}
      >
        <div className="p-4">
          <div className="flex items-start gap-3">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onSelect();
              }}
              className={cn(
                "w-6 h-6 rounded border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors",
                selected
                  ? "border-primary-500 bg-primary-500 text-white"
                  : "border-neutral-300 hover:border-neutral-400"
              )}
            >
              {selected && <CheckCircle2 className="w-4 h-4" />}
            </button>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <Badge variant="default" size="sm" className="font-mono">
                  {exhibit.exhibitNumber}
                </Badge>
                {getDocumentIcon(exhibit.documentType)}
                <Badge
                  variant={statusColors[exhibit.status] as any}
                  size="sm"
                >
                  {exhibit.status}
                </Badge>
              </div>

              <h3 className="font-medium text-neutral-900 truncate" onClick={onView}>
                {exhibit.title}
              </h3>

              {exhibit.description && (
                <p className="text-sm text-neutral-500 mt-1 line-clamp-2">
                  {exhibit.description}
                </p>
              )}

              <div className="flex items-center gap-3 mt-2 text-xs text-neutral-400">
                <span>{exhibit.fileName}</span>
                <span>•</span>
                <span>{formatFileSize(exhibit.fileSize)}</span>
                {exhibit.dateOfDocument && (
                  <>
                    <span>•</span>
                    <span>
                      {exhibit.dateOfDocument.toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                  </>
                )}
              </div>

              {exhibit.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {exhibit.tags.map((tag) => (
                    <Badge key={tag} variant="default" size="sm">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            <div className="flex flex-col gap-1">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onView();
                }}
                className="p-1.5 rounded-lg hover:bg-neutral-100 text-neutral-400 hover:text-neutral-600"
              >
                <Eye className="w-4 h-4" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit();
                }}
                className="p-1.5 rounded-lg hover:bg-neutral-100 text-neutral-400 hover:text-neutral-600"
              >
                <Edit2 className="w-4 h-4" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete();
                }}
                className="p-1.5 rounded-lg hover:bg-red-100 text-neutral-400 hover:text-red-600"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
};

// Bundle Card Component
interface BundleCardProps {
  bundle: ExhibitBundle;
  exhibits: Exhibit[];
  onSelect: () => void;
  onExport: () => void;
  onEdit: () => void;
}

const BundleCard: React.FC<BundleCardProps> = ({
  bundle,
  exhibits,
  onSelect,
  onExport,
  onEdit,
}) => {
  const [expanded, setExpanded] = React.useState(false);

  return (
    <Card variant="interactive" onClick={() => setExpanded(!expanded)}>
      <div className="p-4">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-lg bg-primary-100 text-primary-600 flex items-center justify-center flex-shrink-0">
            <FolderOpen className="w-6 h-6" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-medium text-neutral-900">{bundle.name}</h3>
              <Badge
                variant={bundle.status === "finalized" ? "success" : "default"}
                size="sm"
              >
                {bundle.status}
              </Badge>
            </div>

            {bundle.description && (
              <p className="text-sm text-neutral-500">{bundle.description}</p>
            )}

            <div className="flex items-center gap-4 mt-2 text-sm text-neutral-400">
              <span>{exhibits.length} exhibits</span>
              {bundle.totalPages && <span>{bundle.totalPages} pages</span>}
              <span>
                Updated {bundle.updatedAt.toLocaleDateString("en-GB")}
              </span>
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onExport();
              }}
              icon={<Download className="w-4 h-4" />}
            >
              Export
            </Button>
            <ChevronDown
              className={cn(
                "w-5 h-5 text-neutral-400 transition-transform",
                expanded && "rotate-180"
              )}
            />
          </div>
        </div>

        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="mt-4 pt-4 border-t border-neutral-100 space-y-2">
                {exhibits.map((exhibit, index) => (
                  <div
                    key={exhibit.id}
                    className="flex items-center gap-3 p-2 bg-neutral-50 rounded-lg"
                  >
                    <GripVertical className="w-4 h-4 text-neutral-300" />
                    <Badge variant="default" size="sm" className="font-mono">
                      {exhibit.exhibitNumber}
                    </Badge>
                    {getDocumentIcon(exhibit.documentType)}
                    <span className="text-sm flex-1 truncate">{exhibit.title}</span>
                    {exhibit.pageStart && exhibit.pageEnd && (
                      <span className="text-xs text-neutral-400">
                        pp. {exhibit.pageStart}-{exhibit.pageEnd}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Card>
  );
};
