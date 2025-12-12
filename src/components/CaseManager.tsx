"use client";

import { useState } from "react";
import {
  FolderOpen,
  Plus,
  Search,
  MoreVertical,
  Calendar,
  Users,
  FileText,
  ExternalLink,
  Trash2,
  Edit3,
  RefreshCw,
  Check,
  X,
  Building2,
  Scale,
  Clock,
} from "lucide-react";
import { useStore, type Case, type Party, type Hearing } from "@/lib/store";

type CaseStatus = "active" | "pending" | "closed";

const STATUS_COLORS: Record<CaseStatus, string> = {
  active: "bg-green-500/10 text-green-500 border-green-500/20",
  pending: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
  closed: "bg-gray-500/10 text-gray-500 border-gray-500/20",
};

export function CaseManager() {
  const [searchQuery, setSearchQuery] = useState("");
  const [showNewCase, setShowNewCase] = useState(false);
  const [editingCase, setEditingCase] = useState<Case | null>(null);
  const [syncing, setSyncing] = useState(false);

  const cases = useStore((s) => s.cases);
  const selectedCaseId = useStore((s) => s.selectedCaseId);
  const selectCase = useStore((s) => s.selectCase);
  const addCase = useStore((s) => s.addCase);
  const updateCase = useStore((s) => s.updateCase);
  const deleteCase = useStore((s) => s.deleteCase);

  const filteredCases = cases.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.number.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedCase = cases.find((c) => c.id === selectedCaseId);

  const handleSyncToSheets = async () => {
    setSyncing(true);
    // Simulate sync (in real app, would call Google Sheets API)
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setSyncing(false);
  };

  return (
    <div className="h-full flex">
      {/* Case List Sidebar */}
      <div className="w-80 border-r border-border flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-border">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Cases</h2>
            <button
              onClick={() => setShowNewCase(true)}
              className="p-2 hover:bg-accent rounded-lg"
              title="New Case"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search cases..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm bg-muted rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>

        {/* Case List */}
        <div className="flex-1 overflow-auto">
          {filteredCases.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground">
              <FolderOpen className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p className="text-sm">No cases yet</p>
              <button
                onClick={() => setShowNewCase(true)}
                className="mt-2 text-sm text-primary hover:underline"
              >
                Create your first case
              </button>
            </div>
          ) : (
            filteredCases.map((case_) => (
              <button
                key={case_.id}
                onClick={() => selectCase(case_.id)}
                className={`w-full text-left p-4 border-b border-border hover:bg-accent/50 transition-colors ${
                  selectedCaseId === case_.id ? "bg-accent" : ""
                }`}
              >
                <div className="flex items-start justify-between mb-1">
                  <span className="font-medium truncate pr-2">{case_.name}</span>
                  <span
                    className={`px-2 py-0.5 text-xs rounded-full border ${
                      STATUS_COLORS[case_.status]
                    }`}
                  >
                    {case_.status}
                  </span>
                </div>
                <div className="text-sm text-muted-foreground">{case_.number}</div>
                <div className="flex items-center mt-2 text-xs text-muted-foreground space-x-3">
                  <span className="flex items-center">
                    <FileText className="w-3 h-3 mr-1" />
                    {case_.documents.length}
                  </span>
                  <span className="flex items-center">
                    <Calendar className="w-3 h-3 mr-1" />
                    {case_.hearings.length}
                  </span>
                  <span className="flex items-center">
                    <Users className="w-3 h-3 mr-1" />
                    {case_.parties.length}
                  </span>
                </div>
              </button>
            ))
          )}
        </div>

        {/* Sync Button */}
        <div className="p-3 border-t border-border">
          <button
            onClick={handleSyncToSheets}
            disabled={syncing}
            className="w-full flex items-center justify-center px-3 py-2 text-sm bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${syncing ? "animate-spin" : ""}`} />
            {syncing ? "Syncing..." : "Sync to Google Sheets"}
          </button>
        </div>
      </div>

      {/* Case Detail */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {selectedCase ? (
          <CaseDetail
            case_={selectedCase}
            onEdit={() => setEditingCase(selectedCase)}
            onDelete={() => {
              if (confirm("Delete this case?")) {
                deleteCase(selectedCase.id);
              }
            }}
          />
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <Scale className="w-16 h-16 mx-auto text-muted-foreground/30 mb-4" />
              <p className="text-muted-foreground">Select a case to view details</p>
            </div>
          </div>
        )}
      </div>

      {/* New Case Modal */}
      {showNewCase && (
        <NewCaseModal
          onClose={() => setShowNewCase(false)}
          onSave={(data) => {
            addCase(data);
            setShowNewCase(false);
          }}
        />
      )}

      {/* Edit Case Modal */}
      {editingCase && (
        <EditCaseModal
          case_={editingCase}
          onClose={() => setEditingCase(null)}
          onSave={(updates) => {
            updateCase(editingCase.id, updates);
            setEditingCase(null);
          }}
        />
      )}
    </div>
  );
}

function CaseDetail({
  case_,
  onEdit,
  onDelete,
}: {
  case_: Case;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const [activeTab, setActiveTab] = useState<"overview" | "parties" | "hearings" | "documents">("overview");

  return (
    <>
      {/* Header */}
      <div className="p-6 border-b border-border">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center space-x-3">
              <h1 className="text-2xl font-semibold">{case_.name}</h1>
              <span
                className={`px-2 py-0.5 text-xs rounded-full border ${
                  STATUS_COLORS[case_.status]
                }`}
              >
                {case_.status}
              </span>
            </div>
            <div className="flex items-center mt-2 text-sm text-muted-foreground space-x-4">
              <span className="flex items-center">
                <Building2 className="w-4 h-4 mr-1" />
                {case_.court}
              </span>
              <span>{case_.number}</span>
              <span>{case_.jurisdiction}</span>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {case_.driveFolder && (
              <a
                href={`https://drive.google.com/drive/folders/${case_.driveFolder}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center px-3 py-1.5 text-sm border border-border rounded-lg hover:bg-accent"
              >
                <ExternalLink className="w-4 h-4 mr-1" />
                Drive
              </a>
            )}
            <button
              onClick={onEdit}
              className="p-2 hover:bg-accent rounded-lg"
              title="Edit"
            >
              <Edit3 className="w-4 h-4" />
            </button>
            <button
              onClick={onDelete}
              className="p-2 hover:bg-accent rounded-lg text-destructive"
              title="Delete"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex mt-6 border-b border-border -mb-px">
          {(["overview", "parties", "hearings", "documents"] as const).map((tab) => (
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
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-6">
        {activeTab === "overview" && <CaseOverview case_={case_} />}
        {activeTab === "parties" && <CaseParties parties={case_.parties} />}
        {activeTab === "hearings" && <CaseHearings hearings={case_.hearings} />}
        {activeTab === "documents" && <CaseDocuments case_={case_} />}
      </div>
    </>
  );
}

function CaseOverview({ case_ }: { case_: Case }) {
  const nextHearing = case_.hearings
    .filter((h) => new Date(h.date) > new Date())
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0];

  const pendingDocs = case_.documents.filter((d) => d.status === "draft" || d.status === "review");

  return (
    <div className="grid grid-cols-2 gap-6">
      {/* Stats */}
      <div className="col-span-2 grid grid-cols-4 gap-4">
        <StatCard label="Documents" value={case_.documents.length} icon={FileText} />
        <StatCard label="Hearings" value={case_.hearings.length} icon={Calendar} />
        <StatCard label="Parties" value={case_.parties.length} icon={Users} />
        <StatCard label="Pending" value={pendingDocs.length} icon={Clock} />
      </div>

      {/* Next Hearing */}
      <div className="p-4 border border-border rounded-lg">
        <h3 className="font-medium mb-3">Next Hearing</h3>
        {nextHearing ? (
          <div>
            <div className="text-lg font-semibold">{nextHearing.type}</div>
            <div className="text-sm text-muted-foreground">
              {new Date(nextHearing.date).toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </div>
            {nextHearing.judge && (
              <div className="mt-2 text-sm">Judge: {nextHearing.judge}</div>
            )}
            {nextHearing.location && (
              <div className="text-sm text-muted-foreground">{nextHearing.location}</div>
            )}
          </div>
        ) : (
          <p className="text-muted-foreground">No upcoming hearings</p>
        )}
      </div>

      {/* Recent Activity */}
      <div className="p-4 border border-border rounded-lg">
        <h3 className="font-medium mb-3">Recent Documents</h3>
        {case_.documents.slice(0, 5).map((doc) => (
          <div
            key={doc.id}
            className="flex items-center justify-between py-2 border-b border-border last:border-0"
          >
            <div>
              <div className="text-sm font-medium">{doc.name}</div>
              <div className="text-xs text-muted-foreground">{doc.type}</div>
            </div>
            <span
              className={`px-2 py-0.5 text-xs rounded ${
                doc.status === "filed"
                  ? "bg-green-500/10 text-green-500"
                  : doc.status === "draft"
                  ? "bg-yellow-500/10 text-yellow-500"
                  : "bg-blue-500/10 text-blue-500"
              }`}
            >
              {doc.status}
            </span>
          </div>
        ))}
        {case_.documents.length === 0 && (
          <p className="text-muted-foreground text-sm">No documents yet</p>
        )}
      </div>

      {/* Key Dates */}
      <div className="p-4 border border-border rounded-lg">
        <h3 className="font-medium mb-3">Key Dates</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Created</span>
            <span>{new Date(case_.createdAt).toLocaleDateString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Last Updated</span>
            <span>{new Date(case_.updatedAt).toLocaleDateString()}</span>
          </div>
        </div>
      </div>

      {/* Links */}
      <div className="p-4 border border-border rounded-lg">
        <h3 className="font-medium mb-3">External Links</h3>
        <div className="space-y-2">
          {case_.driveFolder && (
            <a
              href={`https://drive.google.com/drive/folders/${case_.driveFolder}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center text-sm text-primary hover:underline"
            >
              <ExternalLink className="w-3 h-3 mr-1" />
              Google Drive Folder
            </a>
          )}
          {case_.spreadsheetId && (
            <a
              href={`https://docs.google.com/spreadsheets/d/${case_.spreadsheetId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center text-sm text-primary hover:underline"
            >
              <ExternalLink className="w-3 h-3 mr-1" />
              Case Spreadsheet
            </a>
          )}
          {!case_.driveFolder && !case_.spreadsheetId && (
            <p className="text-sm text-muted-foreground">No external links configured</p>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: number;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <div className="p-4 bg-muted rounded-lg">
      <div className="flex items-center justify-between">
        <Icon className="w-5 h-5 text-muted-foreground" />
        <span className="text-2xl font-semibold">{value}</span>
      </div>
      <div className="text-sm text-muted-foreground mt-1">{label}</div>
    </div>
  );
}

function CaseParties({ parties }: { parties: Party[] }) {
  const roleColors = {
    plaintiff: "bg-blue-500/10 text-blue-500",
    defendant: "bg-red-500/10 text-red-500",
    third_party: "bg-purple-500/10 text-purple-500",
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-medium">Parties ({parties.length})</h3>
        <button className="flex items-center px-3 py-1.5 text-sm border border-border rounded-lg hover:bg-accent">
          <Plus className="w-4 h-4 mr-1" />
          Add Party
        </button>
      </div>

      {parties.length === 0 ? (
        <p className="text-muted-foreground">No parties added yet</p>
      ) : (
        <div className="grid gap-4">
          {parties.map((party) => (
            <div key={party.id} className="p-4 border border-border rounded-lg">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-medium">{party.name}</span>
                    <span className={`px-2 py-0.5 text-xs rounded ${roleColors[party.role]}`}>
                      {party.role.replace("_", " ")}
                    </span>
                  </div>
                  {party.lawyers && party.lawyers.length > 0 && (
                    <div className="mt-2 text-sm text-muted-foreground">
                      <span className="font-medium">Lawyers:</span> {party.lawyers.join(", ")}
                    </div>
                  )}
                  {party.emails && party.emails.length > 0 && (
                    <div className="text-sm text-muted-foreground">
                      <span className="font-medium">Emails:</span> {party.emails.join(", ")}
                    </div>
                  )}
                </div>
                <button className="p-1 hover:bg-accent rounded">
                  <MoreVertical className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function CaseHearings({ hearings }: { hearings: Hearing[] }) {
  const sortedHearings = [...hearings].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const now = new Date();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-medium">Hearings ({hearings.length})</h3>
        <button className="flex items-center px-3 py-1.5 text-sm border border-border rounded-lg hover:bg-accent">
          <Plus className="w-4 h-4 mr-1" />
          Add Hearing
        </button>
      </div>

      {sortedHearings.length === 0 ? (
        <p className="text-muted-foreground">No hearings scheduled</p>
      ) : (
        <div className="space-y-3">
          {sortedHearings.map((hearing) => {
            const isPast = new Date(hearing.date) < now;
            return (
              <div
                key={hearing.id}
                className={`p-4 border rounded-lg ${
                  isPast ? "border-border bg-muted/30" : "border-primary/20 bg-primary/5"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="font-medium">{hearing.type}</div>
                    <div className="text-sm text-muted-foreground">
                      {new Date(hearing.date).toLocaleDateString("en-US", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                        hour: "numeric",
                        minute: "2-digit",
                      })}
                    </div>
                    {hearing.judge && (
                      <div className="mt-1 text-sm">Judge: {hearing.judge}</div>
                    )}
                    {hearing.location && (
                      <div className="text-sm text-muted-foreground">{hearing.location}</div>
                    )}
                    {hearing.notes && (
                      <div className="mt-2 text-sm p-2 bg-muted rounded">{hearing.notes}</div>
                    )}
                  </div>
                  <span
                    className={`px-2 py-0.5 text-xs rounded ${
                      isPast ? "bg-gray-500/10 text-gray-500" : "bg-green-500/10 text-green-500"
                    }`}
                  >
                    {isPast ? "Past" : "Upcoming"}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function CaseDocuments({ case_ }: { case_: Case }) {
  const documents = [...case_.documents].sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );

  const statusColors = {
    draft: "bg-yellow-500/10 text-yellow-500",
    review: "bg-blue-500/10 text-blue-500",
    final: "bg-purple-500/10 text-purple-500",
    filed: "bg-green-500/10 text-green-500",
    served: "bg-green-500/10 text-green-500",
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-medium">Documents ({documents.length})</h3>
        <button className="flex items-center px-3 py-1.5 text-sm border border-border rounded-lg hover:bg-accent">
          <Plus className="w-4 h-4 mr-1" />
          New Document
        </button>
      </div>

      {documents.length === 0 ? (
        <p className="text-muted-foreground">No documents yet</p>
      ) : (
        <div className="space-y-2">
          {documents.map((doc) => (
            <div
              key={doc.id}
              className="flex items-center justify-between p-3 border border-border rounded-lg hover:bg-accent/50"
            >
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded bg-primary/10 flex items-center justify-center">
                  <FileText className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <div className="font-medium">{doc.name}</div>
                  <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                    <span>{doc.type}</span>
                    <span>•</span>
                    <span>{new Date(doc.updatedAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <span className={`px-2 py-0.5 text-xs rounded ${statusColors[doc.status]}`}>
                  {doc.status}
                </span>
                {doc.driveLink && (
                  <a
                    href={doc.driveLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1 hover:bg-accent rounded"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function NewCaseModal({
  onClose,
  onSave,
}: {
  onClose: () => void;
  onSave: (data: Omit<Case, "id" | "createdAt" | "updatedAt">) => void;
}) {
  const [formData, setFormData] = useState({
    name: "",
    number: "",
    court: "",
    jurisdiction: "",
    status: "active" as CaseStatus,
  });

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="w-full max-w-lg bg-background rounded-xl border border-border shadow-xl">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-lg font-semibold">New Case</h2>
          <button onClick={onClose} className="p-1 hover:bg-accent rounded">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Case Name *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Lamb v. Liquidity Technologies"
              className="w-full px-3 py-2 bg-muted rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Case Number *</label>
            <input
              type="text"
              value={formData.number}
              onChange={(e) => setFormData({ ...formData, number: e.target.value })}
              placeholder="e.g., HCA 1646/2023"
              className="w-full px-3 py-2 bg-muted rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Court *</label>
            <input
              type="text"
              value={formData.court}
              onChange={(e) => setFormData({ ...formData, court: e.target.value })}
              placeholder="e.g., High Court of Hong Kong"
              className="w-full px-3 py-2 bg-muted rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Jurisdiction</label>
            <input
              type="text"
              value={formData.jurisdiction}
              onChange={(e) => setFormData({ ...formData, jurisdiction: e.target.value })}
              placeholder="e.g., Hong Kong SAR"
              className="w-full px-3 py-2 bg-muted rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Status</label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as CaseStatus })}
              className="w-full px-3 py-2 bg-muted rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="active">Active</option>
              <option value="pending">Pending</option>
              <option value="closed">Closed</option>
            </select>
          </div>
        </div>
        <div className="flex justify-end space-x-2 p-4 border-t border-border">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm border border-border rounded-lg hover:bg-accent"
          >
            Cancel
          </button>
          <button
            onClick={() =>
              onSave({
                ...formData,
                parties: [],
                hearings: [],
                documents: [],
                emailMonitors: [],
              })
            }
            disabled={!formData.name || !formData.number || !formData.court}
            className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50"
          >
            Create Case
          </button>
        </div>
      </div>
    </div>
  );
}

function EditCaseModal({
  case_,
  onClose,
  onSave,
}: {
  case_: Case;
  onClose: () => void;
  onSave: (updates: Partial<Case>) => void;
}) {
  const [formData, setFormData] = useState({
    name: case_.name,
    number: case_.number,
    court: case_.court,
    jurisdiction: case_.jurisdiction,
    status: case_.status,
    driveFolder: case_.driveFolder || "",
    spreadsheetId: case_.spreadsheetId || "",
  });

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="w-full max-w-lg bg-background rounded-xl border border-border shadow-xl">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-lg font-semibold">Edit Case</h2>
          <button onClick={onClose} className="p-1 hover:bg-accent rounded">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-4 space-y-4 max-h-[60vh] overflow-auto">
          <div>
            <label className="block text-sm font-medium mb-1">Case Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 bg-muted rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Case Number</label>
            <input
              type="text"
              value={formData.number}
              onChange={(e) => setFormData({ ...formData, number: e.target.value })}
              className="w-full px-3 py-2 bg-muted rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Court</label>
            <input
              type="text"
              value={formData.court}
              onChange={(e) => setFormData({ ...formData, court: e.target.value })}
              className="w-full px-3 py-2 bg-muted rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Jurisdiction</label>
            <input
              type="text"
              value={formData.jurisdiction}
              onChange={(e) => setFormData({ ...formData, jurisdiction: e.target.value })}
              className="w-full px-3 py-2 bg-muted rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Status</label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as CaseStatus })}
              className="w-full px-3 py-2 bg-muted rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="active">Active</option>
              <option value="pending">Pending</option>
              <option value="closed">Closed</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Google Drive Folder ID</label>
            <input
              type="text"
              value={formData.driveFolder}
              onChange={(e) => setFormData({ ...formData, driveFolder: e.target.value })}
              placeholder="e.g., 1abc123..."
              className="w-full px-3 py-2 bg-muted rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Google Sheets ID</label>
            <input
              type="text"
              value={formData.spreadsheetId}
              onChange={(e) => setFormData({ ...formData, spreadsheetId: e.target.value })}
              placeholder="e.g., 1xyz789..."
              className="w-full px-3 py-2 bg-muted rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>
        <div className="flex justify-end space-x-2 p-4 border-t border-border">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm border border-border rounded-lg hover:bg-accent"
          >
            Cancel
          </button>
          <button
            onClick={() => onSave(formData)}
            className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
