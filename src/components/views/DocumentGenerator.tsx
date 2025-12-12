"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText,
  Scale,
  Building2,
  ChevronRight,
  ChevronDown,
  Check,
  Plus,
  Download,
  Copy,
  Edit2,
  Trash2,
  Search,
  Filter,
  Clock,
  AlertCircle,
  Info,
  Sparkles,
  FileEdit,
  Wand2,
  CheckCircle2,
  Globe,
  BookOpen,
  GripVertical,
  Eye,
  Save,
  X,
} from "lucide-react";
import { Card, CardHeader, CardContent } from "../ui/Card";
import { Button } from "../ui/Button";
import { Input, SearchInput, TextArea } from "../ui/Input";
import { Badge, StatusBadge } from "../ui/Badge";
import { cn } from "@/lib/utils";

// Types
type Jurisdiction = "hk" | "uk" | "us" | "au" | "sg" | "other";
type DocumentCategory = "pleadings" | "applications" | "affidavits" | "skeleton" | "correspondence" | "other";

interface DocumentTemplate {
  id: string;
  name: string;
  category: DocumentCategory;
  jurisdiction: Jurisdiction;
  description: string;
  courtRule?: string;
  sections: TemplateSection[];
  requiredFields: string[];
  tips: string[];
  estimatedTime: string;
  difficulty: "easy" | "medium" | "hard";
}

interface TemplateSection {
  id: string;
  title: string;
  description: string;
  placeholder: string;
  required: boolean;
  aiAssisted?: boolean;
  type: "text" | "textarea" | "date" | "select" | "parties" | "facts";
  options?: string[];
}

interface GeneratedDocument {
  id: string;
  templateId: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  status: "draft" | "review" | "ready" | "filed";
  content: Record<string, string>;
}

// Document templates by jurisdiction
const documentTemplates: DocumentTemplate[] = [
  // Hong Kong Templates
  {
    id: "hk-affirmation",
    name: "Affirmation / Affidavit",
    category: "affidavits",
    jurisdiction: "hk",
    description: "Sworn statement of facts for Hong Kong courts",
    courtRule: "O.41 RHC",
    sections: [
      {
        id: "deponent",
        title: "Deponent Information",
        description: "Your personal details as the person making the affirmation",
        placeholder: "Full name, address, occupation",
        required: true,
        type: "text",
      },
      {
        id: "capacity",
        title: "Capacity",
        description: "In what capacity you are making this statement",
        placeholder: "e.g., 'the Defendant in this action', 'a director of the 1st Defendant'",
        required: true,
        type: "text",
      },
      {
        id: "purpose",
        title: "Purpose of Affirmation",
        description: "What application or proceeding this supports",
        placeholder: "e.g., 'in support of the Defendant's Summons dated [date]'",
        required: true,
        type: "textarea",
      },
      {
        id: "facts",
        title: "Statement of Facts",
        description: "The facts you are affirming (each numbered paragraph)",
        placeholder: "Enter each fact on a new line. Number them 1, 2, 3...",
        required: true,
        type: "facts",
        aiAssisted: true,
      },
      {
        id: "belief",
        title: "Belief Statement",
        description: "Any matters stated on information and belief",
        placeholder: "State the source of information for matters not within your direct knowledge",
        required: false,
        type: "textarea",
      },
      {
        id: "exhibits",
        title: "Exhibits",
        description: "List of documents exhibited to this affirmation",
        placeholder: "List each exhibit (e.g., 'Exhibit ML-1: Investment Agreement dated...')",
        required: false,
        type: "textarea",
      },
    ],
    requiredFields: ["deponent", "capacity", "purpose", "facts"],
    tips: [
      "State facts in the first person ('I am...', 'I believe...')",
      "Number each paragraph consecutively",
      "Clearly identify facts within your personal knowledge vs. information and belief",
      "Exhibit documents you refer to and mark them clearly",
      "Keep paragraphs focused on single facts where possible",
    ],
    estimatedTime: "30-60 mins",
    difficulty: "medium",
  },
  {
    id: "hk-skeleton",
    name: "Skeleton Argument",
    category: "skeleton",
    jurisdiction: "hk",
    description: "Written submissions for Hong Kong court hearings",
    courtRule: "Practice Direction",
    sections: [
      {
        id: "introduction",
        title: "Introduction",
        description: "Brief overview of the application and your position",
        placeholder: "State what application this skeleton supports and your client's position",
        required: true,
        type: "textarea",
        aiAssisted: true,
      },
      {
        id: "background",
        title: "Background Facts",
        description: "Relevant factual background (keep brief)",
        placeholder: "Key facts only - refer to evidence for full details",
        required: true,
        type: "textarea",
      },
      {
        id: "issues",
        title: "Issues",
        description: "The legal issues for determination",
        placeholder: "List each issue to be decided",
        required: true,
        type: "textarea",
      },
      {
        id: "submissions",
        title: "Legal Submissions",
        description: "Your legal arguments with authorities",
        placeholder: "Set out your arguments under numbered headings",
        required: true,
        type: "textarea",
        aiAssisted: true,
      },
      {
        id: "authorities",
        title: "List of Authorities",
        description: "Cases and statutes you rely on",
        placeholder: "List all authorities cited",
        required: true,
        type: "textarea",
      },
      {
        id: "relief",
        title: "Relief Sought",
        description: "What orders you are asking for",
        placeholder: "State the specific orders sought",
        required: true,
        type: "textarea",
      },
    ],
    requiredFields: ["introduction", "issues", "submissions", "relief"],
    tips: [
      "Keep it concise - aim for clarity over length",
      "Structure arguments under clear headings",
      "Cite authorities with full references",
      "Focus on the legal test and how facts meet it",
      "Number paragraphs consecutively throughout",
    ],
    estimatedTime: "2-4 hours",
    difficulty: "hard",
  },
  {
    id: "hk-summons",
    name: "Summons",
    category: "applications",
    jurisdiction: "hk",
    description: "Application to court for interlocutory relief",
    courtRule: "O.32 RHC",
    sections: [
      {
        id: "relief",
        title: "Relief Sought",
        description: "The orders you are applying for",
        placeholder: "List each order sought numbered (1), (2), etc.",
        required: true,
        type: "textarea",
      },
      {
        id: "grounds",
        title: "Grounds",
        description: "Brief statement of grounds for the application",
        placeholder: "The grounds on which this application is made",
        required: true,
        type: "textarea",
        aiAssisted: true,
      },
      {
        id: "evidence",
        title: "Supporting Evidence",
        description: "Affirmation/affidavit evidence in support",
        placeholder: "e.g., 'The Affirmation of [Name] dated [date]'",
        required: true,
        type: "text",
      },
      {
        id: "costs",
        title: "Costs",
        description: "What costs order you seek",
        placeholder: "e.g., 'Costs in the cause' or 'Costs to the Applicant'",
        required: true,
        type: "select",
        options: ["Costs in the cause", "Costs to the Applicant", "Costs reserved", "No order as to costs"],
      },
    ],
    requiredFields: ["relief", "grounds", "evidence", "costs"],
    tips: [
      "Be specific about the orders sought",
      "Keep grounds brief - detail goes in the affirmation",
      "Ensure affirmation evidence is prepared",
      "Consider costs implications of your application",
    ],
    estimatedTime: "15-30 mins",
    difficulty: "easy",
  },
  {
    id: "hk-defence",
    name: "Defence",
    category: "pleadings",
    jurisdiction: "hk",
    description: "Defence to a civil claim in Hong Kong courts",
    courtRule: "O.18 RHC",
    sections: [
      {
        id: "admissions",
        title: "Admissions",
        description: "Paragraphs of the Statement of Claim you admit",
        placeholder: "e.g., 'Paragraphs 1, 2, and 5 of the Statement of Claim are admitted.'",
        required: true,
        type: "textarea",
      },
      {
        id: "denials",
        title: "Denials",
        description: "Paragraphs denied and your version",
        placeholder: "State what you deny and your version of events",
        required: true,
        type: "textarea",
        aiAssisted: true,
      },
      {
        id: "nonadmissions",
        title: "Non-Admissions",
        description: "Matters neither admitted nor denied",
        placeholder: "Matters you have no knowledge of",
        required: false,
        type: "textarea",
      },
      {
        id: "positive_case",
        title: "Positive Case",
        description: "Your affirmative defence or counterclaim",
        placeholder: "Your version of events and legal defences",
        required: true,
        type: "facts",
        aiAssisted: true,
      },
    ],
    requiredFields: ["admissions", "denials", "positive_case"],
    tips: [
      "Respond to each allegation in the Statement of Claim",
      "A non-admission is appropriate where you lack knowledge",
      "State your positive case clearly",
      "Consider limitation, estoppel, or other legal defences",
      "Keep factual allegations precise and provable",
    ],
    estimatedTime: "2-4 hours",
    difficulty: "hard",
  },
  {
    id: "hk-letter-court",
    name: "Letter to Court",
    category: "correspondence",
    jurisdiction: "hk",
    description: "Formal letter to the court registry",
    sections: [
      {
        id: "case_reference",
        title: "Case Reference",
        description: "The court case number",
        placeholder: "e.g., HCA 1646/2023",
        required: true,
        type: "text",
      },
      {
        id: "case_name",
        title: "Case Name",
        description: "Parties to the action",
        placeholder: "e.g., ABC Limited v. XYZ Corporation",
        required: true,
        type: "text",
      },
      {
        id: "subject",
        title: "Subject",
        description: "Purpose of the letter",
        placeholder: "e.g., Application for Extension of Time",
        required: true,
        type: "text",
      },
      {
        id: "body",
        title: "Letter Body",
        description: "The content of your letter",
        placeholder: "State your request clearly and provide any necessary explanation",
        required: true,
        type: "textarea",
      },
    ],
    requiredFields: ["case_reference", "case_name", "subject", "body"],
    tips: [
      "Be formal and respectful in tone",
      "State the case reference clearly",
      "Be concise and clear about what you are requesting",
      "Copy other parties if required by court rules",
    ],
    estimatedTime: "10-20 mins",
    difficulty: "easy",
  },
  // UK Templates
  {
    id: "uk-witness-statement",
    name: "Witness Statement",
    category: "affidavits",
    jurisdiction: "uk",
    description: "Written evidence for UK civil proceedings",
    courtRule: "CPR 32",
    sections: [
      {
        id: "witness",
        title: "Witness Details",
        description: "Your personal details",
        placeholder: "Name, address, occupation, relation to proceedings",
        required: true,
        type: "text",
      },
      {
        id: "statement",
        title: "Statement of Facts",
        description: "Your evidence set out in numbered paragraphs",
        placeholder: "Enter your evidence in numbered paragraphs",
        required: true,
        type: "facts",
        aiAssisted: true,
      },
      {
        id: "documents",
        title: "Documents Referred To",
        description: "List of documents you exhibit or refer to",
        placeholder: "Reference any documents mentioned",
        required: false,
        type: "textarea",
      },
    ],
    requiredFields: ["witness", "statement"],
    tips: [
      "State matters within your own knowledge",
      "Distinguish between fact and opinion",
      "Include statement of truth",
      "Number paragraphs consecutively",
    ],
    estimatedTime: "30-60 mins",
    difficulty: "medium",
  },
];

// Jurisdiction information
const jurisdictions: Record<Jurisdiction, { name: string; court: string; flag: string }> = {
  hk: { name: "Hong Kong", court: "High Court / District Court", flag: "HK" },
  uk: { name: "United Kingdom", court: "High Court / County Court", flag: "UK" },
  us: { name: "United States", court: "Federal / State Courts", flag: "US" },
  au: { name: "Australia", court: "Federal / State Courts", flag: "AU" },
  sg: { name: "Singapore", court: "Supreme Court / State Courts", flag: "SG" },
  other: { name: "Other", court: "Various", flag: "--" },
};

interface DocumentGeneratorProps {
  onNavigate?: (view: string) => void;
  onAction?: (action: string, data?: any) => void;
}

export const DocumentGenerator: React.FC<DocumentGeneratorProps> = ({
  onNavigate,
  onAction,
}) => {
  // State
  const [view, setView] = React.useState<"templates" | "editor" | "preview">("templates");
  const [selectedJurisdiction, setSelectedJurisdiction] = React.useState<Jurisdiction>("hk");
  const [selectedCategory, setSelectedCategory] = React.useState<DocumentCategory | "all">("all");
  const [selectedTemplate, setSelectedTemplate] = React.useState<DocumentTemplate | null>(null);
  const [documentContent, setDocumentContent] = React.useState<Record<string, string>>({});
  const [generatedDocuments, setGeneratedDocuments] = React.useState<GeneratedDocument[]>([]);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [showAiAssistant, setShowAiAssistant] = React.useState(false);
  const [aiLoading, setAiLoading] = React.useState(false);
  const [currentSection, setCurrentSection] = React.useState<string | null>(null);

  // Filter templates
  const filteredTemplates = React.useMemo(() => {
    return documentTemplates.filter((t) => {
      const matchesJurisdiction = t.jurisdiction === selectedJurisdiction;
      const matchesCategory = selectedCategory === "all" || t.category === selectedCategory;
      const matchesSearch =
        t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesJurisdiction && matchesCategory && matchesSearch;
    });
  }, [selectedJurisdiction, selectedCategory, searchQuery]);

  // Start new document
  const startDocument = (template: DocumentTemplate) => {
    setSelectedTemplate(template);
    setDocumentContent({});
    setView("editor");
  };

  // Handle AI assistance
  const requestAiHelp = async (sectionId: string) => {
    if (!selectedTemplate) return;

    setCurrentSection(sectionId);
    setAiLoading(true);
    setShowAiAssistant(true);

    // Simulate AI processing
    await new Promise((resolve) => setTimeout(resolve, 2000));

    const section = selectedTemplate.sections.find((s) => s.id === sectionId);
    if (section) {
      // Generate sample AI content based on section type
      let aiSuggestion = "";

      switch (sectionId) {
        case "facts":
          aiSuggestion = `1. I am the Defendant in this action and make this affirmation from matters within my own knowledge except where otherwise stated.

2. The facts and matters set out in this affirmation are true to the best of my knowledge, information and belief.

3. [Add your specific facts here, numbering each paragraph]

4. [For matters on information and belief, state: "I am informed by [source] and believe that..."]`;
          break;
        case "submissions":
          aiSuggestion = `Legal Framework
[Heading 1]

1. The legal test for [application type] is set out in [case name] [citation].

2. The court must consider: (a) [first factor]; (b) [second factor]; (c) [third factor].

Application to Present Facts

3. In the present case, [explain how facts meet the test].

4. [Continue with numbered paragraphs]`;
          break;
        case "denials":
          aiSuggestion = `[Format for denials]

1. Paragraph X of the Statement of Claim is denied. The Defendant's case is that [your version].

2. Paragraph Y is denied for the following reasons:
   (a) [First reason]
   (b) [Second reason]

3. As to Paragraph Z, it is denied that [specific denial]. The true position is [your version].`;
          break;
        default:
          aiSuggestion = `[AI suggestion for ${section.title}]

Based on the document type and jurisdiction, consider including:
- Key relevant facts
- Legal framework
- Supporting authorities`;
      }

      setDocumentContent((prev) => ({
        ...prev,
        [sectionId]: prev[sectionId] || aiSuggestion,
      }));
    }

    setAiLoading(false);
  };

  // Save document
  const saveDocument = () => {
    if (!selectedTemplate) return;

    const doc: GeneratedDocument = {
      id: Date.now().toString(),
      templateId: selectedTemplate.id,
      name: `${selectedTemplate.name} - ${new Date().toLocaleDateString()}`,
      createdAt: new Date(),
      updatedAt: new Date(),
      status: "draft",
      content: documentContent,
    };

    setGeneratedDocuments((prev) => [...prev, doc]);
    onAction?.("document-saved", doc);
  };

  // Generate preview
  const generatePreview = (): string => {
    if (!selectedTemplate) return "";

    let preview = "";

    // Add header based on template type
    if (selectedTemplate.category === "affidavits") {
      preview = `IN THE HIGH COURT OF THE
HONG KONG SPECIAL ADMINISTRATIVE REGION
COURT OF FIRST INSTANCE

ACTION NO. [CASE NUMBER]

BETWEEN

[PLAINTIFF]                                                          Plaintiff

and

[DEFENDANT]                                                        Defendant

────────────────────────────────────────

AFFIRMATION OF [NAME]

────────────────────────────────────────

I, ${documentContent.deponent || "[NAME]"}, of ${documentContent.deponent || "[ADDRESS]"}, ${documentContent.capacity || "[CAPACITY]"}, do solemnly and sincerely affirm and say as follows:

`;
      // Add facts
      if (documentContent.facts) {
        preview += documentContent.facts + "\n\n";
      }

      // Add exhibits
      if (documentContent.exhibits) {
        preview += "EXHIBITS\n\n" + documentContent.exhibits + "\n\n";
      }

      preview += `Affirmed at Hong Kong this [    ] day
of [    ] 20[    ]

Before me,

────────────────────────────
A Commissioner for Oaths`;
    } else if (selectedTemplate.category === "skeleton") {
      preview = `IN THE HIGH COURT OF THE
HONG KONG SPECIAL ADMINISTRATIVE REGION
COURT OF FIRST INSTANCE

ACTION NO. [CASE NUMBER]

BETWEEN

[PLAINTIFF]                                                          Plaintiff

and

[DEFENDANT]                                                        Defendant

────────────────────────────────────────

SKELETON ARGUMENT ON BEHALF OF THE [PARTY]

────────────────────────────────────────

INTRODUCTION

${documentContent.introduction || "[Introduction]"}

BACKGROUND

${documentContent.background || "[Background facts]"}

ISSUES

${documentContent.issues || "[Issues for determination]"}

SUBMISSIONS

${documentContent.submissions || "[Legal submissions]"}

AUTHORITIES

${documentContent.authorities || "[List of authorities]"}

RELIEF SOUGHT

${documentContent.relief || "[Relief sought]"}

────────────────────────────────────────

[NAME]
Litigant in Person / Counsel
[DATE]`;
    } else {
      // Generic preview
      selectedTemplate.sections.forEach((section) => {
        preview += `${section.title.toUpperCase()}\n\n`;
        preview += documentContent[section.id] || `[${section.placeholder}]`;
        preview += "\n\n";
      });
    }

    return preview;
  };

  // Render template selection
  const renderTemplateSelection = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-neutral-900">Court Document Generator</h1>
          <p className="text-neutral-500 mt-1">
            Generate court-ready documents with jurisdiction-specific templates
          </p>
        </div>
      </div>

      {/* Jurisdiction Selection */}
      <div className="flex flex-wrap gap-2">
        {Object.entries(jurisdictions).map(([key, value]) => (
          <button
            key={key}
            onClick={() => setSelectedJurisdiction(key as Jurisdiction)}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-lg border transition-all",
              selectedJurisdiction === key
                ? "border-primary-500 bg-primary-50 text-primary-700"
                : "border-neutral-200 hover:border-neutral-300 text-neutral-600"
            )}
          >
            <span className="font-mono text-xs bg-neutral-100 px-1.5 py-0.5 rounded">
              {value.flag}
            </span>
            <span className="font-medium">{value.name}</span>
          </button>
        ))}
      </div>

      {/* Category Filter and Search */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <SearchInput
            placeholder="Search templates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onClear={() => setSearchQuery("")}
          />
        </div>
        <div className="flex gap-2">
          {[
            { value: "all", label: "All" },
            { value: "pleadings", label: "Pleadings" },
            { value: "applications", label: "Applications" },
            { value: "affidavits", label: "Affidavits" },
            { value: "skeleton", label: "Skeleton" },
            { value: "correspondence", label: "Letters" },
          ].map((cat) => (
            <button
              key={cat.value}
              onClick={() => setSelectedCategory(cat.value as DocumentCategory | "all")}
              className={cn(
                "px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                selectedCategory === cat.value
                  ? "bg-primary-100 text-primary-700"
                  : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
              )}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Template Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTemplates.map((template) => (
          <TemplateCard
            key={template.id}
            template={template}
            onClick={() => startDocument(template)}
          />
        ))}

        {filteredTemplates.length === 0 && (
          <div className="col-span-full text-center py-12">
            <FileText className="w-12 h-12 text-neutral-300 mx-auto mb-4" />
            <p className="text-neutral-500">No templates found for this selection</p>
            <p className="text-sm text-neutral-400 mt-1">
              Try selecting a different jurisdiction or category
            </p>
          </div>
        )}
      </div>

      {/* Recent Documents */}
      {generatedDocuments.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-neutral-900 mb-4">Recent Documents</h2>
          <div className="space-y-2">
            {generatedDocuments.slice(0, 5).map((doc) => (
              <Card key={doc.id} variant="interactive">
                <div className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-primary-500" />
                    <div>
                      <p className="font-medium text-neutral-900">{doc.name}</p>
                      <p className="text-sm text-neutral-500">
                        Created {doc.createdAt.toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={
                        doc.status === "ready"
                          ? "success"
                          : doc.status === "review"
                          ? "warning"
                          : "default"
                      }
                      size="sm"
                    >
                      {doc.status}
                    </Badge>
                    <Button variant="ghost" size="sm" icon={<Edit2 className="w-4 h-4" />}>
                      Edit
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  // Render document editor
  const renderEditor = () => {
    if (!selectedTemplate) return null;

    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              icon={<ChevronRight className="w-4 h-4 rotate-180" />}
              onClick={() => setView("templates")}
            >
              Back
            </Button>
            <div>
              <h1 className="text-xl font-semibold text-neutral-900">{selectedTemplate.name}</h1>
              <p className="text-neutral-500 text-sm">
                {jurisdictions[selectedTemplate.jurisdiction].name} •{" "}
                {selectedTemplate.courtRule || "General"}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" onClick={() => setView("preview")} icon={<Eye className="w-4 h-4" />}>
              Preview
            </Button>
            <Button variant="primary" onClick={saveDocument} icon={<Save className="w-4 h-4" />}>
              Save Draft
            </Button>
          </div>
        </div>

        {/* Progress */}
        <div className="bg-neutral-50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-neutral-700">Document Progress</span>
            <span className="text-sm text-neutral-500">
              {Object.keys(documentContent).filter((k) => documentContent[k]).length} /{" "}
              {selectedTemplate.sections.length} sections
            </span>
          </div>
          <div className="h-2 bg-neutral-200 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-primary-500"
              initial={{ width: 0 }}
              animate={{
                width: `${
                  (Object.keys(documentContent).filter((k) => documentContent[k]).length /
                    selectedTemplate.sections.length) *
                  100
                }%`,
              }}
            />
          </div>
        </div>

        {/* Tips */}
        <Card className="bg-blue-50 border-blue-100">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-blue-900 mb-2">Tips for {selectedTemplate.name}</p>
                <ul className="space-y-1 text-sm text-blue-700">
                  {selectedTemplate.tips.map((tip, i) => (
                    <li key={i}>• {tip}</li>
                  ))}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Sections */}
        <div className="space-y-6">
          {selectedTemplate.sections.map((section, index) => (
            <Card key={section.id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium",
                        documentContent[section.id]
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-neutral-100 text-neutral-500"
                      )}
                    >
                      {documentContent[section.id] ? (
                        <CheckCircle2 className="w-5 h-5" />
                      ) : (
                        index + 1
                      )}
                    </div>
                    <div>
                      <h3 className="font-medium text-neutral-900">
                        {section.title}
                        {section.required && <span className="text-red-500 ml-1">*</span>}
                      </h3>
                      <p className="text-sm text-neutral-500">{section.description}</p>
                    </div>
                  </div>
                  {section.aiAssisted && (
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => requestAiHelp(section.id)}
                      icon={<Wand2 className="w-4 h-4" />}
                    >
                      AI Help
                    </Button>
                  )}
                </div>

                {section.type === "select" && section.options ? (
                  <select
                    value={documentContent[section.id] || ""}
                    onChange={(e) =>
                      setDocumentContent((prev) => ({
                        ...prev,
                        [section.id]: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 rounded-lg border border-neutral-200 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="">Select an option...</option>
                    {section.options.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                ) : section.type === "textarea" || section.type === "facts" ? (
                  <TextArea
                    rows={section.type === "facts" ? 10 : 4}
                    placeholder={section.placeholder}
                    value={documentContent[section.id] || ""}
                    onChange={(e) =>
                      setDocumentContent((prev) => ({
                        ...prev,
                        [section.id]: e.target.value,
                      }))
                    }
                    className="font-mono text-sm"
                  />
                ) : (
                  <Input
                    type={section.type === "date" ? "date" : "text"}
                    placeholder={section.placeholder}
                    value={documentContent[section.id] || ""}
                    onChange={(e) =>
                      setDocumentContent((prev) => ({
                        ...prev,
                        [section.id]: e.target.value,
                      }))
                    }
                  />
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  };

  // Render preview
  const renderPreview = () => {
    if (!selectedTemplate) return null;

    const previewContent = generatePreview();

    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              icon={<ChevronRight className="w-4 h-4 rotate-180" />}
              onClick={() => setView("editor")}
            >
              Back to Editor
            </Button>
            <div>
              <h1 className="text-xl font-semibold text-neutral-900">Document Preview</h1>
              <p className="text-neutral-500 text-sm">{selectedTemplate.name}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" icon={<Copy className="w-4 h-4" />}>
              Copy
            </Button>
            <Button variant="primary" icon={<Download className="w-4 h-4" />}>
              Download
            </Button>
          </div>
        </div>

        {/* Preview */}
        <Card>
          <CardContent className="p-8">
            <pre className="whitespace-pre-wrap font-mono text-sm text-neutral-700 leading-relaxed">
              {previewContent}
            </pre>
          </CardContent>
        </Card>
      </div>
    );
  };

  // AI Assistant Modal
  const renderAiAssistant = () => (
    <AnimatePresence>
      {showAiAssistant && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setShowAiAssistant(false)}
        >
          <motion.div
            initial={{ scale: 0.95, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, y: 20 }}
            className="bg-white rounded-xl shadow-xl max-w-lg w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary-500 to-indigo-600 flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-neutral-900">AI Writing Assistant</h2>
                  <p className="text-sm text-neutral-500">
                    {aiLoading ? "Generating suggestions..." : "Review and customize the suggestion"}
                  </p>
                </div>
              </div>

              {aiLoading ? (
                <div className="flex items-center justify-center py-12">
                  <motion.div
                    className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  />
                </div>
              ) : (
                <div>
                  <p className="text-sm text-neutral-600 mb-4">
                    AI has suggested content for this section. Review and customize before using.
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="primary"
                      className="flex-1"
                      onClick={() => setShowAiAssistant(false)}
                    >
                      Use Suggestion
                    </Button>
                    <Button variant="ghost" onClick={() => setShowAiAssistant(false)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <AnimatePresence mode="wait">
        {view === "templates" && renderTemplateSelection()}
        {view === "editor" && renderEditor()}
        {view === "preview" && renderPreview()}
      </AnimatePresence>
      {renderAiAssistant()}
    </div>
  );
};

// Template Card Component
interface TemplateCardProps {
  template: DocumentTemplate;
  onClick: () => void;
}

const TemplateCard: React.FC<TemplateCardProps> = ({ template, onClick }) => {
  const difficultyColors = {
    easy: "text-emerald-600 bg-emerald-50",
    medium: "text-amber-600 bg-amber-50",
    hard: "text-red-600 bg-red-50",
  };

  const categoryIcons: Record<DocumentCategory, React.ReactNode> = {
    pleadings: <FileText className="w-5 h-5" />,
    applications: <FileEdit className="w-5 h-5" />,
    affidavits: <Scale className="w-5 h-5" />,
    skeleton: <BookOpen className="w-5 h-5" />,
    correspondence: <FileText className="w-5 h-5" />,
    other: <FileText className="w-5 h-5" />,
  };

  return (
    <motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }}>
      <Card variant="interactive" onClick={onClick}>
        <CardContent className="p-5">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-lg bg-primary-100 text-primary-600 flex items-center justify-center flex-shrink-0">
              {categoryIcons[template.category]}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-neutral-900">{template.name}</h3>
              <p className="text-sm text-neutral-500 mt-1 line-clamp-2">{template.description}</p>

              <div className="flex flex-wrap items-center gap-2 mt-3">
                {template.courtRule && (
                  <Badge variant="default" size="sm">
                    {template.courtRule}
                  </Badge>
                )}
                <span
                  className={cn(
                    "text-xs px-2 py-0.5 rounded-full font-medium",
                    difficultyColors[template.difficulty]
                  )}
                >
                  {template.difficulty}
                </span>
                <span className="text-xs text-neutral-400 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {template.estimatedTime}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};
