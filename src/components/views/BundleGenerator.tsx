"use client";

import * as React from "react";
import { motion, AnimatePresence, Reorder } from "framer-motion";
import {
  FolderOpen,
  FileText,
  Plus,
  Trash2,
  Edit2,
  GripVertical,
  Download,
  Eye,
  Settings,
  Hash,
  ChevronRight,
  ChevronDown,
  Check,
  X,
  Upload,
  FileImage,
  Printer,
  BookOpen,
  List,
  Grid,
  RefreshCw,
  Copy,
  Link2,
  AlertCircle,
  Info,
  Lightbulb,
  CheckCircle2,
  Package,
  Layers,
  FileSpreadsheet,
} from "lucide-react";
import { Card, CardHeader, CardContent } from "../ui/Card";
import { Button } from "../ui/Button";
import { Input, SearchInput, TextArea } from "../ui/Input";
import { Badge } from "../ui/Badge";
import { cn } from "@/lib/utils";

// Types
interface BundleDocument {
  id: string;
  title: string;
  fileName: string;
  pageCount: number;
  dateOfDocument?: Date;
  description?: string;
  batesStart?: string;
  batesEnd?: string;
  tabNumber?: number;
  section?: string;
  exhibitRef?: string;
}

interface BundleSection {
  id: string;
  name: string;
  description?: string;
  documents: string[]; // Document IDs
  startPage?: number;
  endPage?: number;
}

interface Bundle {
  id: string;
  name: string;
  type: "trial" | "hearing" | "appeal" | "discovery" | "other";
  caseNumber: string;
  caseName?: string;
  court?: string;
  sections: BundleSection[];
  documents: BundleDocument[];
  createdAt: Date;
  updatedAt: Date;
  status: "draft" | "review" | "finalized";
  settings: BundleSettings;
  totalPages?: number;
}

interface BundleSettings {
  batesPrefix: string;
  batesStartNumber: number;
  batesDigits: number;
  includeIndex: boolean;
  includeTableOfContents: boolean;
  includeDividers: boolean;
  pageSize: "a4" | "letter";
  orientation: "portrait" | "landscape";
  headerText?: string;
  footerText?: string;
}

// Standard sections for HK bundles
const standardSections = [
  { id: "pleadings", name: "Pleadings", description: "Writ, Statement of Claim, Defence, Reply" },
  { id: "orders", name: "Court Orders & Directions", description: "All court orders made in the proceedings" },
  { id: "affirmations", name: "Witness Statements / Affirmations", description: "Sworn evidence" },
  { id: "correspondence", name: "Correspondence", description: "Letters between parties" },
  { id: "contracts", name: "Agreements & Contracts", description: "Relevant contractual documents" },
  { id: "financial", name: "Financial Documents", description: "Bank statements, invoices, accounts" },
  { id: "expert", name: "Expert Reports", description: "Expert evidence" },
  { id: "misc", name: "Miscellaneous", description: "Other relevant documents" },
];

interface BundleGeneratorProps {
  onNavigate?: (view: string) => void;
  onAction?: (action: string, data?: any) => void;
}

export const BundleGenerator: React.FC<BundleGeneratorProps> = ({
  onNavigate,
  onAction,
}) => {
  // State
  const [view, setView] = React.useState<"list" | "edit" | "preview">("list");
  const [bundles, setBundles] = React.useState<Bundle[]>([]);
  const [currentBundle, setCurrentBundle] = React.useState<Bundle | null>(null);
  const [documents, setDocuments] = React.useState<BundleDocument[]>([]);
  const [showAddDocument, setShowAddDocument] = React.useState(false);
  const [showSettings, setShowSettings] = React.useState(false);
  const [selectedSection, setSelectedSection] = React.useState<string | null>(null);
  const [newDocument, setNewDocument] = React.useState<Partial<BundleDocument>>({});

  // Sample data
  React.useEffect(() => {
    if (bundles.length === 0) {
      const sampleDocs: BundleDocument[] = [
        {
          id: "1",
          title: "Writ of Summons",
          fileName: "writ_of_summons.pdf",
          pageCount: 3,
          dateOfDocument: new Date("2023-06-15"),
          batesStart: "ML-0001",
          batesEnd: "ML-0003",
          tabNumber: 1,
          section: "pleadings",
        },
        {
          id: "2",
          title: "Statement of Claim",
          fileName: "statement_of_claim.pdf",
          pageCount: 12,
          dateOfDocument: new Date("2023-06-15"),
          batesStart: "ML-0004",
          batesEnd: "ML-0015",
          tabNumber: 2,
          section: "pleadings",
        },
        {
          id: "3",
          title: "Defence",
          fileName: "defence.pdf",
          pageCount: 15,
          dateOfDocument: new Date("2023-08-01"),
          batesStart: "ML-0016",
          batesEnd: "ML-0030",
          tabNumber: 3,
          section: "pleadings",
        },
        {
          id: "4",
          title: "Investment Agreement",
          fileName: "investment_agreement.pdf",
          pageCount: 25,
          dateOfDocument: new Date("2022-01-15"),
          batesStart: "ML-0031",
          batesEnd: "ML-0055",
          tabNumber: 4,
          section: "contracts",
          exhibitRef: "A",
        },
        {
          id: "5",
          title: "Bank Transfer Confirmation",
          fileName: "bank_transfer.pdf",
          pageCount: 2,
          dateOfDocument: new Date("2022-03-20"),
          batesStart: "ML-0056",
          batesEnd: "ML-0057",
          tabNumber: 5,
          section: "financial",
          exhibitRef: "B",
        },
        {
          id: "6",
          title: "Affirmation of Mark Lamb",
          fileName: "affirmation_ml.pdf",
          pageCount: 20,
          dateOfDocument: new Date("2024-01-10"),
          batesStart: "ML-0058",
          batesEnd: "ML-0077",
          tabNumber: 6,
          section: "affirmations",
        },
      ];

      const sampleBundle: Bundle = {
        id: "1",
        name: "Summary Judgment Bundle",
        type: "hearing",
        caseNumber: "HCA 1646/2023",
        caseName: "In the Matter of [Plaintiffs] v. Mark David Lamb & Ors",
        court: "High Court of Hong Kong",
        sections: [
          { id: "pleadings", name: "Pleadings", documents: ["1", "2", "3"], startPage: 1, endPage: 30 },
          { id: "contracts", name: "Contracts", documents: ["4"], startPage: 31, endPage: 55 },
          { id: "financial", name: "Financial", documents: ["5"], startPage: 56, endPage: 57 },
          { id: "affirmations", name: "Affirmations", documents: ["6"], startPage: 58, endPage: 77 },
        ],
        documents: sampleDocs,
        createdAt: new Date("2024-01-15"),
        updatedAt: new Date("2024-02-01"),
        status: "draft",
        settings: {
          batesPrefix: "ML",
          batesStartNumber: 1,
          batesDigits: 4,
          includeIndex: true,
          includeTableOfContents: true,
          includeDividers: true,
          pageSize: "a4",
          orientation: "portrait",
          headerText: "HCA 1646/2023",
          footerText: "Page {page} of {total}",
        },
        totalPages: 77,
      };

      setBundles([sampleBundle]);
      setDocuments(sampleDocs);
    }
  }, []);

  // Create new bundle
  const createBundle = () => {
    const newBundle: Bundle = {
      id: Date.now().toString(),
      name: "New Bundle",
      type: "hearing",
      caseNumber: "",
      sections: standardSections.map((s) => ({
        id: s.id,
        name: s.name,
        documents: [],
      })),
      documents: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      status: "draft",
      settings: {
        batesPrefix: "DOC",
        batesStartNumber: 1,
        batesDigits: 4,
        includeIndex: true,
        includeTableOfContents: true,
        includeDividers: true,
        pageSize: "a4",
        orientation: "portrait",
      },
    };

    setBundles((prev) => [...prev, newBundle]);
    setCurrentBundle(newBundle);
    setView("edit");
  };

  // Add document to bundle
  const addDocument = () => {
    if (!newDocument.title || !currentBundle) return;

    const doc: BundleDocument = {
      id: Date.now().toString(),
      title: newDocument.title,
      fileName: newDocument.fileName || "document.pdf",
      pageCount: newDocument.pageCount || 1,
      dateOfDocument: newDocument.dateOfDocument,
      description: newDocument.description,
      section: selectedSection || undefined,
      exhibitRef: newDocument.exhibitRef,
    };

    // Add to documents
    const updatedDocs = [...(currentBundle.documents || []), doc];

    // Add to section if selected
    const updatedSections = currentBundle.sections.map((s) =>
      s.id === selectedSection
        ? { ...s, documents: [...s.documents, doc.id] }
        : s
    );

    // Update bundle
    const updatedBundle = {
      ...currentBundle,
      documents: updatedDocs,
      sections: updatedSections,
      updatedAt: new Date(),
    };

    setCurrentBundle(updatedBundle);
    setBundles((prev) =>
      prev.map((b) => (b.id === updatedBundle.id ? updatedBundle : b))
    );
    setShowAddDocument(false);
    setNewDocument({});
  };

  // Regenerate Bates numbers
  const regenerateBates = () => {
    if (!currentBundle) return;

    const settings = currentBundle.settings;
    let currentNumber = settings.batesStartNumber;

    const updatedDocs = currentBundle.documents.map((doc) => {
      const batesStart = `${settings.batesPrefix}-${String(currentNumber).padStart(
        settings.batesDigits,
        "0"
      )}`;
      const batesEnd = `${settings.batesPrefix}-${String(
        currentNumber + doc.pageCount - 1
      ).padStart(settings.batesDigits, "0")}`;
      currentNumber += doc.pageCount;

      return { ...doc, batesStart, batesEnd };
    });

    const updatedBundle = {
      ...currentBundle,
      documents: updatedDocs,
      totalPages: currentNumber - settings.batesStartNumber,
      updatedAt: new Date(),
    };

    setCurrentBundle(updatedBundle);
    setBundles((prev) =>
      prev.map((b) => (b.id === updatedBundle.id ? updatedBundle : b))
    );
  };

  // Export bundle
  const exportBundle = (format: "pdf" | "excel" | "index") => {
    onAction?.("export-bundle", { bundle: currentBundle, format });
  };

  // Render bundle list
  const renderBundleList = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-neutral-900">Bundle Generator</h1>
          <p className="text-neutral-500 mt-1">
            Create court-compliant document bundles with Bates numbering
          </p>
        </div>
        <Button
          variant="primary"
          onClick={createBundle}
          icon={<Plus className="w-4 h-4" />}
        >
          New Bundle
        </Button>
      </div>

      {/* Info Card */}
      <Card className="bg-gradient-to-r from-primary-50 to-indigo-50 border-primary-100">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary-100 text-primary-600 flex items-center justify-center flex-shrink-0">
              <Package className="w-6 h-6" />
            </div>
            <div>
              <h2 className="font-semibold text-neutral-900 mb-1">Professional Court Bundles</h2>
              <p className="text-neutral-600 text-sm">
                Generate indexed, Bates-numbered bundles compliant with Hong Kong court requirements.
                Includes automatic table of contents, section dividers, and page numbering.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bundle Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {bundles.map((bundle) => (
          <Card
            key={bundle.id}
            variant="interactive"
            onClick={() => {
              setCurrentBundle(bundle);
              setView("edit");
            }}
          >
            <CardContent className="p-5">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center flex-shrink-0">
                  <FolderOpen className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-neutral-900">{bundle.name}</h3>
                    <Badge
                      variant={
                        bundle.status === "finalized"
                          ? "success"
                          : bundle.status === "review"
                          ? "warning"
                          : "default"
                      }
                      size="sm"
                    >
                      {bundle.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-neutral-500">{bundle.caseNumber}</p>
                  <div className="flex items-center gap-4 mt-3 text-xs text-neutral-400">
                    <span className="flex items-center gap-1">
                      <FileText className="w-3 h-3" />
                      {bundle.documents.length} documents
                    </span>
                    <span className="flex items-center gap-1">
                      <BookOpen className="w-3 h-3" />
                      {bundle.totalPages || 0} pages
                    </span>
                    <span>
                      Updated {bundle.updatedAt.toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-neutral-400" />
              </div>
            </CardContent>
          </Card>
        ))}

        {bundles.length === 0 && (
          <div className="col-span-full text-center py-12">
            <FolderOpen className="w-12 h-12 text-neutral-300 mx-auto mb-4" />
            <p className="text-neutral-500">No bundles created yet</p>
            <Button
              variant="secondary"
              className="mt-4"
              onClick={createBundle}
              icon={<Plus className="w-4 h-4" />}
            >
              Create Your First Bundle
            </Button>
          </div>
        )}
      </div>

      {/* Tips */}
      <Card className="bg-blue-50 border-blue-100">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Lightbulb className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-medium text-blue-900 mb-2">Bundle Best Practices</h3>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Organize documents chronologically within each section</li>
                <li>• Use clear exhibit references (A, B, C or 1, 2, 3)</li>
                <li>• Include only documents you will rely on - less is more</li>
                <li>• Ensure all pages are legible and properly oriented</li>
                <li>• Submit bundles 7 days before hearing (per Practice Direction)</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  // Render bundle editor
  const renderBundleEditor = () => {
    if (!currentBundle) return null;

    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              icon={<ChevronRight className="w-4 h-4 rotate-180" />}
              onClick={() => setView("list")}
            >
              Back
            </Button>
            <div>
              <h1 className="text-xl font-semibold text-neutral-900">{currentBundle.name}</h1>
              <p className="text-neutral-500 text-sm">{currentBundle.caseNumber}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowSettings(true)}
              icon={<Settings className="w-4 h-4" />}
            >
              Settings
            </Button>
            <Button
              variant="secondary"
              onClick={regenerateBates}
              icon={<Hash className="w-4 h-4" />}
            >
              Regenerate Bates
            </Button>
            <Button
              variant="secondary"
              onClick={() => setView("preview")}
              icon={<Eye className="w-4 h-4" />}
            >
              Preview
            </Button>
            <Button
              variant="primary"
              onClick={() => exportBundle("pdf")}
              icon={<Download className="w-4 h-4" />}
            >
              Export
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-primary-600">
                {currentBundle.documents.length}
              </div>
              <div className="text-sm text-neutral-500">Documents</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-amber-600">
                {currentBundle.totalPages || 0}
              </div>
              <div className="text-sm text-neutral-500">Total Pages</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-emerald-600">
                {currentBundle.sections.filter((s) => s.documents.length > 0).length}
              </div>
              <div className="text-sm text-neutral-500">Active Sections</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-purple-600">
                {currentBundle.settings.batesPrefix}
              </div>
              <div className="text-sm text-neutral-500">Bates Prefix</div>
            </CardContent>
          </Card>
        </div>

        {/* Sections */}
        <div className="space-y-4">
          {currentBundle.sections.map((section) => (
            <Card key={section.id}>
              <div className="flex items-center justify-between py-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-neutral-100 text-neutral-600 flex items-center justify-center">
                    <Layers className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-medium text-neutral-900">{section.name}</h3>
                    <p className="text-xs text-neutral-500">
                      {section.documents.length} documents
                      {section.startPage && section.endPage && (
                        <> • pp. {section.startPage}-{section.endPage}</>
                      )}
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSelectedSection(section.id);
                    setShowAddDocument(true);
                  }}
                  icon={<Plus className="w-4 h-4" />}
                >
                  Add
                </Button>
              </div>
              {section.documents.length > 0 && (
                <CardContent className="p-0 border-t border-neutral-100">
                  <div className="divide-y divide-neutral-50">
                    {section.documents.map((docId) => {
                      const doc = currentBundle.documents.find((d) => d.id === docId);
                      if (!doc) return null;
                      return (
                        <div
                          key={doc.id}
                          className="flex items-center gap-3 px-4 py-3 hover:bg-neutral-50"
                        >
                          <GripVertical className="w-4 h-4 text-neutral-300 cursor-grab" />
                          <div className="w-8 text-center">
                            {doc.tabNumber && (
                              <span className="text-sm font-medium text-neutral-500">
                                Tab {doc.tabNumber}
                              </span>
                            )}
                          </div>
                          <FileText className="w-4 h-4 text-neutral-400" />
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-neutral-900 truncate">
                              {doc.title}
                            </p>
                            <p className="text-xs text-neutral-500">
                              {doc.pageCount} pages
                              {doc.exhibitRef && <> • Exhibit {doc.exhibitRef}</>}
                            </p>
                          </div>
                          {doc.batesStart && doc.batesEnd && (
                            <Badge variant="default" size="sm" className="font-mono">
                              {doc.batesStart} - {doc.batesEnd}
                            </Badge>
                          )}
                          <div className="flex gap-1">
                            <button className="p-1.5 rounded-lg hover:bg-neutral-100 text-neutral-400 hover:text-neutral-600">
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button className="p-1.5 rounded-lg hover:bg-red-100 text-neutral-400 hover:text-red-600">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      </div>
    );
  };

  // Render preview
  const renderPreview = () => {
    if (!currentBundle) return null;

    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              icon={<ChevronRight className="w-4 h-4 rotate-180" />}
              onClick={() => setView("edit")}
            >
              Back to Editor
            </Button>
            <div>
              <h1 className="text-xl font-semibold text-neutral-900">Bundle Preview</h1>
              <p className="text-neutral-500 text-sm">{currentBundle.name}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="secondary"
              onClick={() => exportBundle("excel")}
              icon={<FileSpreadsheet className="w-4 h-4" />}
            >
              Export Index
            </Button>
            <Button
              variant="primary"
              onClick={() => exportBundle("pdf")}
              icon={<Download className="w-4 h-4" />}
            >
              Export PDF
            </Button>
          </div>
        </div>

        {/* Table of Contents */}
        <Card>
          <CardHeader title="Table of Contents" />
          <CardContent className="p-0">
            <div className="font-mono text-sm">
              {/* Header */}
              <div className="grid grid-cols-12 gap-2 px-4 py-2 bg-neutral-100 font-semibold text-neutral-700">
                <div className="col-span-1">Tab</div>
                <div className="col-span-5">Document</div>
                <div className="col-span-2">Date</div>
                <div className="col-span-2">Bates No.</div>
                <div className="col-span-2">Pages</div>
              </div>

              {/* Sections */}
              {currentBundle.sections
                .filter((s) => s.documents.length > 0)
                .map((section, sectionIndex) => (
                  <div key={section.id}>
                    {/* Section Header */}
                    <div className="px-4 py-2 bg-neutral-50 font-semibold text-neutral-900 border-t border-neutral-200">
                      {String.fromCharCode(65 + sectionIndex)}. {section.name}
                    </div>

                    {/* Documents */}
                    {section.documents.map((docId) => {
                      const doc = currentBundle.documents.find((d) => d.id === docId);
                      if (!doc) return null;
                      return (
                        <div
                          key={doc.id}
                          className="grid grid-cols-12 gap-2 px-4 py-2 border-t border-neutral-100 hover:bg-neutral-50"
                        >
                          <div className="col-span-1 text-neutral-500">{doc.tabNumber}</div>
                          <div className="col-span-5">
                            {doc.title}
                            {doc.exhibitRef && (
                              <span className="text-neutral-400"> [Ex. {doc.exhibitRef}]</span>
                            )}
                          </div>
                          <div className="col-span-2 text-neutral-500">
                            {doc.dateOfDocument?.toLocaleDateString("en-GB", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            })}
                          </div>
                          <div className="col-span-2 text-neutral-500">
                            {doc.batesStart}
                            {doc.batesStart !== doc.batesEnd && <> - {doc.batesEnd}</>}
                          </div>
                          <div className="col-span-2 text-neutral-500">{doc.pageCount}</div>
                        </div>
                      );
                    })}
                  </div>
                ))}

              {/* Footer */}
              <div className="px-4 py-3 bg-neutral-100 border-t border-neutral-200 font-semibold">
                <div className="flex justify-between">
                  <span>Total</span>
                  <span>{currentBundle.totalPages} pages</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Bundle Info */}
        <Card>
          <CardHeader title="Bundle Information" />
          <CardContent className="p-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-neutral-500">Case Number:</span>
                <span className="ml-2 font-medium">{currentBundle.caseNumber}</span>
              </div>
              <div>
                <span className="text-neutral-500">Court:</span>
                <span className="ml-2 font-medium">{currentBundle.court || "High Court"}</span>
              </div>
              <div>
                <span className="text-neutral-500">Bates Range:</span>
                <span className="ml-2 font-medium font-mono">
                  {currentBundle.settings.batesPrefix}-
                  {String(currentBundle.settings.batesStartNumber).padStart(
                    currentBundle.settings.batesDigits,
                    "0"
                  )}{" "}
                  to {currentBundle.settings.batesPrefix}-
                  {String(
                    currentBundle.settings.batesStartNumber +
                      (currentBundle.totalPages || 0) -
                      1
                  ).padStart(currentBundle.settings.batesDigits, "0")}
                </span>
              </div>
              <div>
                <span className="text-neutral-500">Status:</span>
                <Badge variant="default" size="sm" className="ml-2">
                  {currentBundle.status}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  // Add Document Modal
  const renderAddDocumentModal = () => (
    <AnimatePresence>
      {showAddDocument && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setShowAddDocument(false)}
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
                <h2 className="text-xl font-semibold text-neutral-900">Add Document</h2>
                <button
                  onClick={() => setShowAddDocument(false)}
                  className="p-2 rounded-lg hover:bg-neutral-100"
                >
                  <X className="w-5 h-5 text-neutral-400" />
                </button>
              </div>

              <div className="space-y-4">
                {/* Upload area */}
                <div className="border-2 border-dashed border-neutral-200 rounded-lg p-6 text-center hover:border-primary-300 hover:bg-primary-50/50 transition-colors cursor-pointer">
                  <Upload className="w-8 h-8 text-neutral-400 mx-auto mb-2" />
                  <p className="text-sm text-neutral-600">
                    Drag and drop PDF here, or click to browse
                  </p>
                </div>

                <Input
                  label="Document Title"
                  placeholder="e.g., Investment Agreement"
                  value={newDocument.title || ""}
                  onChange={(e) => setNewDocument({ ...newDocument, title: e.target.value })}
                />

                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Date of Document"
                    type="date"
                    value={
                      newDocument.dateOfDocument
                        ? newDocument.dateOfDocument.toISOString().split("T")[0]
                        : ""
                    }
                    onChange={(e) =>
                      setNewDocument({ ...newDocument, dateOfDocument: new Date(e.target.value) })
                    }
                  />
                  <Input
                    label="Page Count"
                    type="number"
                    placeholder="e.g., 10"
                    value={newDocument.pageCount?.toString() || ""}
                    onChange={(e) =>
                      setNewDocument({ ...newDocument, pageCount: parseInt(e.target.value) })
                    }
                  />
                </div>

                <Input
                  label="Exhibit Reference (optional)"
                  placeholder="e.g., A, B, C"
                  value={newDocument.exhibitRef || ""}
                  onChange={(e) => setNewDocument({ ...newDocument, exhibitRef: e.target.value })}
                />

                <TextArea
                  label="Description (optional)"
                  placeholder="Brief description of document"
                  rows={2}
                  value={newDocument.description || ""}
                  onChange={(e) => setNewDocument({ ...newDocument, description: e.target.value })}
                />
              </div>

              <div className="flex gap-2 mt-6">
                <Button
                  variant="ghost"
                  className="flex-1"
                  onClick={() => setShowAddDocument(false)}
                >
                  Cancel
                </Button>
                <Button variant="primary" className="flex-1" onClick={addDocument}>
                  Add Document
                </Button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  // Settings Modal
  const renderSettingsModal = () => (
    <AnimatePresence>
      {showSettings && currentBundle && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setShowSettings(false)}
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
                <h2 className="text-xl font-semibold text-neutral-900">Bundle Settings</h2>
                <button
                  onClick={() => setShowSettings(false)}
                  className="p-2 rounded-lg hover:bg-neutral-100"
                >
                  <X className="w-5 h-5 text-neutral-400" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Bates Prefix"
                    placeholder="e.g., ML"
                    value={currentBundle.settings.batesPrefix}
                    onChange={(e) =>
                      setCurrentBundle({
                        ...currentBundle,
                        settings: { ...currentBundle.settings, batesPrefix: e.target.value },
                      })
                    }
                  />
                  <Input
                    label="Start Number"
                    type="number"
                    value={currentBundle.settings.batesStartNumber.toString()}
                    onChange={(e) =>
                      setCurrentBundle({
                        ...currentBundle,
                        settings: {
                          ...currentBundle.settings,
                          batesStartNumber: parseInt(e.target.value) || 1,
                        },
                      })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-neutral-700">Options</label>
                  <div className="space-y-2">
                    {[
                      { key: "includeIndex", label: "Include Index Page" },
                      { key: "includeTableOfContents", label: "Include Table of Contents" },
                      { key: "includeDividers", label: "Include Section Dividers" },
                    ].map((option) => (
                      <label key={option.key} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={
                            currentBundle.settings[option.key as keyof BundleSettings] as boolean
                          }
                          onChange={(e) =>
                            setCurrentBundle({
                              ...currentBundle,
                              settings: {
                                ...currentBundle.settings,
                                [option.key]: e.target.checked,
                              },
                            })
                          }
                          className="rounded border-neutral-300 text-primary-600"
                        />
                        <span className="text-sm text-neutral-700">{option.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <Input
                  label="Header Text"
                  placeholder="e.g., HCA 1646/2023"
                  value={currentBundle.settings.headerText || ""}
                  onChange={(e) =>
                    setCurrentBundle({
                      ...currentBundle,
                      settings: { ...currentBundle.settings, headerText: e.target.value },
                    })
                  }
                />
              </div>

              <div className="flex gap-2 mt-6">
                <Button variant="ghost" className="flex-1" onClick={() => setShowSettings(false)}>
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  className="flex-1"
                  onClick={() => {
                    setBundles((prev) =>
                      prev.map((b) => (b.id === currentBundle.id ? currentBundle : b))
                    );
                    setShowSettings(false);
                  }}
                >
                  Save Settings
                </Button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <AnimatePresence mode="wait">
        {view === "list" && renderBundleList()}
        {view === "edit" && renderBundleEditor()}
        {view === "preview" && renderPreview()}
      </AnimatePresence>
      {renderAddDocumentModal()}
      {renderSettingsModal()}
    </div>
  );
};
