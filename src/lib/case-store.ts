"use client";

/**
 * Case Data Store
 *
 * Manages all case data with localStorage persistence.
 * Users input their own data - no hardcoded values.
 */

// Types
export interface Plaintiff {
  name: string;
  designation: string;
  jurisdiction: string;
  controlledBy?: string[];
}

export interface Defendant {
  name: string;
  designation: string;
  isYou?: boolean;
  status: "Active" | "Discontinued" | "Pending";
  representedBy?: string;
  notes?: string;
}

export interface OtherParty {
  name: string;
  role: string;
  relationship?: string;
  notes?: string;
}

export interface Application {
  type: string;
  caseNumber?: string;
  filedBy: string;
  status: string;
  yourPosition: string;
  priority: "high" | "medium" | "low";
  nextStep: string;
}

export interface TimelineEvent {
  date: string;
  event: string;
  type: "court" | "opposing" | "yours" | "victory" | "upcoming";
}

export interface CaseData {
  case: {
    caseNumber: string;
    court: string;
    relatedProceedings: string[];
    caseManagementJudge: string;
    previousJudge?: string;
  };
  parties: {
    plaintiffs: Plaintiff[];
    defendants: Defendant[];
    otherParties?: OtherParty[];
    opposingSolicitors: {
      firm: string;
      partner: string;
    };
  };
  nextHearing: {
    date: string;
    judge: string;
    matters: string[];
  };
  applications: Application[];
  yourStrengths: string[];
  theirWeaknesses: string[];
  financials?: {
    legalFees?: {
      [key: string]: {
        total: number;
        settled: number;
        outstanding: number;
        currency: string;
      };
    };
    securityForCosts?: {
      amount: number;
      currency: string;
      status: string;
    };
  };
  timeline: TimelineEvent[];
}

export interface Exhibit {
  id: string;
  exhibitNumber: string;
  title: string;
  description?: string;
  documentType: "pdf" | "docx" | "image" | "video" | "audio" | "spreadsheet" | "other";
  fileName: string;
  fileSize: number;
  dateAdded: string;
  dateOfDocument?: string;
  source?: string;
  tags: string[];
  status: "draft" | "ready" | "filed" | "admitted";
  pageStart?: number;
  pageEnd?: number;
  notes?: string;
}

export interface ExhibitBundle {
  id: string;
  name: string;
  description?: string;
  exhibits: string[];
  createdAt: string;
  updatedAt: string;
  status: "draft" | "finalized";
  totalPages?: number;
}

// Storage keys
const STORAGE_KEYS = {
  CASE_DATA: "legalcli_case_data",
  EXHIBITS: "legalcli_exhibits",
  BUNDLES: "legalcli_bundles",
  HAS_SETUP: "legalcli_has_setup",
};

// Default empty case structure
export const getEmptyCaseData = (): CaseData => ({
  case: {
    caseNumber: "",
    court: "",
    relatedProceedings: [],
    caseManagementJudge: "",
    previousJudge: "",
  },
  parties: {
    plaintiffs: [],
    defendants: [],
    otherParties: [],
    opposingSolicitors: {
      firm: "",
      partner: "",
    },
  },
  nextHearing: {
    date: "",
    judge: "",
    matters: [],
  },
  applications: [],
  yourStrengths: [],
  theirWeaknesses: [],
  timeline: [],
});

// Check if running in browser
const isBrowser = typeof window !== "undefined";

// Load case data from localStorage
export const loadCaseData = (): CaseData | null => {
  if (!isBrowser) return null;

  try {
    const stored = localStorage.getItem(STORAGE_KEYS.CASE_DATA);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error("Failed to load case data:", e);
  }
  return null;
};

// Save case data to localStorage
export const saveCaseData = (data: CaseData): void => {
  if (!isBrowser) return;

  try {
    localStorage.setItem(STORAGE_KEYS.CASE_DATA, JSON.stringify(data));
  } catch (e) {
    console.error("Failed to save case data:", e);
  }
};

// Load exhibits from localStorage
export const loadExhibits = (): Exhibit[] => {
  if (!isBrowser) return [];

  try {
    const stored = localStorage.getItem(STORAGE_KEYS.EXHIBITS);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error("Failed to load exhibits:", e);
  }
  return [];
};

// Save exhibits to localStorage
export const saveExhibits = (exhibits: Exhibit[]): void => {
  if (!isBrowser) return;

  try {
    localStorage.setItem(STORAGE_KEYS.EXHIBITS, JSON.stringify(exhibits));
  } catch (e) {
    console.error("Failed to save exhibits:", e);
  }
};

// Load bundles from localStorage
export const loadBundles = (): ExhibitBundle[] => {
  if (!isBrowser) return [];

  try {
    const stored = localStorage.getItem(STORAGE_KEYS.BUNDLES);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error("Failed to load bundles:", e);
  }
  return [];
};

// Save bundles to localStorage
export const saveBundles = (bundles: ExhibitBundle[]): void => {
  if (!isBrowser) return;

  try {
    localStorage.setItem(STORAGE_KEYS.BUNDLES, JSON.stringify(bundles));
  } catch (e) {
    console.error("Failed to save bundles:", e);
  }
};

// Check if user has completed setup
export const hasCompletedSetup = (): boolean => {
  if (!isBrowser) return false;
  return localStorage.getItem(STORAGE_KEYS.HAS_SETUP) === "true";
};

// Mark setup as complete
export const markSetupComplete = (): void => {
  if (!isBrowser) return;
  localStorage.setItem(STORAGE_KEYS.HAS_SETUP, "true");
};

// Clear all data (for reset)
export const clearAllData = (): void => {
  if (!isBrowser) return;

  Object.values(STORAGE_KEYS).forEach((key) => {
    localStorage.removeItem(key);
  });
};

// Export case data to JSON file
export const exportCaseData = (): string => {
  const data = {
    caseData: loadCaseData(),
    exhibits: loadExhibits(),
    bundles: loadBundles(),
    exportedAt: new Date().toISOString(),
  };
  return JSON.stringify(data, null, 2);
};

// Import case data from JSON
export const importCaseData = (jsonString: string): boolean => {
  try {
    const data = JSON.parse(jsonString);

    if (data.caseData) {
      saveCaseData(data.caseData);
    }
    if (data.exhibits) {
      saveExhibits(data.exhibits);
    }
    if (data.bundles) {
      saveBundles(data.bundles);
    }

    markSetupComplete();
    return true;
  } catch (e) {
    console.error("Failed to import case data:", e);
    return false;
  }
};
