"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BookOpen,
  ChevronRight,
  ChevronDown,
  CheckCircle2,
  Circle,
  AlertTriangle,
  Clock,
  FileText,
  Scale,
  Users,
  Gavel,
  ArrowRight,
  ArrowLeft,
  Search,
  Filter,
  Info,
  ExternalLink,
  Bookmark,
  BookmarkCheck,
  Lightbulb,
  Target,
  Shield,
  AlertCircle,
} from "lucide-react";
import { Card, CardHeader, CardContent } from "../ui/Card";
import { Button } from "../ui/Button";
import { Input, SearchInput } from "../ui/Input";
import { Badge, StatusBadge } from "../ui/Badge";
import { cn } from "@/lib/utils";

// Types for procedures
interface ProcedureStep {
  id: string;
  title: string;
  description: string;
  details: string[];
  tips?: string[];
  warnings?: string[];
  deadline?: string;
  documents?: string[];
  completed?: boolean;
}

interface Procedure {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  estimatedTime: string;
  icon: React.ReactNode;
  steps: ProcedureStep[];
  relatedProcedures?: string[];
  courtRules?: string[];
}

// Comprehensive procedure library
const procedures: Procedure[] = [
  {
    id: "responding-to-lawsuit",
    title: "Responding to a Lawsuit",
    description: "What to do when you've been served with legal papers",
    category: "Getting Started",
    difficulty: "beginner",
    estimatedTime: "2-4 weeks",
    icon: <FileText className="w-5 h-5" />,
    courtRules: ["O.12 r.1", "O.12 r.4", "O.18"],
    steps: [
      {
        id: "rs-1",
        title: "Read and understand the documents",
        description: "Carefully review everything you've been served",
        details: [
          "Identify the Writ of Summons or Originating Summons",
          "Read the Statement of Claim to understand what's being alleged",
          "Note the case number and court location",
          "Check who the plaintiffs and their lawyers are",
          "Look for any deadlines mentioned in the documents",
        ],
        tips: [
          "Make copies of everything before writing on any documents",
          "Create a folder or binder to keep all case documents organized",
          "Highlight key dates and allegations",
        ],
        warnings: [
          "Don't ignore the papers - this won't make them go away",
          "Don't contact the other side directly if they have lawyers",
        ],
      },
      {
        id: "rs-2",
        title: "Calculate your deadline",
        description: "Determine when your response is due",
        details: [
          "You typically have 14 days to file an Acknowledgment of Service",
          "After acknowledging, you have 28 days to file a Defence",
          "Time starts from when you were properly served",
          "Weekends and public holidays may not count depending on jurisdiction",
        ],
        deadline: "14 days from service",
        tips: [
          "Mark the deadline on your calendar immediately",
          "Set reminders for 1 week before and 3 days before",
          "If you need more time, apply for an extension BEFORE the deadline",
        ],
        warnings: [
          "Missing deadlines can result in default judgment against you",
          "Courts are strict about time limits",
        ],
      },
      {
        id: "rs-3",
        title: "File Acknowledgment of Service",
        description: "Formally notify the court you've received the papers",
        details: [
          "Obtain the correct court form (usually Form 14)",
          "Fill in your details and the case information",
          "Indicate whether you intend to defend the claim",
          "File at the court registry and pay any filing fee",
          "Serve a copy on the plaintiff's lawyers",
        ],
        documents: ["Acknowledgment of Service (Form 14)", "Court fee"],
        tips: [
          "Always indicate you intend to defend, even if you're unsure",
          "Keep the stamped copy as proof of filing",
        ],
      },
      {
        id: "rs-4",
        title: "Prepare your Defence",
        description: "Draft your formal response to the allegations",
        details: [
          "Go through the Statement of Claim paragraph by paragraph",
          "For each allegation: admit, deny, or say you don't know",
          "Provide your version of events where relevant",
          "Raise any defences you have (limitation, estoppel, etc.)",
          "Include any counterclaim if the plaintiff owes you something",
        ],
        documents: ["Defence", "Counterclaim (if applicable)"],
        tips: [
          "Be specific - don't just say 'denied' without explanation",
          "Stick to facts, not emotions or opinions",
          "Use our Document Drafting tool to help structure your Defence",
        ],
        warnings: [
          "Anything you admit cannot be disputed later",
          "Don't make allegations you can't prove",
        ],
      },
      {
        id: "rs-5",
        title: "File and serve your Defence",
        description: "Submit your Defence to the court and other side",
        details: [
          "File the original Defence at court registry",
          "Serve a copy on the plaintiff's lawyers",
          "Keep proof of service (acknowledgment or posting receipt)",
          "Note the date you served for your records",
        ],
        deadline: "28 days after Acknowledgment",
        documents: ["Defence", "Affidavit of Service"],
      },
    ],
    relatedProcedures: ["filing-defence", "requesting-extension", "default-judgment"],
  },
  {
    id: "opposing-summary-judgment",
    title: "Opposing Summary Judgment",
    description: "How to fight when the other side says you have no case",
    category: "Motions & Applications",
    difficulty: "advanced",
    estimatedTime: "3-6 weeks",
    icon: <Shield className="w-5 h-5" />,
    courtRules: ["O.14", "O.14A"],
    steps: [
      {
        id: "sj-1",
        title: "Understand what Summary Judgment means",
        description: "Know what you're up against",
        details: [
          "Summary Judgment is a request to win without a trial",
          "The applicant claims there's no genuine dispute to try",
          "They must show you have no real defence to their claim",
          "Your job is to show there ARE genuine issues requiring trial",
          "You don't have to prove your case - just show it deserves a trial",
        ],
        tips: [
          "Summary Judgment is a high bar - courts prefer trials",
          "Even if their case looks strong, triable issues can defeat SJ",
          "Focus on disputed facts, not legal arguments at this stage",
        ],
      },
      {
        id: "sj-2",
        title: "Analyze their application",
        description: "Identify weaknesses in their Summary Judgment application",
        details: [
          "Read their affidavit(s) carefully - what evidence do they have?",
          "Note any facts they claim are undisputed",
          "Look for gaps in their evidence",
          "Check if they've addressed all elements of their claim",
          "Identify any facts that are genuinely disputed",
        ],
        tips: [
          "Use our Document Analysis tool to extract key points",
          "Make a list of every factual claim they make",
          "Mark which ones you can dispute with evidence",
        ],
      },
      {
        id: "sj-3",
        title: "Gather your evidence",
        description: "Collect evidence showing genuine disputes exist",
        details: [
          "Find documents that contradict their version of events",
          "Identify witnesses who can support your account",
          "Look for inconsistencies in their own documents",
          "Gather any correspondence or communications",
          "Consider expert evidence if technical issues are involved",
        ],
        warnings: [
          "Don't rely on what you 'might' find later - show evidence NOW",
          "Vague assertions without evidence won't defeat SJ",
        ],
      },
      {
        id: "sj-4",
        title: "Draft your Affirmation in Opposition",
        description: "Create your sworn statement responding to their application",
        details: [
          "Set out facts from YOUR perspective",
          "Exhibit documents that support your version",
          "Address each of their key factual claims",
          "Explain why the disputed facts require a trial",
          "If you need discovery to defend, explain what and why",
        ],
        documents: ["Affirmation in Opposition", "Exhibits"],
        tips: [
          "Be specific and detailed - courts need concrete facts",
          "Organize exhibits clearly with an index",
          "Use our Plain Language Translator if their legal terms confuse you",
        ],
      },
      {
        id: "sj-5",
        title: "Prepare Written Submissions",
        description: "Set out the legal arguments for why SJ should be refused",
        details: [
          "State the legal test for Summary Judgment",
          "Show how your evidence raises triable issues",
          "Argue that credibility issues require a trial",
          "If applicable, argue you need discovery first",
          "Request that SJ be dismissed with costs",
        ],
        documents: ["Written Submissions", "Authorities Bundle"],
        tips: [
          "Keep legal arguments focused on the SJ test",
          "Don't try to win your whole case - just defeat SJ",
        ],
      },
      {
        id: "sj-6",
        title: "File and serve your response",
        description: "Submit your opposition materials to court",
        details: [
          "File Affirmation and Written Submissions at court registry",
          "Serve copies on the applicant's lawyers",
          "Ensure you meet the deadline (usually 14 days before hearing)",
          "Prepare hearing bundles if required by court",
        ],
        deadline: "14 days before hearing (check directions)",
        documents: ["Affirmation", "Written Submissions", "Authorities"],
      },
      {
        id: "sj-7",
        title: "Prepare for the hearing",
        description: "Get ready to argue your case in court",
        details: [
          "Review all materials thoroughly",
          "Prepare a brief oral submission highlighting key points",
          "Anticipate what questions the judge may ask",
          "Know where key documents are in your bundle",
          "Arrive early and dress appropriately",
        ],
        tips: [
          "Practice summarizing your case in 5 minutes",
          "Focus on the strongest triable issues",
          "Stay calm and respectful in court",
        ],
      },
    ],
    relatedProcedures: ["filing-affirmation", "written-submissions", "court-hearing"],
  },
  {
    id: "discovery-process",
    title: "Discovery and Document Exchange",
    description: "Getting documents from the other side (and giving yours)",
    category: "Pre-Trial",
    difficulty: "intermediate",
    estimatedTime: "4-8 weeks",
    icon: <Search className="w-5 h-5" />,
    courtRules: ["O.24", "O.24 r.2", "O.24 r.7"],
    steps: [
      {
        id: "disc-1",
        title: "Understand your discovery obligations",
        description: "Know what you must disclose and when",
        details: [
          "You must disclose all relevant documents in your possession",
          "This includes documents that help AND hurt your case",
          "Electronic documents (emails, texts) are included",
          "Deleted documents may need to be recovered if possible",
          "Privileged documents (legal advice) can be withheld but must be listed",
        ],
        warnings: [
          "Hiding documents is a serious offence - courts can dismiss your case",
          "The other side may already have copies of documents you think are hidden",
        ],
      },
      {
        id: "disc-2",
        title: "Collect your documents",
        description: "Gather all relevant materials systematically",
        details: [
          "Search all locations where relevant documents might be",
          "Include paper files, emails, text messages, photos",
          "Check cloud storage, old phones, backup drives",
          "Ask family members or colleagues if they have relevant documents",
          "Create a master list of all documents found",
        ],
        tips: [
          "Use date ranges from the dispute to focus your search",
          "Search email by sender, recipient, and keywords",
          "Document your search process in case it's questioned",
        ],
      },
      {
        id: "disc-3",
        title: "Prepare your List of Documents",
        description: "Create the formal schedule of documents",
        details: [
          "Part 1: Documents you have and will provide",
          "Part 2: Documents you have but claim privilege over",
          "Part 3: Documents you had but no longer have",
          "Describe each document (date, type, brief description)",
          "Verify the list with a statement of truth",
        ],
        documents: ["List of Documents", "Statement of Truth"],
      },
      {
        id: "disc-4",
        title: "Exchange Lists of Documents",
        description: "Swap lists with the other side",
        details: [
          "Serve your List on the other party's lawyers",
          "Receive their List of Documents",
          "Review their list to see what they're disclosing",
          "Note any documents you expected but don't see listed",
          "Identify documents you want to inspect",
        ],
        deadline: "As directed by court (often 28-42 days after close of pleadings)",
      },
      {
        id: "disc-5",
        title: "Inspect and copy documents",
        description: "Review the other side's documents",
        details: [
          "Send a request to inspect specific documents from their list",
          "Arrange a time to view documents (or receive copies)",
          "Take copies of all relevant documents",
          "Organize documents chronologically or by topic",
          "Note any documents that seem incomplete or altered",
        ],
        tips: [
          "Ask for electronic copies where possible - easier to search",
          "Review documents systematically - don't miss important ones",
        ],
      },
      {
        id: "disc-6",
        title: "Request further documents if needed",
        description: "Ask for specific documents you believe exist",
        details: [
          "If you believe relevant documents weren't disclosed, write asking for them",
          "Be specific about what documents you're seeking",
          "Explain why you believe they exist and are relevant",
          "If refused, you may need to apply to court for specific discovery",
        ],
        documents: ["Letter requesting specific discovery", "Application for specific discovery (if needed)"],
      },
    ],
    relatedProcedures: ["specific-discovery", "privilege-claims", "evidence-bundles"],
  },
  {
    id: "preparing-for-trial",
    title: "Preparing for Trial",
    description: "Everything you need to do before your day in court",
    category: "Trial",
    difficulty: "advanced",
    estimatedTime: "4-12 weeks",
    icon: <Gavel className="w-5 h-5" />,
    courtRules: ["O.34", "O.35", "O.38"],
    steps: [
      {
        id: "trial-1",
        title: "Review all case materials",
        description: "Get completely familiar with every document",
        details: [
          "Re-read all pleadings (claim, defence, replies)",
          "Review all disclosed documents from both sides",
          "Study any witness statements filed",
          "Note the key disputed facts that will be decided at trial",
          "Identify the strongest and weakest parts of your case",
        ],
        tips: [
          "Create a chronological timeline of events",
          "Use our Timeline Builder tool to visualize the case",
          "Make a list of what you need to prove",
        ],
      },
      {
        id: "trial-2",
        title: "Prepare witness statements",
        description: "Draft formal statements for you and your witnesses",
        details: [
          "Your witness statement tells your story in your own words",
          "Cover all relevant facts in chronological order",
          "Exhibit key documents that support your evidence",
          "Keep it factual - avoid argument and speculation",
          "Get statements from other witnesses who support your case",
        ],
        documents: ["Witness Statement(s)", "Exhibits"],
        tips: [
          "Write in first person ('I saw...', 'I received...')",
          "Be specific about dates, times, and details",
          "Only include things you personally witnessed or know",
        ],
        warnings: [
          "False statements can result in criminal charges",
          "Don't coach witnesses or tell them what to say",
        ],
      },
      {
        id: "trial-3",
        title: "Prepare the trial bundle",
        description: "Compile all documents the court will need",
        details: [
          "Follow court directions on bundle format",
          "Usually organized chronologically with numbered pages",
          "Include pleadings, witness statements, and key documents",
          "Create an index at the front",
          "Remove duplicate documents",
        ],
        documents: ["Trial Bundle", "Index"],
        deadline: "Usually 7-14 days before trial",
        tips: [
          "Use our Evidence Manager to organize exhibits",
          "Make sure page numbers are clear and consistent",
          "Bring spare copies to court",
        ],
      },
      {
        id: "trial-4",
        title: "Prepare your opening",
        description: "Plan what you'll say at the start of trial",
        details: [
          "Introduce yourself and your case briefly",
          "Summarize the key facts the court will hear",
          "Explain what you're asking the court to decide",
          "Outline the evidence you'll present",
          "Keep it short and focused (5-10 minutes)",
        ],
        tips: [
          "Don't argue your case - save that for closing",
          "Help the judge understand what the dispute is about",
          "Point the judge to key documents in the bundle",
        ],
      },
      {
        id: "trial-5",
        title: "Prepare cross-examination questions",
        description: "Plan what to ask the other side's witnesses",
        details: [
          "Identify inconsistencies in their evidence",
          "Prepare questions that challenge their credibility",
          "Have documents ready to put to them",
          "Don't ask questions you don't know the answer to",
          "Focus on facts, not argument",
        ],
        tips: [
          "Use leading questions ('Isn't it true that...')",
          "One fact per question - keep them short",
          "Listen to answers and follow up if needed",
        ],
        warnings: [
          "Don't argue with witnesses",
          "Don't make accusations you can't prove",
        ],
      },
      {
        id: "trial-6",
        title: "Prepare your closing submissions",
        description: "Plan your final argument to the court",
        details: [
          "Summarize the evidence that supports your case",
          "Address weaknesses in the other side's evidence",
          "Apply the law to the facts",
          "Explain why you should win",
          "Tell the court specifically what orders you're seeking",
        ],
        tips: [
          "This is your chance to argue - use it",
          "Reference specific evidence and page numbers",
          "Be realistic about what you can prove",
        ],
      },
      {
        id: "trial-7",
        title: "Logistics and final preparation",
        description: "Handle practical matters before trial day",
        details: [
          "Confirm trial date, time, and courtroom",
          "Arrange time off work if needed",
          "Plan travel and parking/transport",
          "Prepare appropriate court attire",
          "Bring water, notepad, and all your materials",
        ],
        tips: [
          "Visit the court beforehand if you've never been",
          "Arrive at least 30 minutes early",
          "Bring copies of everything - technology fails",
        ],
      },
    ],
    relatedProcedures: ["witness-statements", "trial-bundles", "court-etiquette"],
  },
  {
    id: "filing-appeal",
    title: "Filing an Appeal",
    description: "How to challenge a court decision you disagree with",
    category: "Appeals",
    difficulty: "advanced",
    estimatedTime: "4-8 weeks",
    icon: <Scale className="w-5 h-5" />,
    courtRules: ["O.59"],
    steps: [
      {
        id: "appeal-1",
        title: "Understand grounds for appeal",
        description: "Know what can and cannot be appealed",
        details: [
          "Appeals are NOT re-trials - you can't just present your case again",
          "You must show the judge made a legal ERROR",
          "Errors include: wrong law, ignoring evidence, procedural unfairness",
          "Disagreeing with the judge's conclusions isn't enough",
          "New evidence is generally not allowed on appeal",
        ],
        warnings: [
          "Appeals are expensive and success rates are low",
          "Consider carefully whether you have genuine grounds",
          "Losing may result in paying the other side's costs",
        ],
      },
      {
        id: "appeal-2",
        title: "Obtain the judgment and transcript",
        description: "Get the documents you need to appeal",
        details: [
          "Request the written judgment from the court",
          "Order a transcript of the hearing if needed",
          "Review the judgment carefully for errors",
          "Note specific paragraphs you want to challenge",
        ],
        tips: [
          "Transcripts can be expensive - budget for this",
          "Written judgments are usually available from court registry",
        ],
      },
      {
        id: "appeal-3",
        title: "File Notice of Appeal",
        description: "Formally start the appeal process",
        details: [
          "Complete the Notice of Appeal form",
          "Set out specific grounds of appeal (what errors were made)",
          "State what orders you're seeking from the appeal court",
          "File at the appropriate appeal court",
          "Pay the filing fee",
        ],
        deadline: "Usually 28 days from judgment (check your jurisdiction)",
        documents: ["Notice of Appeal", "Court fee"],
        warnings: [
          "Missing the deadline usually means losing the right to appeal",
          "Extensions are rarely granted",
        ],
      },
      {
        id: "appeal-4",
        title: "Prepare appeal bundle",
        description: "Compile documents for the appeal court",
        details: [
          "Include the judgment being appealed",
          "Include Notice of Appeal and any responses",
          "Include relevant documents from the trial",
          "Include transcript (or relevant portions)",
          "Follow appeal court formatting requirements",
        ],
        documents: ["Appeal Bundle", "Skeleton Argument"],
      },
      {
        id: "appeal-5",
        title: "Draft Skeleton Argument",
        description: "Set out your legal arguments in writing",
        details: [
          "Summarize the factual background briefly",
          "Set out each ground of appeal clearly",
          "Explain the legal error for each ground",
          "Cite relevant legal authorities",
          "State the orders you're seeking",
        ],
        tips: [
          "Be concise - appeal courts are busy",
          "Focus on your strongest grounds",
          "Cite cases that support your position",
        ],
      },
      {
        id: "appeal-6",
        title: "Attend the appeal hearing",
        description: "Present your appeal to the judges",
        details: [
          "Usually 2-3 judges hear appeals",
          "You'll have limited time to present (often 30-60 minutes)",
          "Focus on legal errors, not re-arguing facts",
          "Be prepared to answer judges' questions",
          "The other side will respond to your arguments",
        ],
        tips: [
          "Practice your oral argument beforehand",
          "Know your skeleton argument thoroughly",
          "Respect the judges and stay calm",
        ],
      },
    ],
    relatedProcedures: ["stay-of-execution", "leave-to-appeal", "costs-appeal"],
  },
];

// Category groupings
const categories = [
  { id: "all", label: "All Procedures", icon: <BookOpen className="w-4 h-4" /> },
  { id: "Getting Started", label: "Getting Started", icon: <Target className="w-4 h-4" /> },
  { id: "Motions & Applications", label: "Motions & Applications", icon: <FileText className="w-4 h-4" /> },
  { id: "Pre-Trial", label: "Pre-Trial", icon: <Search className="w-4 h-4" /> },
  { id: "Trial", label: "Trial", icon: <Gavel className="w-4 h-4" /> },
  { id: "Appeals", label: "Appeals", icon: <Scale className="w-4 h-4" /> },
];

interface ProcedureGuideProps {
  onNavigate?: (view: string) => void;
  onAction?: (action: string, data?: any) => void;
}

export const ProcedureGuide: React.FC<ProcedureGuideProps> = ({
  onNavigate,
  onAction,
}) => {
  const [selectedProcedure, setSelectedProcedure] = React.useState<Procedure | null>(null);
  const [currentStepIndex, setCurrentStepIndex] = React.useState(0);
  const [completedSteps, setCompletedSteps] = React.useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = React.useState("");
  const [selectedCategory, setSelectedCategory] = React.useState("all");
  const [bookmarkedProcedures, setBookmarkedProcedures] = React.useState<Set<string>>(new Set());
  const [expandedSteps, setExpandedSteps] = React.useState<Set<string>>(new Set());

  // Filter procedures
  const filteredProcedures = React.useMemo(() => {
    return procedures.filter((proc) => {
      const matchesSearch =
        proc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        proc.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === "all" || proc.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, selectedCategory]);

  // Toggle step completion
  const toggleStepComplete = (stepId: string) => {
    setCompletedSteps((prev) => {
      const next = new Set(prev);
      if (next.has(stepId)) {
        next.delete(stepId);
      } else {
        next.add(stepId);
      }
      return next;
    });
  };

  // Toggle step expansion
  const toggleStepExpanded = (stepId: string) => {
    setExpandedSteps((prev) => {
      const next = new Set(prev);
      if (next.has(stepId)) {
        next.delete(stepId);
      } else {
        next.add(stepId);
      }
      return next;
    });
  };

  // Toggle bookmark
  const toggleBookmark = (procId: string) => {
    setBookmarkedProcedures((prev) => {
      const next = new Set(prev);
      if (next.has(procId)) {
        next.delete(procId);
      } else {
        next.add(procId);
      }
      return next;
    });
  };

  // Calculate progress for a procedure
  const getProcedureProgress = (proc: Procedure) => {
    const completed = proc.steps.filter((s) => completedSteps.has(s.id)).length;
    return Math.round((completed / proc.steps.length) * 100);
  };

  // Difficulty badge color
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "beginner":
        return "success";
      case "intermediate":
        return "warning";
      case "advanced":
        return "error";
      default:
        return "default";
    }
  };

  // Render procedure list
  const renderProcedureList = () => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-neutral-900">Procedure Guide</h1>
          <p className="text-neutral-500 mt-1">
            Step-by-step instructions for common legal procedures
          </p>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <SearchInput
            placeholder="Search procedures..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onClear={() => setSearchQuery("")}
          />
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors",
              selectedCategory === cat.id
                ? "bg-primary-100 text-primary-700"
                : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
            )}
          >
            {cat.icon}
            {cat.label}
          </button>
        ))}
      </div>

      {/* Bookmarked Procedures */}
      {bookmarkedProcedures.size > 0 && selectedCategory === "all" && !searchQuery && (
        <div>
          <h2 className="text-sm font-medium text-neutral-500 uppercase tracking-wide mb-3">
            Bookmarked
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {procedures
              .filter((p) => bookmarkedProcedures.has(p.id))
              .map((proc) => (
                <ProcedureCard
                  key={proc.id}
                  procedure={proc}
                  progress={getProcedureProgress(proc)}
                  isBookmarked={true}
                  onSelect={() => setSelectedProcedure(proc)}
                  onToggleBookmark={() => toggleBookmark(proc.id)}
                />
              ))}
          </div>
        </div>
      )}

      {/* All Procedures */}
      <div>
        {selectedCategory === "all" && !searchQuery && (
          <h2 className="text-sm font-medium text-neutral-500 uppercase tracking-wide mb-3">
            All Procedures
          </h2>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredProcedures.map((proc) => (
            <ProcedureCard
              key={proc.id}
              procedure={proc}
              progress={getProcedureProgress(proc)}
              isBookmarked={bookmarkedProcedures.has(proc.id)}
              onSelect={() => setSelectedProcedure(proc)}
              onToggleBookmark={() => toggleBookmark(proc.id)}
            />
          ))}
        </div>
      </div>

      {filteredProcedures.length === 0 && (
        <div className="text-center py-12">
          <BookOpen className="w-12 h-12 text-neutral-300 mx-auto mb-4" />
          <p className="text-neutral-500">No procedures found matching your search.</p>
        </div>
      )}
    </motion.div>
  );

  // Render procedure detail view
  const renderProcedureDetail = () => {
    if (!selectedProcedure) return null;

    const progress = getProcedureProgress(selectedProcedure);
    const currentStep = selectedProcedure.steps[currentStepIndex];

    return (
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        className="space-y-6"
      >
        {/* Back button and header */}
        <div className="flex items-start gap-4">
          <Button
            variant="ghost"
            size="sm"
            icon={<ArrowLeft className="w-4 h-4" />}
            onClick={() => {
              setSelectedProcedure(null);
              setCurrentStepIndex(0);
            }}
          >
            Back
          </Button>
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary-100 text-primary-600 flex items-center justify-center">
                {selectedProcedure.icon}
              </div>
              <div>
                <h1 className="text-xl font-semibold text-neutral-900">
                  {selectedProcedure.title}
                </h1>
                <p className="text-neutral-500 text-sm">{selectedProcedure.description}</p>
              </div>
            </div>
          </div>
          <button
            onClick={() => toggleBookmark(selectedProcedure.id)}
            className="p-2 rounded-lg hover:bg-neutral-100 transition-colors"
          >
            {bookmarkedProcedures.has(selectedProcedure.id) ? (
              <BookmarkCheck className="w-5 h-5 text-primary-600" />
            ) : (
              <Bookmark className="w-5 h-5 text-neutral-400" />
            )}
          </button>
        </div>

        {/* Metadata */}
        <div className="flex flex-wrap gap-3">
          <Badge variant={getDifficultyColor(selectedProcedure.difficulty)} size="sm">
            {selectedProcedure.difficulty}
          </Badge>
          <Badge variant="default" size="sm">
            <Clock className="w-3 h-3 mr-1" />
            {selectedProcedure.estimatedTime}
          </Badge>
          {selectedProcedure.courtRules?.map((rule) => (
            <Badge key={rule} variant="default" size="sm">
              {rule}
            </Badge>
          ))}
        </div>

        {/* Progress bar */}
        <div className="bg-white rounded-xl border border-neutral-200 p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-neutral-700">Your Progress</span>
            <span className="text-sm text-neutral-500">{progress}% complete</span>
          </div>
          <div className="h-2 bg-neutral-100 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-primary-500 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>

        {/* Steps */}
        <div className="space-y-3">
          <h2 className="text-sm font-medium text-neutral-500 uppercase tracking-wide">
            Steps ({selectedProcedure.steps.length})
          </h2>
          {selectedProcedure.steps.map((step, index) => {
            const isCompleted = completedSteps.has(step.id);
            const isExpanded = expandedSteps.has(step.id);
            const isCurrent = index === currentStepIndex;

            return (
              <motion.div
                key={step.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card
                  variant={isCurrent ? "elevated" : "default"}
                  className={cn(
                    "transition-all",
                    isCurrent && "ring-2 ring-primary-200"
                  )}
                >
                  <div
                    className="flex items-start gap-4 p-4 cursor-pointer"
                    onClick={() => {
                      setCurrentStepIndex(index);
                      toggleStepExpanded(step.id);
                    }}
                  >
                    {/* Step number / completion */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleStepComplete(step.id);
                      }}
                      className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-colors",
                        isCompleted
                          ? "bg-emerald-100 text-emerald-600"
                          : isCurrent
                          ? "bg-primary-100 text-primary-600"
                          : "bg-neutral-100 text-neutral-500"
                      )}
                    >
                      {isCompleted ? (
                        <CheckCircle2 className="w-5 h-5" />
                      ) : (
                        <span className="text-sm font-medium">{index + 1}</span>
                      )}
                    </button>

                    {/* Step content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3
                          className={cn(
                            "font-medium",
                            isCompleted ? "text-neutral-500 line-through" : "text-neutral-900"
                          )}
                        >
                          {step.title}
                        </h3>
                        {step.deadline && (
                          <Badge variant="warning" size="sm">
                            <Clock className="w-3 h-3 mr-1" />
                            {step.deadline}
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-neutral-500 mt-0.5">{step.description}</p>
                    </div>

                    {/* Expand arrow */}
                    <ChevronDown
                      className={cn(
                        "w-5 h-5 text-neutral-400 transition-transform",
                        isExpanded && "rotate-180"
                      )}
                    />
                  </div>

                  {/* Expanded content */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="px-4 pb-4 pt-0 ml-12 space-y-4">
                          {/* Details */}
                          <div>
                            <h4 className="text-sm font-medium text-neutral-700 mb-2">
                              What to do:
                            </h4>
                            <ul className="space-y-1.5">
                              {step.details.map((detail, i) => (
                                <li key={i} className="flex items-start gap-2 text-sm text-neutral-600">
                                  <ChevronRight className="w-4 h-4 text-neutral-400 flex-shrink-0 mt-0.5" />
                                  {detail}
                                </li>
                              ))}
                            </ul>
                          </div>

                          {/* Tips */}
                          {step.tips && step.tips.length > 0 && (
                            <div className="bg-blue-50 rounded-lg p-3">
                              <div className="flex items-center gap-2 text-blue-700 mb-2">
                                <Lightbulb className="w-4 h-4" />
                                <span className="text-sm font-medium">Tips</span>
                              </div>
                              <ul className="space-y-1">
                                {step.tips.map((tip, i) => (
                                  <li key={i} className="text-sm text-blue-700">
                                    • {tip}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {/* Warnings */}
                          {step.warnings && step.warnings.length > 0 && (
                            <div className="bg-amber-50 rounded-lg p-3">
                              <div className="flex items-center gap-2 text-amber-700 mb-2">
                                <AlertTriangle className="w-4 h-4" />
                                <span className="text-sm font-medium">Warnings</span>
                              </div>
                              <ul className="space-y-1">
                                {step.warnings.map((warning, i) => (
                                  <li key={i} className="text-sm text-amber-700">
                                    • {warning}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {/* Documents needed */}
                          {step.documents && step.documents.length > 0 && (
                            <div className="bg-neutral-50 rounded-lg p-3">
                              <div className="flex items-center gap-2 text-neutral-700 mb-2">
                                <FileText className="w-4 h-4" />
                                <span className="text-sm font-medium">Documents Needed</span>
                              </div>
                              <div className="flex flex-wrap gap-2">
                                {step.documents.map((doc, i) => (
                                  <Badge key={i} variant="default" size="sm">
                                    {doc}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Action buttons */}
                          <div className="flex gap-2 pt-2">
                            <Button
                              variant={isCompleted ? "ghost" : "primary"}
                              size="sm"
                              onClick={() => toggleStepComplete(step.id)}
                              icon={
                                isCompleted ? (
                                  <Circle className="w-4 h-4" />
                                ) : (
                                  <CheckCircle2 className="w-4 h-4" />
                                )
                              }
                            >
                              {isCompleted ? "Mark Incomplete" : "Mark Complete"}
                            </Button>
                            {step.documents && (
                              <Button
                                variant="secondary"
                                size="sm"
                                onClick={() => onAction?.("draft-document", { template: step.documents?.[0] })}
                                icon={<FileText className="w-4 h-4" />}
                              >
                                Draft Document
                              </Button>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between pt-4 border-t border-neutral-200">
          <Button
            variant="ghost"
            disabled={currentStepIndex === 0}
            onClick={() => setCurrentStepIndex((prev) => Math.max(0, prev - 1))}
            icon={<ArrowLeft className="w-4 h-4" />}
          >
            Previous Step
          </Button>
          <span className="text-sm text-neutral-500">
            Step {currentStepIndex + 1} of {selectedProcedure.steps.length}
          </span>
          <Button
            variant="ghost"
            disabled={currentStepIndex === selectedProcedure.steps.length - 1}
            onClick={() =>
              setCurrentStepIndex((prev) =>
                Math.min(selectedProcedure.steps.length - 1, prev + 1)
              )
            }
            icon={<ArrowRight className="w-4 h-4" />}
            iconPosition="right"
          >
            Next Step
          </Button>
        </div>

        {/* Related procedures */}
        {selectedProcedure.relatedProcedures && selectedProcedure.relatedProcedures.length > 0 && (
          <div className="pt-6 border-t border-neutral-200">
            <h3 className="text-sm font-medium text-neutral-500 uppercase tracking-wide mb-3">
              Related Procedures
            </h3>
            <div className="flex flex-wrap gap-2">
              {selectedProcedure.relatedProcedures.map((related) => {
                const relatedProc = procedures.find((p) => p.id === related);
                return (
                  <Button
                    key={related}
                    variant="secondary"
                    size="sm"
                    onClick={() => {
                      if (relatedProc) {
                        setSelectedProcedure(relatedProc);
                        setCurrentStepIndex(0);
                      }
                    }}
                    icon={<ArrowRight className="w-4 h-4" />}
                    iconPosition="right"
                  >
                    {relatedProc?.title || related}
                  </Button>
                );
              })}
            </div>
          </div>
        )}
      </motion.div>
    );
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <AnimatePresence mode="wait">
        {selectedProcedure ? renderProcedureDetail() : renderProcedureList()}
      </AnimatePresence>
    </div>
  );
};

// Procedure card component
interface ProcedureCardProps {
  procedure: Procedure;
  progress: number;
  isBookmarked: boolean;
  onSelect: () => void;
  onToggleBookmark: () => void;
}

const ProcedureCard: React.FC<ProcedureCardProps> = ({
  procedure,
  progress,
  isBookmarked,
  onSelect,
  onToggleBookmark,
}) => {
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "beginner":
        return "success";
      case "intermediate":
        return "warning";
      case "advanced":
        return "error";
      default:
        return "default";
    }
  };

  return (
    <motion.div
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.98 }}
    >
      <Card variant="interactive" className="h-full" onClick={onSelect}>
        <div className="p-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary-100 text-primary-600 flex items-center justify-center flex-shrink-0">
              {procedure.icon}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-medium text-neutral-900">{procedure.title}</h3>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleBookmark();
                  }}
                  className="p-1 rounded hover:bg-neutral-100 transition-colors"
                >
                  {isBookmarked ? (
                    <BookmarkCheck className="w-4 h-4 text-primary-600" />
                  ) : (
                    <Bookmark className="w-4 h-4 text-neutral-400" />
                  )}
                </button>
              </div>
              <p className="text-sm text-neutral-500 mt-0.5 line-clamp-2">
                {procedure.description}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 mt-3">
            <Badge variant={getDifficultyColor(procedure.difficulty)} size="sm">
              {procedure.difficulty}
            </Badge>
            <Badge variant="default" size="sm">
              <Clock className="w-3 h-3 mr-1" />
              {procedure.estimatedTime}
            </Badge>
            <Badge variant="default" size="sm">
              {procedure.steps.length} steps
            </Badge>
          </div>

          {progress > 0 && (
            <div className="mt-3">
              <div className="flex items-center justify-between text-xs text-neutral-500 mb-1">
                <span>Progress</span>
                <span>{progress}%</span>
              </div>
              <div className="h-1.5 bg-neutral-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary-500 rounded-full transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </Card>
    </motion.div>
  );
};
