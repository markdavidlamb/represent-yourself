"use client";

import * as React from "react";
import { motion, AnimatePresence, Reorder } from "framer-motion";
import {
  Search,
  FileText,
  Plus,
  Trash2,
  Edit2,
  Check,
  X,
  AlertTriangle,
  AlertCircle,
  Info,
  ChevronRight,
  ChevronDown,
  Clock,
  Upload,
  Download,
  Copy,
  Eye,
  EyeOff,
  Shield,
  Lock,
  Unlock,
  HelpCircle,
  Lightbulb,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Circle,
  MessageSquare,
  FileQuestion,
  FolderOpen,
} from "lucide-react";
import { Card, CardHeader, CardContent } from "../ui/Card";
import { Button } from "../ui/Button";
import { Input, SearchInput, TextArea } from "../ui/Input";
import { Badge, StatusBadge } from "../ui/Badge";
import { cn } from "@/lib/utils";

// Types
type RequestType = "interrogatory" | "document_request" | "admission";
type ResponseType = "answer" | "objection" | "partial" | "privilege" | "not_applicable";

interface DiscoveryRequest {
  id: string;
  number: number;
  type: RequestType;
  text: string;
  responseType?: ResponseType;
  response?: string;
  objections?: string[];
  privilegeType?: string;
  documents?: string[];
  notes?: string;
  isComplete: boolean;
}

interface DiscoverySet {
  id: string;
  title: string;
  type: RequestType;
  fromParty: string;
  receivedDate: Date;
  dueDate: Date;
  requests: DiscoveryRequest[];
}

// Common objections library
const commonObjections = {
  vague: {
    label: "Vague and Ambiguous",
    text: "This request is objected to as vague, ambiguous, and unintelligible. The terms used are unclear and susceptible to multiple interpretations, making it impossible to provide a meaningful response.",
  },
  overbroad: {
    label: "Overbroad",
    text: "This request is objected to as overbroad in scope and not reasonably limited in time, subject matter, or scope. It seeks information beyond what is relevant to the claims or defenses in this action.",
  },
  unduly_burdensome: {
    label: "Unduly Burdensome",
    text: "This request is objected to as unduly burdensome and oppressive. The effort, expense, and time required to respond is disproportionate to any legitimate need for the information.",
  },
  not_relevant: {
    label: "Not Relevant",
    text: "This request is objected to as seeking information that is neither relevant to the claims or defenses in this action nor reasonably calculated to lead to the discovery of admissible evidence.",
  },
  privileged: {
    label: "Attorney-Client Privilege",
    text: "This request is objected to on the grounds that it seeks information protected by the attorney-client privilege and/or work product doctrine.",
  },
  confidential: {
    label: "Confidential/Proprietary",
    text: "This request is objected to as seeking confidential, proprietary, or trade secret information. Any response is subject to an appropriate protective order.",
  },
  compound: {
    label: "Compound Question",
    text: "This request is objected to as compound, containing multiple discrete questions that should have been presented separately.",
  },
  assumes_facts: {
    label: "Assumes Facts Not in Evidence",
    text: "This request is objected to as improperly assuming facts that have not been established and are disputed in this action.",
  },
  harassment: {
    label: "Harassment/Bad Faith",
    text: "This request is objected to as propounded for purposes of harassment and not for any legitimate purpose. It appears designed to annoy, embarrass, or oppress rather than to obtain relevant information.",
  },
};

// Privilege types
const privilegeTypes = [
  { id: "attorney_client", label: "Attorney-Client Privilege", description: "Communications with your lawyer for legal advice" },
  { id: "work_product", label: "Work Product", description: "Documents prepared in anticipation of litigation" },
  { id: "self_incrimination", label: "Self-Incrimination", description: "Fifth Amendment right against self-incrimination" },
  { id: "spousal", label: "Spousal Privilege", description: "Confidential communications between spouses" },
  { id: "medical", label: "Medical/Patient Privilege", description: "Confidential medical information" },
  { id: "trade_secret", label: "Trade Secret", description: "Proprietary business information" },
];

interface DiscoveryHelperProps {
  onNavigate?: (view: string) => void;
  onAction?: (action: string, data?: any) => void;
}

export const DiscoveryHelper: React.FC<DiscoveryHelperProps> = ({
  onNavigate,
  onAction,
}) => {
  // State
  const [view, setView] = React.useState<"list" | "respond" | "review">("list");
  const [discoverySets, setDiscoverySets] = React.useState<DiscoverySet[]>([]);
  const [activeSet, setActiveSet] = React.useState<DiscoverySet | null>(null);
  const [activeRequestIndex, setActiveRequestIndex] = React.useState(0);
  const [showObjectionPicker, setShowObjectionPicker] = React.useState(false);
  const [showPrivilegePicker, setShowPrivilegePicker] = React.useState(false);
  const [showHelp, setShowHelp] = React.useState(false);

  // Sample discovery set for demo
  React.useEffect(() => {
    if (discoverySets.length === 0) {
      setDiscoverySets([
        {
          id: "1",
          title: "First Set of Interrogatories",
          type: "interrogatory",
          fromParty: "Plaintiff",
          receivedDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          dueDate: new Date(Date.now() + 23 * 24 * 60 * 60 * 1000),
          requests: [
            {
              id: "1-1",
              number: 1,
              type: "interrogatory",
              text: "State your full legal name, all other names you have used, your date of birth, and current address.",
              isComplete: false,
            },
            {
              id: "1-2",
              number: 2,
              type: "interrogatory",
              text: "Identify all documents that support your denial of Paragraph 15 of the Statement of Claim, including the date, author, and description of each document.",
              isComplete: false,
            },
            {
              id: "1-3",
              number: 3,
              type: "interrogatory",
              text: "Describe in detail all communications between you and any third party regarding the subject matter of this litigation from January 2020 to present.",
              isComplete: false,
            },
            {
              id: "1-4",
              number: 4,
              type: "interrogatory",
              text: "State whether you have ever been a party to any other litigation and if so, identify the case name, court, case number, and outcome.",
              isComplete: false,
            },
          ],
        },
        {
          id: "2",
          title: "First Request for Production of Documents",
          type: "document_request",
          fromParty: "Plaintiff",
          receivedDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          dueDate: new Date(Date.now() + 23 * 24 * 60 * 60 * 1000),
          requests: [
            {
              id: "2-1",
              number: 1,
              type: "document_request",
              text: "All documents and communications relating to the Agreement dated 15 March 2022 referenced in Paragraph 8 of the Statement of Claim.",
              isComplete: false,
            },
            {
              id: "2-2",
              number: 2,
              type: "document_request",
              text: "All bank statements, financial records, and accounting documents from January 2020 to present that relate to the transactions at issue.",
              isComplete: false,
            },
          ],
        },
        {
          id: "3",
          title: "Request for Admissions",
          type: "admission",
          fromParty: "Plaintiff",
          receivedDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
          dueDate: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000),
          requests: [
            {
              id: "3-1",
              number: 1,
              type: "admission",
              text: "Admit that you signed the Agreement dated 15 March 2022.",
              isComplete: false,
            },
            {
              id: "3-2",
              number: 2,
              type: "admission",
              text: "Admit that you received the sum of HK$500,000 on or about 20 March 2022.",
              isComplete: false,
            },
            {
              id: "3-3",
              number: 3,
              type: "admission",
              text: "Admit that the signature appearing on Exhibit A attached hereto is your genuine signature.",
              isComplete: false,
            },
          ],
        },
      ]);
    }
  }, []);

  // Calculate days until due
  const getDaysUntilDue = (dueDate: Date) => {
    const now = new Date();
    const diff = dueDate.getTime() - now.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  // Get completion percentage
  const getCompletionPercentage = (set: DiscoverySet) => {
    const completed = set.requests.filter((r) => r.isComplete).length;
    return Math.round((completed / set.requests.length) * 100);
  };

  // Update request
  const updateRequest = (requestId: string, updates: Partial<DiscoveryRequest>) => {
    if (!activeSet) return;

    const updatedRequests = activeSet.requests.map((r) =>
      r.id === requestId ? { ...r, ...updates } : r
    );

    const updatedSet = { ...activeSet, requests: updatedRequests };
    setActiveSet(updatedSet);
    setDiscoverySets((prev) =>
      prev.map((s) => (s.id === activeSet.id ? updatedSet : s))
    );
  };

  // Add objection to current request
  const addObjection = (objectionKey: string) => {
    if (!activeSet) return;
    const request = activeSet.requests[activeRequestIndex];
    const objection = commonObjections[objectionKey as keyof typeof commonObjections];

    const currentObjections = request.objections || [];
    if (!currentObjections.includes(objection.text)) {
      updateRequest(request.id, {
        objections: [...currentObjections, objection.text],
        responseType: currentObjections.length === 0 ? "objection" : request.responseType,
      });
    }
    setShowObjectionPicker(false);
  };

  // Remove objection
  const removeObjection = (index: number) => {
    if (!activeSet) return;
    const request = activeSet.requests[activeRequestIndex];
    const newObjections = [...(request.objections || [])];
    newObjections.splice(index, 1);
    updateRequest(request.id, { objections: newObjections });
  };

  // Render list view
  const renderListView = () => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-neutral-900">Discovery Response Helper</h1>
          <p className="text-neutral-500 mt-1">
            Respond to interrogatories, document requests, and requests for admission
          </p>
        </div>
        <Button
          variant="secondary"
          onClick={() => setShowHelp(true)}
          icon={<HelpCircle className="w-4 h-4" />}
        >
          How Discovery Works
        </Button>
      </div>

      {/* Discovery Sets */}
      <div className="space-y-4">
        {discoverySets.map((set) => {
          const daysUntilDue = getDaysUntilDue(set.dueDate);
          const completion = getCompletionPercentage(set);
          const isUrgent = daysUntilDue <= 7;
          const isOverdue = daysUntilDue < 0;

          return (
            <motion.div
              key={set.id}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.99 }}
            >
              <Card
                variant="interactive"
                onClick={() => {
                  setActiveSet(set);
                  setActiveRequestIndex(0);
                  setView("respond");
                }}
              >
                <div className="p-4">
                  <div className="flex items-start gap-4">
                    <div
                      className={cn(
                        "w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0",
                        set.type === "interrogatory" && "bg-blue-100 text-blue-600",
                        set.type === "document_request" && "bg-purple-100 text-purple-600",
                        set.type === "admission" && "bg-amber-100 text-amber-600"
                      )}
                    >
                      {set.type === "interrogatory" && <MessageSquare className="w-6 h-6" />}
                      {set.type === "document_request" && <FolderOpen className="w-6 h-6" />}
                      {set.type === "admission" && <FileQuestion className="w-6 h-6" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium text-neutral-900">{set.title}</h3>
                        <Badge
                          variant={isOverdue ? "error" : isUrgent ? "warning" : "default"}
                          size="sm"
                        >
                          {isOverdue
                            ? `${Math.abs(daysUntilDue)} days overdue`
                            : `${daysUntilDue} days left`}
                        </Badge>
                      </div>
                      <p className="text-sm text-neutral-500 mt-0.5">
                        From {set.fromParty} • {set.requests.length} requests
                      </p>

                      {/* Progress bar */}
                      <div className="mt-3">
                        <div className="flex items-center justify-between text-xs text-neutral-500 mb-1">
                          <span>{set.requests.filter((r) => r.isComplete).length} of {set.requests.length} completed</span>
                          <span>{completion}%</span>
                        </div>
                        <div className="h-2 bg-neutral-100 rounded-full overflow-hidden">
                          <motion.div
                            className={cn(
                              "h-full rounded-full",
                              completion === 100
                                ? "bg-emerald-500"
                                : isUrgent
                                ? "bg-amber-500"
                                : "bg-primary-500"
                            )}
                            initial={{ width: 0 }}
                            animate={{ width: `${completion}%` }}
                          />
                        </div>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-neutral-400" />
                  </div>
                </div>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Add new set */}
      <Button
        variant="secondary"
        className="w-full"
        icon={<Plus className="w-4 h-4" />}
        onClick={() => onAction?.("add-discovery-set")}
      >
        Add Discovery Request Set
      </Button>

      {/* Help Modal */}
      <AnimatePresence>
        {showHelp && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowHelp(false)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-neutral-900">Understanding Discovery</h2>
                  <button
                    onClick={() => setShowHelp(false)}
                    className="p-2 rounded-lg hover:bg-neutral-100"
                  >
                    <X className="w-5 h-5 text-neutral-400" />
                  </button>
                </div>

                <div className="space-y-6">
                  <div>
                    <h3 className="font-medium text-neutral-900 mb-2">What is Discovery?</h3>
                    <p className="text-sm text-neutral-600">
                      Discovery is the pre-trial process where both sides exchange information
                      and evidence. It helps each party understand the other's case and prepares
                      everyone for trial. You're legally required to respond to discovery requests.
                    </p>
                  </div>

                  <div>
                    <h3 className="font-medium text-neutral-900 mb-2">Types of Discovery</h3>
                    <div className="space-y-3">
                      <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                        <MessageSquare className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="font-medium text-blue-900">Interrogatories</p>
                          <p className="text-sm text-blue-700">
                            Written questions you must answer in writing under oath.
                            Limited to a certain number (often 25-30).
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3 p-3 bg-purple-50 rounded-lg">
                        <FolderOpen className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="font-medium text-purple-900">Requests for Production</p>
                          <p className="text-sm text-purple-700">
                            Requests to provide copies of specific documents, emails,
                            photos, or other tangible evidence.
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3 p-3 bg-amber-50 rounded-lg">
                        <FileQuestion className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="font-medium text-amber-900">Requests for Admission</p>
                          <p className="text-sm text-amber-700">
                            Statements you must admit or deny. If you don't respond,
                            they're automatically admitted!
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0" />
                      <div>
                        <p className="font-medium text-amber-900">Important Deadlines</p>
                        <p className="text-sm text-amber-700">
                          You typically have 28-30 days to respond to discovery. Missing
                          deadlines can result in sanctions, your answers being deemed
                          admitted, or other penalties.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6">
                  <Button variant="primary" className="w-full" onClick={() => setShowHelp(false)}>
                    Got It
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );

  // Render respond view
  const renderRespondView = () => {
    if (!activeSet) return null;
    const request = activeSet.requests[activeRequestIndex];
    const completion = getCompletionPercentage(activeSet);

    return (
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="space-y-6"
      >
        {/* Header */}
        <div className="flex items-start gap-4">
          <Button
            variant="ghost"
            size="sm"
            icon={<ArrowLeft className="w-4 h-4" />}
            onClick={() => {
              setView("list");
              setActiveSet(null);
            }}
          >
            Back
          </Button>
          <div className="flex-1">
            <h1 className="text-xl font-semibold text-neutral-900">{activeSet.title}</h1>
            <p className="text-neutral-500 text-sm">
              From {activeSet.fromParty} • Due {activeSet.dueDate.toLocaleDateString()}
            </p>
          </div>
          <Button
            variant="primary"
            onClick={() => setView("review")}
            icon={<Eye className="w-4 h-4" />}
          >
            Review All
          </Button>
        </div>

        {/* Progress */}
        <div className="bg-white rounded-xl border border-neutral-200 p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-neutral-700">Progress</span>
            <span className="text-sm text-neutral-500">{completion}%</span>
          </div>
          <div className="h-2 bg-neutral-100 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-primary-500 rounded-full"
              animate={{ width: `${completion}%` }}
            />
          </div>
          <div className="flex gap-2 mt-3 flex-wrap">
            {activeSet.requests.map((r, i) => (
              <button
                key={r.id}
                onClick={() => setActiveRequestIndex(i)}
                className={cn(
                  "w-8 h-8 rounded-lg flex items-center justify-center text-sm font-medium transition-colors",
                  i === activeRequestIndex
                    ? "bg-primary-600 text-white"
                    : r.isComplete
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
                )}
              >
                {r.isComplete ? <Check className="w-4 h-4" /> : r.number}
              </button>
            ))}
          </div>
        </div>

        {/* Current Request */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-start gap-4 mb-6">
              <div
                className={cn(
                  "w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0",
                  request.type === "interrogatory" && "bg-blue-100 text-blue-600",
                  request.type === "document_request" && "bg-purple-100 text-purple-600",
                  request.type === "admission" && "bg-amber-100 text-amber-600"
                )}
              >
                <span className="font-medium">{request.number}</span>
              </div>
              <div className="flex-1">
                <Badge
                  variant={
                    request.type === "interrogatory"
                      ? "info"
                      : request.type === "document_request"
                      ? "primary"
                      : "warning"
                  }
                  size="sm"
                  className="mb-2"
                >
                  {request.type === "interrogatory"
                    ? "Interrogatory"
                    : request.type === "document_request"
                    ? "Document Request"
                    : "Request for Admission"}
                </Badge>
                <p className="text-neutral-900">{request.text}</p>
              </div>
            </div>

            {/* Response Type Selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                How will you respond?
              </label>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                {[
                  { type: "answer" as ResponseType, label: "Answer", icon: <Check className="w-4 h-4" />, color: "emerald" },
                  { type: "objection" as ResponseType, label: "Object", icon: <X className="w-4 h-4" />, color: "red" },
                  { type: "partial" as ResponseType, label: "Partial", icon: <Edit2 className="w-4 h-4" />, color: "amber" },
                  { type: "privilege" as ResponseType, label: "Privilege", icon: <Shield className="w-4 h-4" />, color: "purple" },
                  { type: "not_applicable" as ResponseType, label: "N/A", icon: <EyeOff className="w-4 h-4" />, color: "neutral" },
                ].map(({ type, label, icon, color }) => (
                  <button
                    key={type}
                    onClick={() => updateRequest(request.id, { responseType: type })}
                    className={cn(
                      "flex items-center justify-center gap-2 px-3 py-2 rounded-lg border-2 text-sm font-medium transition-all",
                      request.responseType === type
                        ? `border-${color}-500 bg-${color}-50 text-${color}-700`
                        : "border-neutral-200 hover:border-neutral-300 text-neutral-600"
                    )}
                    style={{
                      borderColor: request.responseType === type ? `var(--${color}-500)` : undefined,
                      backgroundColor: request.responseType === type ? `var(--${color}-50)` : undefined,
                    }}
                  >
                    {icon}
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Objections Section */}
            {(request.responseType === "objection" || request.responseType === "partial") && (
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-neutral-700">
                    Objections
                  </label>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowObjectionPicker(true)}
                    icon={<Plus className="w-4 h-4" />}
                  >
                    Add Objection
                  </Button>
                </div>
                {request.objections && request.objections.length > 0 ? (
                  <div className="space-y-2">
                    {request.objections.map((obj, i) => (
                      <div
                        key={i}
                        className="flex items-start gap-2 p-3 bg-red-50 rounded-lg"
                      >
                        <X className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-red-700 flex-1">{obj}</p>
                        <button
                          onClick={() => removeObjection(i)}
                          className="p-1 rounded hover:bg-red-100"
                        >
                          <Trash2 className="w-4 h-4 text-red-400" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4 text-sm text-neutral-500 bg-neutral-50 rounded-lg">
                    Click "Add Objection" to select from common objections
                  </div>
                )}
              </div>
            )}

            {/* Privilege Section */}
            {request.responseType === "privilege" && (
              <div className="mb-6">
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Type of Privilege
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {privilegeTypes.map((priv) => (
                    <button
                      key={priv.id}
                      onClick={() => updateRequest(request.id, { privilegeType: priv.id })}
                      className={cn(
                        "flex items-start gap-3 p-3 rounded-lg border-2 text-left transition-all",
                        request.privilegeType === priv.id
                          ? "border-purple-500 bg-purple-50"
                          : "border-neutral-200 hover:border-neutral-300"
                      )}
                    >
                      <Lock
                        className={cn(
                          "w-4 h-4 flex-shrink-0 mt-0.5",
                          request.privilegeType === priv.id
                            ? "text-purple-600"
                            : "text-neutral-400"
                        )}
                      />
                      <div>
                        <p
                          className={cn(
                            "text-sm font-medium",
                            request.privilegeType === priv.id
                              ? "text-purple-900"
                              : "text-neutral-700"
                          )}
                        >
                          {priv.label}
                        </p>
                        <p className="text-xs text-neutral-500">{priv.description}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Answer Section */}
            {(request.responseType === "answer" || request.responseType === "partial") && (
              <div className="mb-6">
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Your Response
                </label>
                <TextArea
                  value={request.response || ""}
                  onChange={(e) => updateRequest(request.id, { response: e.target.value })}
                  placeholder={
                    request.type === "admission"
                      ? "Admitted / Denied / Denied for lack of knowledge..."
                      : "Type your answer here..."
                  }
                  rows={4}
                />
                {request.type === "admission" && (
                  <div className="flex gap-2 mt-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => updateRequest(request.id, { response: "Admitted." })}
                    >
                      Admit
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => updateRequest(request.id, { response: "Denied." })}
                    >
                      Deny
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() =>
                        updateRequest(request.id, {
                          response:
                            "Denied for lack of knowledge or information sufficient to form a belief as to the truth of this request.",
                        })
                      }
                    >
                      Lack of Knowledge
                    </Button>
                  </div>
                )}
              </div>
            )}

            {/* Documents Section for Document Requests */}
            {request.type === "document_request" && request.responseType === "answer" && (
              <div className="mb-6">
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Documents to Produce
                </label>
                <div className="border-2 border-dashed border-neutral-200 rounded-lg p-6 text-center">
                  <Upload className="w-8 h-8 text-neutral-400 mx-auto mb-2" />
                  <p className="text-sm text-neutral-600">
                    Drag and drop documents here, or click to browse
                  </p>
                  <p className="text-xs text-neutral-400 mt-1">
                    PDF, DOCX, XLSX, images supported
                  </p>
                </div>
              </div>
            )}

            {/* Notes */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Notes (internal, not included in response)
              </label>
              <TextArea
                value={request.notes || ""}
                onChange={(e) => updateRequest(request.id, { notes: e.target.value })}
                placeholder="Any notes for yourself about this request..."
                rows={2}
              />
            </div>

            {/* Mark Complete */}
            <div className="flex items-center justify-between pt-4 border-t border-neutral-200">
              <Button
                variant={request.isComplete ? "ghost" : "primary"}
                onClick={() => updateRequest(request.id, { isComplete: !request.isComplete })}
                icon={
                  request.isComplete ? (
                    <Circle className="w-4 h-4" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4" />
                  )
                }
              >
                {request.isComplete ? "Mark Incomplete" : "Mark Complete"}
              </Button>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  disabled={activeRequestIndex === 0}
                  onClick={() => setActiveRequestIndex((prev) => prev - 1)}
                  icon={<ArrowLeft className="w-4 h-4" />}
                >
                  Previous
                </Button>
                <Button
                  variant="ghost"
                  disabled={activeRequestIndex === activeSet.requests.length - 1}
                  onClick={() => setActiveRequestIndex((prev) => prev + 1)}
                  icon={<ArrowRight className="w-4 h-4" />}
                  iconPosition="right"
                >
                  Next
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tips */}
        <Card className="bg-blue-50 border-blue-100">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <Lightbulb className="w-5 h-5 text-blue-600 flex-shrink-0" />
              <div>
                <h4 className="font-medium text-blue-900 mb-1">Tips for Responding</h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  {request.type === "interrogatory" && (
                    <>
                      <li>• Answer only what is asked - don't volunteer extra information</li>
                      <li>• If you don't know something, say "I don't know" or "I have no knowledge"</li>
                      <li>• Be truthful - these answers are under oath</li>
                    </>
                  )}
                  {request.type === "document_request" && (
                    <>
                      <li>• Only produce documents that actually exist and you have access to</li>
                      <li>• If documents don't exist, say so clearly</li>
                      <li>• Redact truly privileged information, but explain what was redacted</li>
                    </>
                  )}
                  {request.type === "admission" && (
                    <>
                      <li>• Be careful! If you don't respond, it's automatically admitted</li>
                      <li>• You can qualify your response if partly true</li>
                      <li>• "Lack of knowledge" is only valid if you genuinely don't know</li>
                    </>
                  )}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Objection Picker Modal */}
        <AnimatePresence>
          {showObjectionPicker && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              onClick={() => setShowObjectionPicker(false)}
            >
              <motion.div
                initial={{ scale: 0.95, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.95, y: 20 }}
                className="bg-white rounded-xl shadow-xl max-w-lg w-full max-h-[80vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="p-4 border-b border-neutral-200">
                  <h3 className="font-semibold text-neutral-900">Select Objection</h3>
                  <p className="text-sm text-neutral-500">Choose a common objection to add</p>
                </div>
                <div className="p-2">
                  {Object.entries(commonObjections).map(([key, obj]) => (
                    <button
                      key={key}
                      onClick={() => addObjection(key)}
                      className="w-full text-left p-3 rounded-lg hover:bg-neutral-50 transition-colors"
                    >
                      <p className="font-medium text-neutral-900">{obj.label}</p>
                      <p className="text-sm text-neutral-500 mt-0.5 line-clamp-2">{obj.text}</p>
                    </button>
                  ))}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    );
  };

  // Render review view
  const renderReviewView = () => {
    if (!activeSet) return null;

    return (
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="space-y-6"
      >
        {/* Header */}
        <div className="flex items-start gap-4">
          <Button
            variant="ghost"
            size="sm"
            icon={<ArrowLeft className="w-4 h-4" />}
            onClick={() => setView("respond")}
          >
            Back to Edit
          </Button>
          <div className="flex-1">
            <h1 className="text-xl font-semibold text-neutral-900">Review Responses</h1>
            <p className="text-neutral-500 text-sm">{activeSet.title}</p>
          </div>
          <Button
            variant="primary"
            onClick={() => onAction?.("export-discovery", activeSet)}
            icon={<Download className="w-4 h-4" />}
          >
            Export Document
          </Button>
        </div>

        {/* Preview */}
        <Card>
          <CardContent className="p-6">
            <div className="prose prose-neutral max-w-none">
              <h2 className="text-lg font-semibold mb-4">
                DEFENDANT'S RESPONSES TO {activeSet.title.toUpperCase()}
              </h2>

              {activeSet.requests.map((request) => (
                <div key={request.id} className="mb-6 pb-6 border-b border-neutral-200 last:border-0">
                  <p className="font-medium text-neutral-900 mb-2">
                    {request.type === "interrogatory"
                      ? `INTERROGATORY NO. ${request.number}`
                      : request.type === "document_request"
                      ? `REQUEST NO. ${request.number}`
                      : `REQUEST FOR ADMISSION NO. ${request.number}`}
                  </p>
                  <p className="text-neutral-700 mb-3">{request.text}</p>

                  <p className="font-medium text-neutral-900 mb-2">RESPONSE:</p>

                  {request.objections && request.objections.length > 0 && (
                    <div className="mb-2">
                      {request.objections.map((obj, i) => (
                        <p key={i} className="text-neutral-700 mb-1">{obj}</p>
                      ))}
                    </div>
                  )}

                  {request.privilegeType && (
                    <p className="text-neutral-700 mb-2">
                      This request calls for information protected by{" "}
                      {privilegeTypes.find((p) => p.id === request.privilegeType)?.label}.
                    </p>
                  )}

                  {request.response && (
                    <p className="text-neutral-700">
                      {request.responseType === "partial" && "Subject to the foregoing objections, "}
                      {request.response}
                    </p>
                  )}

                  {!request.isComplete && (
                    <div className="mt-2 p-2 bg-amber-50 rounded text-sm text-amber-700">
                      ⚠️ This response is not marked complete
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Warnings */}
        {activeSet.requests.some((r) => !r.isComplete) && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0" />
              <div>
                <p className="font-medium text-amber-900">Incomplete Responses</p>
                <p className="text-sm text-amber-700">
                  {activeSet.requests.filter((r) => !r.isComplete).length} responses are not yet complete.
                  Make sure to finish all responses before exporting.
                </p>
              </div>
            </div>
          </div>
        )}
      </motion.div>
    );
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <AnimatePresence mode="wait">
        {view === "list" && renderListView()}
        {view === "respond" && renderRespondView()}
        {view === "review" && renderReviewView()}
      </AnimatePresence>
    </div>
  );
};
