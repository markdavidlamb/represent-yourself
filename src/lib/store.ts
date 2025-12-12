/**
 * Global State Store (Zustand)
 */

import { create } from "zustand";
import { persist } from "zustand/middleware";

// Types
export interface Case {
  id: string;
  name: string;
  number: string;
  court: string;
  jurisdiction: string;
  status: "active" | "pending" | "closed";
  parties: Party[];
  hearings: Hearing[];
  documents: Document[];
  emailMonitors: EmailMonitor[];
  createdAt: Date;
  updatedAt: Date;
  driveFolder?: string;
  spreadsheetId?: string;
}

export interface Party {
  id: string;
  name: string;
  role: "plaintiff" | "defendant" | "third_party";
  lawyers?: string[];
  emails?: string[];
}

export interface Hearing {
  id: string;
  date: Date;
  type: string;
  judge?: string;
  location?: string;
  notes?: string;
}

export interface Document {
  id: string;
  name: string;
  type: "affirmation" | "submission" | "letter" | "exhibit" | "order" | "other";
  status: "draft" | "review" | "final" | "filed" | "served";
  driveId?: string;
  driveLink?: string;
  createdAt: Date;
  updatedAt: Date;
  dueDate?: Date;
  filedDate?: Date;
}

export interface EmailMonitor {
  id: string;
  name: string;
  fromDomain?: string;
  fromEmail?: string;
  subjectContains?: string;
  enabled: boolean;
  lastChecked?: Date;
}

export interface Email {
  id: string;
  threadId: string;
  from: string;
  to: string;
  subject: string;
  date: Date;
  snippet: string;
  body?: string;
  isRead: boolean;
  hasAttachments: boolean;
  caseId?: string;
}

export interface TimelineEvent {
  id: string;
  date: Date;
  title: string;
  description?: string;
  type: "event" | "filing" | "hearing" | "deadline" | "order";
  source?: string;
  caseId: string;
}

export interface LLMConfig {
  provider: "ollama" | "claude";
  model: string;
  apiKey?: string;
  baseUrl?: string;
}

export interface GoogleCredentials {
  clientId: string;
  clientSecret: string;
  refreshToken: string;
  isConnected: boolean;
}

// Store State
interface AppState {
  // Cases
  cases: Case[];
  selectedCaseId: string | null;
  addCase: (case_: Omit<Case, "id" | "createdAt" | "updatedAt">) => string;
  updateCase: (id: string, updates: Partial<Case>) => void;
  deleteCase: (id: string) => void;
  selectCase: (id: string | null) => void;

  // Documents
  addDocument: (caseId: string, doc: Omit<Document, "id" | "createdAt" | "updatedAt">) => string;
  updateDocument: (caseId: string, docId: string, updates: Partial<Document>) => void;
  deleteDocument: (caseId: string, docId: string) => void;

  // Emails
  emails: Email[];
  setEmails: (emails: Email[]) => void;
  addEmails: (emails: Email[]) => void;

  // Timeline
  timelineEvents: TimelineEvent[];
  addTimelineEvent: (event: Omit<TimelineEvent, "id">) => void;
  setTimelineEvents: (events: TimelineEvent[]) => void;

  // Email Monitors
  addEmailMonitor: (caseId: string, monitor: Omit<EmailMonitor, "id">) => void;
  updateEmailMonitor: (caseId: string, monitorId: string, updates: Partial<EmailMonitor>) => void;
  deleteEmailMonitor: (caseId: string, monitorId: string) => void;

  // Config
  llmConfig: LLMConfig;
  setLLMConfig: (config: LLMConfig) => void;
  googleCredentials: GoogleCredentials | null;
  setGoogleCredentials: (creds: GoogleCredentials | null) => void;

  // UI State
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  activeView: "inbox" | "cases" | "documents" | "timeline" | "search" | "settings";
  setActiveView: (view: AppState["activeView"]) => void;
}

// Generate unique IDs
const generateId = () => Math.random().toString(36).substring(2, 15);

// Create store with persistence
export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Cases
      cases: [],
      selectedCaseId: null,

      addCase: (case_) => {
        const id = generateId();
        const now = new Date();
        set((state) => ({
          cases: [
            ...state.cases,
            {
              ...case_,
              id,
              createdAt: now,
              updatedAt: now,
              documents: [],
              emailMonitors: [],
              hearings: [],
              parties: [],
            },
          ],
        }));
        return id;
      },

      updateCase: (id, updates) => {
        set((state) => ({
          cases: state.cases.map((c) =>
            c.id === id ? { ...c, ...updates, updatedAt: new Date() } : c
          ),
        }));
      },

      deleteCase: (id) => {
        set((state) => ({
          cases: state.cases.filter((c) => c.id !== id),
          selectedCaseId: state.selectedCaseId === id ? null : state.selectedCaseId,
        }));
      },

      selectCase: (id) => {
        set({ selectedCaseId: id });
      },

      // Documents
      addDocument: (caseId, doc) => {
        const id = generateId();
        const now = new Date();
        set((state) => ({
          cases: state.cases.map((c) =>
            c.id === caseId
              ? {
                  ...c,
                  documents: [
                    ...c.documents,
                    { ...doc, id, createdAt: now, updatedAt: now },
                  ],
                  updatedAt: now,
                }
              : c
          ),
        }));
        return id;
      },

      updateDocument: (caseId, docId, updates) => {
        set((state) => ({
          cases: state.cases.map((c) =>
            c.id === caseId
              ? {
                  ...c,
                  documents: c.documents.map((d) =>
                    d.id === docId ? { ...d, ...updates, updatedAt: new Date() } : d
                  ),
                  updatedAt: new Date(),
                }
              : c
          ),
        }));
      },

      deleteDocument: (caseId, docId) => {
        set((state) => ({
          cases: state.cases.map((c) =>
            c.id === caseId
              ? {
                  ...c,
                  documents: c.documents.filter((d) => d.id !== docId),
                  updatedAt: new Date(),
                }
              : c
          ),
        }));
      },

      // Emails
      emails: [],
      setEmails: (emails) => set({ emails }),
      addEmails: (newEmails) =>
        set((state) => {
          const existingIds = new Set(state.emails.map((e) => e.id));
          const uniqueNew = newEmails.filter((e) => !existingIds.has(e.id));
          return { emails: [...uniqueNew, ...state.emails] };
        }),

      // Timeline
      timelineEvents: [],
      addTimelineEvent: (event) => {
        set((state) => ({
          timelineEvents: [...state.timelineEvents, { ...event, id: generateId() }],
        }));
      },
      setTimelineEvents: (events) => set({ timelineEvents: events }),

      // Email Monitors
      addEmailMonitor: (caseId, monitor) => {
        set((state) => ({
          cases: state.cases.map((c) =>
            c.id === caseId
              ? {
                  ...c,
                  emailMonitors: [...c.emailMonitors, { ...monitor, id: generateId() }],
                }
              : c
          ),
        }));
      },

      updateEmailMonitor: (caseId, monitorId, updates) => {
        set((state) => ({
          cases: state.cases.map((c) =>
            c.id === caseId
              ? {
                  ...c,
                  emailMonitors: c.emailMonitors.map((m) =>
                    m.id === monitorId ? { ...m, ...updates } : m
                  ),
                }
              : c
          ),
        }));
      },

      deleteEmailMonitor: (caseId, monitorId) => {
        set((state) => ({
          cases: state.cases.map((c) =>
            c.id === caseId
              ? {
                  ...c,
                  emailMonitors: c.emailMonitors.filter((m) => m.id !== monitorId),
                }
              : c
          ),
        }));
      },

      // Config
      llmConfig: {
        provider: "ollama",
        model: "mistral:latest",
        baseUrl: "http://localhost:11434",
      },
      setLLMConfig: (config) => set({ llmConfig: config }),

      googleCredentials: null,
      setGoogleCredentials: (creds) => set({ googleCredentials: creds }),

      // UI State
      sidebarOpen: true,
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      activeView: "inbox",
      setActiveView: (view) => set({ activeView: view }),
    }),
    {
      name: "counsel-storage",
      partialize: (state) => ({
        cases: state.cases,
        llmConfig: state.llmConfig,
        googleCredentials: state.googleCredentials,
        timelineEvents: state.timelineEvents,
      }),
    }
  )
);

// Selectors
export const useSelectedCase = () => {
  const cases = useStore((s) => s.cases);
  const selectedId = useStore((s) => s.selectedCaseId);
  return cases.find((c) => c.id === selectedId) || null;
};

export const useCaseDocuments = (caseId: string) => {
  const cases = useStore((s) => s.cases);
  return cases.find((c) => c.id === caseId)?.documents || [];
};

export const useCaseTimeline = (caseId: string) => {
  const events = useStore((s) => s.timelineEvents);
  return events.filter((e) => e.caseId === caseId).sort((a, b) => a.date.getTime() - b.date.getTime());
};
