"use client";

import { useState, useEffect } from "react";
import {
  Mail,
  Paperclip,
  Star,
  Archive,
  Trash2,
  RefreshCw,
  Search,
  Filter,
  ChevronRight,
  AlertCircle,
  Bell,
  Plus,
} from "lucide-react";
import { useStore, type Email } from "@/lib/store";

interface EmailMonitorConfig {
  id: string;
  name: string;
  fromDomain?: string;
  enabled: boolean;
}

export function InboxView() {
  const [emails, setEmails] = useState<Email[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showMonitors, setShowMonitors] = useState(false);

  const selectedCase = useStore((s) => {
    const cases = s.cases;
    const id = s.selectedCaseId;
    return cases.find((c) => c.id === id);
  });

  const monitors = selectedCase?.emailMonitors || [];

  // Mock data for demonstration
  useEffect(() => {
    setEmails([
      {
        id: "1",
        threadId: "t1",
        from: "douglas.clark@tannerdewitt.com",
        to: "me@example.com",
        subject: "RE: HCA 1646/2023 - Summary Judgment Application",
        date: new Date(Date.now() - 2 * 60 * 60 * 1000),
        snippet: "Please find attached the Plaintiffs' response to your client's application...",
        isRead: false,
        hasAttachments: true,
      },
      {
        id: "2",
        threadId: "t2",
        from: "registry@judiciary.hk",
        to: "me@example.com",
        subject: "HCA 1646/2023 - Notice of Hearing",
        date: new Date(Date.now() - 24 * 60 * 60 * 1000),
        snippet: "This is to inform you that a hearing has been scheduled for 12 January 2026...",
        isRead: true,
        hasAttachments: true,
      },
      {
        id: "3",
        threadId: "t3",
        from: "oliver.lam@tannerdewitt.com",
        to: "me@example.com",
        subject: "Without Prejudice - Settlement Discussion",
        date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        snippet: "We write on behalf of our clients to explore potential settlement...",
        isRead: true,
        hasAttachments: false,
      },
    ]);
  }, []);

  const filteredEmails = emails.filter(
    (e) =>
      e.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.from.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const matchingMonitors = monitors.filter((m) => m.enabled);

  return (
    <div className="h-full flex">
      {/* Email List */}
      <div className="w-96 border-r border-border flex flex-col">
        {/* Search & Actions */}
        <div className="p-3 border-b border-border space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search emails..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm bg-muted rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-1">
              <button className="p-2 hover:bg-accent rounded-lg" title="Refresh">
                <RefreshCw className="w-4 h-4" />
              </button>
              <button className="p-2 hover:bg-accent rounded-lg" title="Filter">
                <Filter className="w-4 h-4" />
              </button>
            </div>
            <button
              onClick={() => setShowMonitors(!showMonitors)}
              className={`flex items-center px-2 py-1 text-xs rounded-lg ${
                showMonitors ? "bg-primary text-primary-foreground" : "hover:bg-accent"
              }`}
            >
              <Bell className="w-3 h-3 mr-1" />
              Monitors ({matchingMonitors.length})
            </button>
          </div>
        </div>

        {/* Monitors Panel */}
        {showMonitors && (
          <div className="p-3 border-b border-border bg-muted/30">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-muted-foreground">
                Email Monitors
              </span>
              <button className="p-1 hover:bg-accent rounded">
                <Plus className="w-3 h-3" />
              </button>
            </div>
            {monitors.length === 0 ? (
              <p className="text-xs text-muted-foreground">
                No monitors set up. Add one to track opposing counsel.
              </p>
            ) : (
              <div className="space-y-1">
                {monitors.map((m) => (
                  <div
                    key={m.id}
                    className="flex items-center justify-between p-2 bg-background rounded"
                  >
                    <div>
                      <div className="text-sm font-medium">{m.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {m.fromDomain || m.fromEmail}
                      </div>
                    </div>
                    <div
                      className={`w-2 h-2 rounded-full ${
                        m.enabled ? "bg-green-500" : "bg-gray-400"
                      }`}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Email List */}
        <div className="flex-1 overflow-auto">
          {filteredEmails.map((email) => (
            <button
              key={email.id}
              onClick={() => setSelectedEmail(email)}
              className={`w-full text-left p-3 border-b border-border hover:bg-accent/50 ${
                selectedEmail?.id === email.id ? "bg-accent" : ""
              } ${!email.isRead ? "bg-primary/5" : ""}`}
            >
              <div className="flex items-start justify-between mb-1">
                <span
                  className={`text-sm truncate ${
                    !email.isRead ? "font-semibold" : ""
                  }`}
                >
                  {email.from.split("@")[0]}
                </span>
                <span className="text-xs text-muted-foreground whitespace-nowrap ml-2">
                  {formatDate(email.date)}
                </span>
              </div>
              <div
                className={`text-sm truncate ${
                  !email.isRead ? "font-medium" : "text-muted-foreground"
                }`}
              >
                {email.subject}
              </div>
              <div className="flex items-center mt-1">
                <span className="text-xs text-muted-foreground truncate flex-1">
                  {email.snippet}
                </span>
                {email.hasAttachments && (
                  <Paperclip className="w-3 h-3 text-muted-foreground ml-1 flex-shrink-0" />
                )}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Email Detail */}
      <div className="flex-1 flex flex-col">
        {selectedEmail ? (
          <>
            {/* Email Header */}
            <div className="p-4 border-b border-border">
              <div className="flex items-start justify-between mb-3">
                <h2 className="text-lg font-medium">{selectedEmail.subject}</h2>
                <div className="flex items-center space-x-1">
                  <button className="p-2 hover:bg-accent rounded-lg" title="Star">
                    <Star className="w-4 h-4" />
                  </button>
                  <button className="p-2 hover:bg-accent rounded-lg" title="Archive">
                    <Archive className="w-4 h-4" />
                  </button>
                  <button className="p-2 hover:bg-accent rounded-lg" title="Delete">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="flex items-center text-sm">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center mr-3">
                  <span className="text-sm font-medium">
                    {selectedEmail.from[0].toUpperCase()}
                  </span>
                </div>
                <div>
                  <div className="font-medium">{selectedEmail.from}</div>
                  <div className="text-xs text-muted-foreground">
                    to me · {formatDate(selectedEmail.date)}
                  </div>
                </div>
              </div>
            </div>

            {/* Email Body */}
            <div className="flex-1 overflow-auto p-4">
              <div className="prose prose-sm dark:prose-invert max-w-none">
                <p>{selectedEmail.snippet}</p>
                <p className="text-muted-foreground">
                  [Full email content would be loaded here]
                </p>
              </div>

              {/* Attachments */}
              {selectedEmail.hasAttachments && (
                <div className="mt-6 p-4 bg-muted rounded-lg">
                  <div className="flex items-center mb-3">
                    <Paperclip className="w-4 h-4 mr-2" />
                    <span className="text-sm font-medium">Attachments</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <AttachmentCard name="SJ_Response.pdf" size="2.4 MB" />
                    <AttachmentCard name="Exhibit_A.pdf" size="1.1 MB" />
                  </div>
                </div>
              )}

              {/* AI Actions */}
              <div className="mt-6 p-4 border border-primary/20 rounded-lg bg-primary/5">
                <div className="flex items-center mb-3">
                  <AlertCircle className="w-4 h-4 mr-2 text-primary" />
                  <span className="text-sm font-medium">AI Actions</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button className="px-3 py-1.5 text-sm bg-background border border-border rounded-lg hover:bg-accent">
                    Analyze Attachments
                  </button>
                  <button className="px-3 py-1.5 text-sm bg-background border border-border rounded-lg hover:bg-accent">
                    Extract Timeline
                  </button>
                  <button className="px-3 py-1.5 text-sm bg-background border border-border rounded-lg hover:bg-accent">
                    Draft Response
                  </button>
                  <button className="px-3 py-1.5 text-sm bg-background border border-border rounded-lg hover:bg-accent">
                    Add to Case
                  </button>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <Mail className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
              <p className="text-muted-foreground">Select an email to view</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function AttachmentCard({ name, size }: { name: string; size: string }) {
  return (
    <div className="flex items-center p-2 bg-background rounded border border-border hover:border-primary/50 cursor-pointer group">
      <div className="w-10 h-10 rounded bg-red-500/10 flex items-center justify-center mr-3">
        <span className="text-xs font-medium text-red-500">PDF</span>
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium truncate">{name}</div>
        <div className="text-xs text-muted-foreground">{size}</div>
      </div>
      <ChevronRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100" />
    </div>
  );
}

function formatDate(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(hours / 24);

  if (hours < 1) return "Just now";
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString();
}
