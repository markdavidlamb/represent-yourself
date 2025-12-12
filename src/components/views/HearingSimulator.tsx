"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mic,
  MicOff,
  Play,
  Pause,
  RotateCcw,
  MessageSquare,
  User,
  Scale,
  Gavel,
  BookOpen,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Info,
  Lightbulb,
  ChevronRight,
  ChevronDown,
  Send,
  Volume2,
  VolumeX,
  Star,
  ThumbsUp,
  ThumbsDown,
  History,
  Settings,
  Award,
  Target,
  Zap,
  Brain,
  X,
} from "lucide-react";
import { Card, CardHeader, CardContent } from "../ui/Card";
import { Button } from "../ui/Button";
import { Input, TextArea } from "../ui/Input";
import { Badge } from "../ui/Badge";
import { cn } from "@/lib/utils";

// Types
type HearingType =
  | "summary_judgment"
  | "case_management"
  | "interlocutory"
  | "committal"
  | "costs"
  | "appeal"
  | "trial";

type MessageRole = "judge" | "opponent" | "user" | "system";

interface SimulationMessage {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: Date;
  feedback?: {
    score: number;
    comments: string[];
    suggestions: string[];
  };
}

interface HearingScenario {
  id: string;
  type: HearingType;
  title: string;
  description: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  duration: string;
  context: string;
  yourPosition: string;
  opponentPosition: string;
  keyIssues: string[];
  judgePersonality: string;
  commonQuestions: string[];
  tips: string[];
}

interface PracticeSession {
  id: string;
  scenarioId: string;
  startTime: Date;
  endTime?: Date;
  messages: SimulationMessage[];
  overallScore?: number;
  feedback?: string[];
  completed: boolean;
}

// Hearing scenarios
const hearingScenarios: HearingScenario[] = [
  {
    id: "sj-oppose",
    type: "summary_judgment",
    title: "Opposing Summary Judgment",
    description: "Defend against plaintiff's application for summary judgment under O.14",
    difficulty: "intermediate",
    duration: "20-30 mins",
    context:
      "Plaintiff has applied for summary judgment claiming there are no triable issues. You must show there are bona fide disputes of fact that require a trial.",
    yourPosition:
      "Defendant opposing summary judgment. You have filed an affirmation setting out your defence.",
    opponentPosition:
      "Plaintiff argues the defence has no real prospect of success and there's no other reason for trial.",
    keyIssues: [
      "Whether there are triable issues of fact",
      "Credibility of your evidence",
      "Legal merit of defence",
      "Whether conditional leave should be granted",
    ],
    judgePersonality: "Practical and efficiency-focused. Wants to understand the key disputes quickly.",
    commonQuestions: [
      "What are the triable issues in this case?",
      "What evidence supports your version of events?",
      "Why should I believe your account over the plaintiff's?",
      "If I were to give you conditional leave, what conditions would be appropriate?",
      "How long would a trial take and is it proportionate to the claim?",
    ],
    tips: [
      "Focus on specific disputed facts, not legal arguments",
      "Reference paragraph numbers in your affirmation",
      "Don't argue the merits - just show there's a genuine dispute",
      "Be ready to accept conditional leave as a fallback",
      "Acknowledge weak points but explain why trial is still needed",
    ],
  },
  {
    id: "cmc",
    type: "case_management",
    title: "Case Management Conference",
    description: "Participate in a CMC to set directions for trial preparation",
    difficulty: "beginner",
    duration: "15-20 mins",
    context:
      "First CMC in a commercial dispute. Need to agree directions for pleadings, discovery, and trial.",
    yourPosition:
      "Defendant seeking reasonable timelines for preparation. Want to ensure orderly progress.",
    opponentPosition:
      "Plaintiff wants expedited timetable and early trial date.",
    keyIssues: [
      "Discovery scope and timeline",
      "Expert evidence - number and fields",
      "Witness statements deadline",
      "Trial date and time estimate",
    ],
    judgePersonality: "Efficient, wants agreement between parties. Will impose directions if no agreement.",
    commonQuestions: [
      "Have the parties tried to agree directions?",
      "What is the realistic time estimate for trial?",
      "How many witnesses of fact?",
      "Is expert evidence really necessary?",
      "When can you be ready for trial?",
    ],
    tips: [
      "Come prepared with a draft timetable",
      "Be realistic about what you can achieve",
      "Show you've tried to agree with the other side",
      "Have fall-back positions ready",
      "Don't promise what you can't deliver",
    ],
  },
  {
    id: "committal-defend",
    type: "committal",
    title: "Defending Committal Application",
    description: "Respond to an application to commit you for contempt of court",
    difficulty: "advanced",
    duration: "30-40 mins",
    context:
      "Plaintiff alleges you breached a court order and seeks your committal to prison for contempt.",
    yourPosition:
      "You deny contempt, or argue any breach was not willful/contumacious. May seek to purge contempt.",
    opponentPosition:
      "Plaintiff says you deliberately breached a clear court order and should be punished.",
    keyIssues: [
      "Was the order clear and unambiguous?",
      "Did you have notice of the order?",
      "Was there actual breach?",
      "Was breach willful/contumacious?",
      "What is appropriate penalty if breach found?",
    ],
    judgePersonality: "Serious and careful. Criminal standard of proof applies. Will scrutinize evidence closely.",
    commonQuestions: [
      "Do you accept you were served with the order?",
      "Did you understand what the order required?",
      "Why did you not comply with paragraph X?",
      "What steps did you take to comply?",
      "Do you accept you are in breach?",
      "What do you say about appropriate penalty?",
    ],
    tips: [
      "This is quasi-criminal - take it very seriously",
      "Burden of proof is on the applicant to criminal standard",
      "Challenge unclear or ambiguous orders",
      "If breach occurred, show it wasn't willful",
      "Apologize and purge contempt if appropriate",
      "Consider whether to give evidence",
    ],
  },
  {
    id: "security-costs",
    type: "interlocutory",
    title: "Security for Costs Application",
    description: "Apply for security for costs against the plaintiff",
    difficulty: "intermediate",
    duration: "20-30 mins",
    context:
      "You are applying for security for costs on the basis that the plaintiff is ordinarily resident outside Hong Kong and/or has insufficient assets.",
    yourPosition:
      "Defendant seeking HK$X security. Plaintiff is BVI company with no assets in jurisdiction.",
    opponentPosition:
      "Plaintiff argues security would stifle a genuine claim and they can pay costs.",
    keyIssues: [
      "Jurisdictional gateway (O.23 r.1)",
      "Discretion factors",
      "Amount of security",
      "Whether security would stifle claim",
    ],
    judgePersonality: "Balanced, wants to ensure justice for both sides. Will scrutinize financial evidence.",
    commonQuestions: [
      "What is the jurisdictional basis for this application?",
      "What evidence is there that costs cannot be recovered?",
      "Has the plaintiff provided any evidence of ability to pay?",
      "Would an order stifle a genuine claim?",
      "What amount of security do you seek and how is it calculated?",
    ],
    tips: [
      "Establish the O.23 gateway clearly",
      "Provide detailed costs estimate",
      "Anticipate stifling argument",
      "Consider offering staged security",
      "Be ready with evidence of plaintiff's financial position",
    ],
  },
];

interface HearingSimulatorProps {
  onNavigate?: (view: string) => void;
  onAction?: (action: string, data?: any) => void;
}

export const HearingSimulator: React.FC<HearingSimulatorProps> = ({
  onNavigate,
  onAction,
}) => {
  // State
  const [view, setView] = React.useState<"select" | "practice" | "review">("select");
  const [selectedScenario, setSelectedScenario] = React.useState<HearingScenario | null>(null);
  const [currentSession, setCurrentSession] = React.useState<PracticeSession | null>(null);
  const [messages, setMessages] = React.useState<SimulationMessage[]>([]);
  const [userInput, setUserInput] = React.useState("");
  const [isThinking, setIsThinking] = React.useState(false);
  const [isPaused, setIsPaused] = React.useState(false);
  const [showTips, setShowTips] = React.useState(true);
  const [pastSessions, setPastSessions] = React.useState<PracticeSession[]>([]);
  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  // Scroll to bottom of messages
  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Start a new practice session
  const startSession = (scenario: HearingScenario) => {
    const session: PracticeSession = {
      id: Date.now().toString(),
      scenarioId: scenario.id,
      startTime: new Date(),
      messages: [],
      completed: false,
    };

    setSelectedScenario(scenario);
    setCurrentSession(session);
    setMessages([]);
    setView("practice");

    // Initial judge introduction
    setTimeout(() => {
      addMessage({
        role: "system",
        content: `Practice Session: ${scenario.title}\n\nScenario: ${scenario.context}\n\nYour Position: ${scenario.yourPosition}`,
      });

      setTimeout(() => {
        addMessage({
          role: "judge",
          content: getJudgeOpening(scenario),
        });
      }, 1000);
    }, 500);
  };

  // Get judge opening based on scenario
  const getJudgeOpening = (scenario: HearingScenario): string => {
    const openings: Record<HearingType, string> = {
      summary_judgment:
        "Good morning. This is the plaintiff's summons for summary judgment under Order 14. I have read the papers. Mr/Ms [Defendant], you are the respondent to this application. I understand you oppose summary judgment being entered. What do you say?",
      case_management:
        "This is the first Case Management Conference in this matter. I see from the papers this is a commercial dispute. Have the parties been able to agree directions?",
      interlocutory:
        "I have before me an interlocutory summons. I have read the affirmations filed. Counsel for the applicant, please summarize your application briefly.",
      committal:
        "This is a serious matter - an application to commit for contempt of court. The standard of proof is the criminal standard. I will hear from the applicant first, then the respondent will have full opportunity to respond. Counsel?",
      costs:
        "This is an application concerning costs. I have read the submissions. What are the key issues between the parties on costs?",
      appeal:
        "This is an appeal from the decision of [lower court/judge]. I have read the papers including the judgment below. Counsel for the appellant, what are your grounds?",
      trial:
        "This trial is now ready to proceed. I have read the opening skeleton arguments. Are there any preliminary matters before opening submissions?",
    };
    return openings[scenario.type] || "Please proceed with your submissions.";
  };

  // Add a message to the conversation
  const addMessage = (msg: Omit<SimulationMessage, "id" | "timestamp">) => {
    const message: SimulationMessage = {
      ...msg,
      id: Date.now().toString(),
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, message]);
  };

  // Handle user submission
  const handleSubmit = async () => {
    if (!userInput.trim() || !selectedScenario) return;

    const input = userInput.trim();
    setUserInput("");

    // Add user message
    addMessage({
      role: "user",
      content: input,
    });

    // Generate AI response
    setIsThinking(true);
    await new Promise((resolve) => setTimeout(resolve, 1500 + Math.random() * 1500));

    // Generate contextual response based on scenario
    const response = generateResponse(selectedScenario, input, messages);
    addMessage(response);

    setIsThinking(false);
  };

  // Generate AI response
  const generateResponse = (
    scenario: HearingScenario,
    userInput: string,
    context: SimulationMessage[]
  ): Omit<SimulationMessage, "id" | "timestamp"> => {
    const inputLower = userInput.toLowerCase();
    const messageCount = context.filter((m) => m.role === "user").length;

    // Check for specific keywords and respond accordingly
    if (inputLower.includes("triable issue") || inputLower.includes("dispute")) {
      return {
        role: "judge",
        content:
          "Yes, but what specifically is disputed? Point me to the paragraphs in your affirmation that set out your version of the key facts. I need to understand what exactly would need to be determined at trial.",
        feedback: {
          score: 7,
          comments: ["Good to raise triable issues", "Need more specificity"],
          suggestions: ["Reference specific paragraph numbers", "Identify the factual disputes clearly"],
        },
      };
    }

    if (inputLower.includes("affirmation") || inputLower.includes("paragraph")) {
      return {
        role: "judge",
        content:
          "I see. And what do you say to the plaintiff's response to that point at paragraph [X] of their affirmation in reply?",
        feedback: {
          score: 8,
          comments: ["Good use of documentary reference", "Clear presentation"],
          suggestions: ["Be ready to address counter-arguments"],
        },
      };
    }

    if (inputLower.includes("credib") || inputLower.includes("believe")) {
      return {
        role: "judge",
        content:
          "I accept that credibility is often a matter for trial. But summary judgment can still be appropriate if the defendant's account is wholly incredible or unsupported by any documentation. Why should I accept your account has sufficient substance?",
        feedback: {
          score: 6,
          comments: ["Credibility argument noted"],
          suggestions: ["Back up with documentary evidence", "Don't rely solely on credibility"],
        },
      };
    }

    if (inputLower.includes("conditional") || inputLower.includes("leave")) {
      return {
        role: "judge",
        content:
          "If I were minded to grant conditional leave to defend, what conditions would be appropriate? The plaintiff suggests payment into court of 50% of the claim. What do you say to that?",
        feedback: {
          score: 7,
          comments: ["Good to have fallback position"],
          suggestions: [
            "Be ready with alternative conditions",
            "Explain why lower amount is appropriate",
          ],
        },
      };
    }

    // Opponent interjection
    if (messageCount > 2 && messageCount % 3 === 0) {
      return {
        role: "opponent",
        content: getOpponentInterjection(scenario),
      };
    }

    // Default judge responses based on message count
    const judgeResponses = [
      "I see. What else do you rely on?",
      "How does that address the plaintiff's point about [X]?",
      "Is there any documentary evidence that supports your position?",
      "What about the email at page [X] of the bundle?",
      "Let me hear from the plaintiff on that point... [Opponent responds briefly]. What do you say to that?",
      "I'm not sure that takes you very far. What's your strongest point?",
      "Very well. Is there anything else you wish to add before I give my decision?",
    ];

    return {
      role: "judge",
      content: judgeResponses[Math.min(messageCount, judgeResponses.length - 1)],
      feedback: {
        score: 5 + Math.floor(Math.random() * 3),
        comments: ["Keep developing your argument"],
        suggestions: ["Be more specific", "Use evidence references"],
      },
    };
  };

  // Get opponent interjection
  const getOpponentInterjection = (scenario: HearingScenario): string => {
    const interjections = [
      "My Lord/Lady, if I may interject briefly - the defendant has not addressed paragraph 15 of our evidence which directly contradicts their account.",
      "With respect, that submission is inconsistent with the contemporaneous documents at pages 45-48 of the bundle.",
      "The defendant's assertion is simply not supported by any documentary evidence whatsoever.",
      "My Lord/Lady, we say this is precisely the sort of defence that has no real substance - it is a bare denial.",
    ];
    return interjections[Math.floor(Math.random() * interjections.length)];
  };

  // End session
  const endSession = () => {
    if (currentSession) {
      const completedSession: PracticeSession = {
        ...currentSession,
        endTime: new Date(),
        messages,
        completed: true,
        overallScore: calculateOverallScore(),
        feedback: generateSessionFeedback(),
      };
      setPastSessions((prev) => [completedSession, ...prev]);
      setCurrentSession(completedSession);
      setView("review");
    }
  };

  // Calculate overall score
  const calculateOverallScore = (): number => {
    const scoredMessages = messages.filter((m) => m.feedback?.score);
    if (scoredMessages.length === 0) return 0;
    const total = scoredMessages.reduce((sum, m) => sum + (m.feedback?.score || 0), 0);
    return Math.round(total / scoredMessages.length);
  };

  // Generate session feedback
  const generateSessionFeedback = (): string[] => {
    return [
      "Good engagement with the judge's questions",
      "Consider using more specific document references",
      "Strong on identifying triable issues",
      "Could improve on addressing opponent's counter-arguments",
      "Well-paced submissions - neither too fast nor too slow",
    ];
  };

  // Render scenario selection
  const renderScenarioSelection = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-neutral-900">Hearing Simulator</h1>
          <p className="text-neutral-500 mt-1">
            Practice courtroom submissions with AI-powered scenarios
          </p>
        </div>
        {pastSessions.length > 0 && (
          <Button
            variant="secondary"
            icon={<History className="w-4 h-4" />}
          >
            Past Sessions ({pastSessions.length})
          </Button>
        )}
      </div>

      {/* Info Card */}
      <Card className="bg-gradient-to-r from-primary-50 to-indigo-50 border-primary-100">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary-100 text-primary-600 flex items-center justify-center flex-shrink-0">
              <Brain className="w-6 h-6" />
            </div>
            <div>
              <h2 className="font-semibold text-neutral-900 mb-1">Build Confidence</h2>
              <p className="text-neutral-600 text-sm">
                Practice makes perfect. These simulations help you prepare for common hearing
                scenarios. The AI judge will ask realistic questions and challenge your arguments.
                You'll receive feedback on your responses.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Scenario Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {hearingScenarios.map((scenario) => (
          <ScenarioCard
            key={scenario.id}
            scenario={scenario}
            onClick={() => startSession(scenario)}
          />
        ))}
      </div>

      {/* Tips */}
      <Card className="bg-blue-50 border-blue-100">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Lightbulb className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-medium text-blue-900 mb-2">General Advocacy Tips</h3>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Address the judge as "My Lord" or "My Lady" (or "Sir" in District Court)</li>
                <li>• Stand when speaking, sit when others speak</li>
                <li>• Speak slowly and clearly - the judge may be taking notes</li>
                <li>• If you don't understand a question, ask for clarification</li>
                <li>• Acknowledge valid points but explain why they don't defeat your case</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  // Render practice view
  const renderPracticeView = () => {
    if (!selectedScenario) return null;

    return (
      <div className="h-[calc(100vh-120px)] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-neutral-200">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              icon={<X className="w-4 h-4" />}
              onClick={() => {
                if (confirm("End this practice session?")) {
                  endSession();
                }
              }}
            >
              End
            </Button>
            <div>
              <h1 className="font-semibold text-neutral-900">{selectedScenario.title}</h1>
              <p className="text-sm text-neutral-500">{selectedScenario.type.replace("_", " ")}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge
              variant={
                selectedScenario.difficulty === "beginner"
                  ? "success"
                  : selectedScenario.difficulty === "intermediate"
                  ? "warning"
                  : "error"
              }
            >
              {selectedScenario.difficulty}
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowTips(!showTips)}
              icon={<Lightbulb className={cn("w-4 h-4", showTips && "text-amber-500")} />}
            >
              Tips
            </Button>
          </div>
        </div>

        <div className="flex-1 flex gap-4 pt-4 overflow-hidden">
          {/* Chat Area */}
          <div className="flex-1 flex flex-col">
            {/* Messages */}
            <div className="flex-1 overflow-y-auto space-y-4 pb-4">
              {messages.map((msg) => (
                <MessageBubble key={msg.id} message={msg} />
              ))}

              {isThinking && (
                <div className="flex items-center gap-2 text-neutral-500">
                  <div className="flex gap-1">
                    <motion.div
                      className="w-2 h-2 bg-neutral-400 rounded-full"
                      animate={{ y: [0, -5, 0] }}
                      transition={{ duration: 0.5, repeat: Infinity }}
                    />
                    <motion.div
                      className="w-2 h-2 bg-neutral-400 rounded-full"
                      animate={{ y: [0, -5, 0] }}
                      transition={{ duration: 0.5, repeat: Infinity, delay: 0.1 }}
                    />
                    <motion.div
                      className="w-2 h-2 bg-neutral-400 rounded-full"
                      animate={{ y: [0, -5, 0] }}
                      transition={{ duration: 0.5, repeat: Infinity, delay: 0.2 }}
                    />
                  </div>
                  <span className="text-sm">Judge is considering...</span>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="pt-4 border-t border-neutral-200">
              <div className="flex gap-2">
                <TextArea
                  placeholder="Type your submission... (Press Enter to send)"
                  rows={3}
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSubmit();
                    }
                  }}
                  className="flex-1"
                />
                <div className="flex flex-col gap-2">
                  <Button
                    variant="primary"
                    onClick={handleSubmit}
                    disabled={!userInput.trim() || isThinking}
                    icon={<Send className="w-4 h-4" />}
                  >
                    Submit
                  </Button>
                </div>
              </div>
              <p className="text-xs text-neutral-400 mt-2">
                Tip: Be formal and address the judge appropriately. Reference documents by page number.
              </p>
            </div>
          </div>

          {/* Tips Panel */}
          {showTips && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 300, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              className="w-[300px] flex-shrink-0 overflow-hidden"
            >
              <Card className="h-full">
                <CardHeader
                  title="Scenario Tips"
                  icon={<Lightbulb className="w-4 h-4 text-amber-500" />}
                />
                <CardContent className="p-4 space-y-4 overflow-y-auto max-h-[calc(100%-60px)]">
                  <div>
                    <h4 className="text-sm font-medium text-neutral-700 mb-2">Key Issues</h4>
                    <ul className="text-sm text-neutral-600 space-y-1">
                      {selectedScenario.keyIssues.map((issue, i) => (
                        <li key={i}>• {issue}</li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-neutral-700 mb-2">Common Questions</h4>
                    <ul className="text-sm text-neutral-600 space-y-2">
                      {selectedScenario.commonQuestions.slice(0, 3).map((q, i) => (
                        <li key={i} className="p-2 bg-neutral-50 rounded text-xs">
                          "{q}"
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-neutral-700 mb-2">Tips</h4>
                    <ul className="text-sm text-neutral-600 space-y-1">
                      {selectedScenario.tips.map((tip, i) => (
                        <li key={i} className="flex items-start gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-500 mt-1 flex-shrink-0" />
                          <span>{tip}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>
      </div>
    );
  };

  // Render review view
  const renderReviewView = () => {
    if (!currentSession || !selectedScenario) return null;

    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-neutral-900">Session Review</h1>
            <p className="text-neutral-500 mt-1">{selectedScenario.title}</p>
          </div>
          <Button variant="primary" onClick={() => setView("select")} icon={<RotateCcw className="w-4 h-4" />}>
            New Session
          </Button>
        </div>

        {/* Score */}
        <Card className="bg-gradient-to-r from-primary-50 to-indigo-50">
          <CardContent className="p-8 text-center">
            <div className="w-24 h-24 rounded-full bg-white shadow-lg flex items-center justify-center mx-auto mb-4">
              <span className="text-4xl font-bold text-primary-600">
                {currentSession.overallScore}/10
              </span>
            </div>
            <h2 className="text-xl font-semibold text-neutral-900 mb-2">
              {currentSession.overallScore && currentSession.overallScore >= 7
                ? "Well Done!"
                : currentSession.overallScore && currentSession.overallScore >= 5
                ? "Good Effort"
                : "Keep Practicing"}
            </h2>
            <p className="text-neutral-600">
              You completed {messages.filter((m) => m.role === "user").length} submissions
            </p>
          </CardContent>
        </Card>

        {/* Feedback */}
        <Card>
          <CardHeader title="Session Feedback" />
          <CardContent className="p-4">
            <ul className="space-y-2">
              {currentSession.feedback?.map((fb, i) => (
                <li key={i} className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-1" />
                  <span className="text-neutral-700">{fb}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Transcript */}
        <Card>
          <CardHeader title="Session Transcript" />
          <CardContent className="p-4 space-y-3 max-h-96 overflow-y-auto">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={cn(
                  "p-3 rounded-lg",
                  msg.role === "judge"
                    ? "bg-purple-50"
                    : msg.role === "user"
                    ? "bg-primary-50"
                    : msg.role === "opponent"
                    ? "bg-red-50"
                    : "bg-neutral-50"
                )}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className={cn(
                      "text-xs font-medium uppercase",
                      msg.role === "judge"
                        ? "text-purple-600"
                        : msg.role === "user"
                        ? "text-primary-600"
                        : msg.role === "opponent"
                        ? "text-red-600"
                        : "text-neutral-500"
                    )}
                  >
                    {msg.role === "user" ? "You" : msg.role}
                  </span>
                  {msg.feedback && (
                    <Badge variant="default" size="sm">
                      {msg.feedback.score}/10
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-neutral-700 whitespace-pre-wrap">{msg.content}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    );
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <AnimatePresence mode="wait">
        {view === "select" && renderScenarioSelection()}
        {view === "practice" && renderPracticeView()}
        {view === "review" && renderReviewView()}
      </AnimatePresence>
    </div>
  );
};

// Scenario Card Component
interface ScenarioCardProps {
  scenario: HearingScenario;
  onClick: () => void;
}

const ScenarioCard: React.FC<ScenarioCardProps> = ({ scenario, onClick }) => {
  const typeIcons: Record<HearingType, React.ReactNode> = {
    summary_judgment: <Gavel className="w-5 h-5" />,
    case_management: <Scale className="w-5 h-5" />,
    interlocutory: <BookOpen className="w-5 h-5" />,
    committal: <AlertTriangle className="w-5 h-5" />,
    costs: <Target className="w-5 h-5" />,
    appeal: <ChevronRight className="w-5 h-5" />,
    trial: <Scale className="w-5 h-5" />,
  };

  const difficultyColors = {
    beginner: "bg-emerald-100 text-emerald-700",
    intermediate: "bg-amber-100 text-amber-700",
    advanced: "bg-red-100 text-red-700",
  };

  return (
    <motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }}>
      <Card variant="interactive" onClick={onClick}>
        <CardContent className="p-5">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center flex-shrink-0">
              {typeIcons[scenario.type]}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold text-neutral-900">{scenario.title}</h3>
                <span
                  className={cn(
                    "text-xs px-2 py-0.5 rounded-full font-medium",
                    difficultyColors[scenario.difficulty]
                  )}
                >
                  {scenario.difficulty}
                </span>
              </div>
              <p className="text-sm text-neutral-500 line-clamp-2">{scenario.description}</p>
              <div className="flex items-center gap-3 mt-3 text-xs text-neutral-400">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {scenario.duration}
                </span>
                <span className="capitalize">{scenario.type.replace("_", " ")}</span>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-neutral-400" />
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

// Message Bubble Component
interface MessageBubbleProps {
  message: SimulationMessage;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const isUser = message.role === "user";
  const isSystem = message.role === "system";

  if (isSystem) {
    return (
      <div className="p-4 bg-neutral-100 rounded-lg text-sm text-neutral-600 whitespace-pre-wrap">
        <Info className="w-4 h-4 inline mr-2" />
        {message.content}
      </div>
    );
  }

  return (
    <div className={cn("flex gap-3", isUser && "flex-row-reverse")}>
      <div
        className={cn(
          "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0",
          message.role === "judge"
            ? "bg-purple-100 text-purple-600"
            : message.role === "opponent"
            ? "bg-red-100 text-red-600"
            : "bg-primary-100 text-primary-600"
        )}
      >
        {message.role === "judge" ? (
          <Gavel className="w-4 h-4" />
        ) : message.role === "opponent" ? (
          <User className="w-4 h-4" />
        ) : (
          <User className="w-4 h-4" />
        )}
      </div>
      <div className={cn("max-w-[70%]", isUser && "text-right")}>
        <span
          className={cn(
            "text-xs font-medium uppercase",
            message.role === "judge"
              ? "text-purple-600"
              : message.role === "opponent"
              ? "text-red-600"
              : "text-primary-600"
          )}
        >
          {message.role === "user" ? "You" : message.role === "judge" ? "Judge" : "Opposing Counsel"}
        </span>
        <div
          className={cn(
            "mt-1 p-3 rounded-lg text-sm",
            message.role === "judge"
              ? "bg-purple-50 text-purple-900"
              : message.role === "opponent"
              ? "bg-red-50 text-red-900"
              : "bg-primary-50 text-primary-900"
          )}
        >
          {message.content}
        </div>
        {message.feedback && isUser && (
          <div className="mt-2 p-2 bg-neutral-50 rounded text-xs">
            <div className="flex items-center gap-2 mb-1">
              <Star className="w-3 h-3 text-amber-500" />
              <span className="font-medium">Score: {message.feedback.score}/10</span>
            </div>
            {message.feedback.suggestions.length > 0 && (
              <p className="text-neutral-500">{message.feedback.suggestions[0]}</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
