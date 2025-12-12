/**
 * AI Service
 * Uses Claude OAuth for authentication - no API keys needed!
 * Also supports ChatGPT (OpenAI) and Mistral (coming soon) with API keys.
 */

import { callClaudeWithOAuth, isAuthenticated as isClaudeAuthenticated, getAccessToken } from "./claude-oauth";

export type AIProvider = "claude" | "openai" | "mistral";

// Storage keys
const PROVIDER_KEY = "ai_provider";
const OPENAI_KEY = "openai_api_key";
const MISTRAL_KEY = "mistral_api_key";

// Default models
const MODELS = {
  claude: "claude-sonnet-4-20250514",
  openai: "gpt-4o",
  mistral: "mistral-large-latest",
};

// Get/set provider
export function getProvider(): AIProvider {
  if (typeof window === "undefined") return "claude";
  return (localStorage.getItem(PROVIDER_KEY) as AIProvider) || "claude";
}

export function setProvider(provider: AIProvider): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(PROVIDER_KEY, provider);
}

// Get/set API keys (only for non-Claude providers now)
export function getApiKey(provider?: AIProvider): string | null {
  if (typeof window === "undefined") return null;
  const p = provider || getProvider();
  if (p === "claude") {
    // Claude uses OAuth now, not API keys
    return isClaudeAuthenticated() ? "oauth" : null;
  }
  const keys = { claude: "", openai: OPENAI_KEY, mistral: MISTRAL_KEY };
  return localStorage.getItem(keys[p]);
}

export function setApiKey(key: string, provider?: AIProvider): void {
  if (typeof window === "undefined") return;
  const p = provider || getProvider();
  if (p === "claude") return; // Claude uses OAuth
  const keys = { claude: "", openai: OPENAI_KEY, mistral: MISTRAL_KEY };
  localStorage.setItem(keys[p], key);
}

export function hasApiKey(provider?: AIProvider): boolean {
  const p = provider || getProvider();
  if (p === "claude") return isClaudeAuthenticated();
  return !!getApiKey(provider);
}

export function clearApiKey(provider?: AIProvider): void {
  if (typeof window === "undefined") return;
  const p = provider || getProvider();
  if (p === "claude") return; // Use signOut() from claude-oauth for Claude
  const keys = { claude: "", openai: OPENAI_KEY, mistral: MISTRAL_KEY };
  localStorage.removeItem(keys[p]);
}

// Claude API call - now uses OAuth
async function callClaude(systemPrompt: string, userMessage: string, maxTokens: number): Promise<string> {
  return callClaudeWithOAuth(systemPrompt, userMessage, maxTokens);
}

// OpenAI API call
async function callOpenAI(systemPrompt: string, userMessage: string, maxTokens: number): Promise<string> {
  const apiKey = getApiKey("openai");
  if (!apiKey) throw new Error("No OpenAI API key configured");

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: MODELS.openai,
      max_tokens: maxTokens,
      temperature: 0.3,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userMessage },
      ],
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: { message: response.statusText } }));
    throw new Error(error.error?.message || `OpenAI API error: ${response.status}`);
  }

  const data = await response.json();
  return data.choices[0]?.message?.content || "";
}

// Main AI call function - routes to correct provider
export async function callAI(
  systemPrompt: string,
  userMessage: string,
  options?: { maxTokens?: number }
): Promise<string> {
  const provider = getProvider();
  const maxTokens = options?.maxTokens || 4096;

  if (provider === "mistral") {
    throw new Error("Mistral support coming soon! Please use Claude or ChatGPT for now.");
  }

  if (provider === "openai") {
    return callOpenAI(systemPrompt, userMessage, maxTokens);
  }

  return callClaude(systemPrompt, userMessage, maxTokens);
}

// Legal document generation prompts
export const LEGAL_PROMPTS = {
  affidavit: `You are an expert legal document drafter specializing in Hong Kong civil litigation.
Your task is to draft a professional Affidavit/Affirmation based on the user's inputs.

IMPORTANT FORMATTING RULES:
- Use proper Hong Kong court document format
- Number all paragraphs sequentially starting from 1
- Use formal legal language but keep it clear
- Include all required sections: heading, introduction, substantive paragraphs, conclusion
- Leave placeholders like [YOUR NAME] where user needs to fill in personal details
- Each fact should be in its own numbered paragraph
- Include proper jurat (signature block) at the end
- Format dates as "the X day of [MONTH] [YEAR]"

The document should be ready to file with minimal editing.`,

  submission: `You are an expert legal document drafter specializing in Hong Kong civil litigation.
Your task is to draft professional Written Submissions based on the user's inputs.

IMPORTANT FORMATTING RULES:
- Use proper Hong Kong court submission format
- Number all paragraphs sequentially
- Structure: Introduction, Background, Issues, Arguments, Conclusion
- Cite legal principles where appropriate (use general principles if specific cases not provided)
- Use formal legal language
- Make arguments persuasive but professional
- Include a prayer for relief at the end

The document should be ready to file with minimal editing.`,

  skeleton: `You are an expert legal document drafter specializing in Hong Kong civil litigation.
Your task is to draft a Skeleton Argument based on the user's inputs.

IMPORTANT FORMATTING RULES:
- Keep it concise - skeleton arguments should be brief
- Use bullet points and numbered lists
- Focus on key legal issues and authorities
- Structure: Issues, Key Authorities, Brief Arguments, Conclusions
- Each point should be self-contained
- Typically 3-5 pages maximum

The document should be ready to file with minimal editing.`,

  letter: `You are an expert legal document drafter specializing in Hong Kong civil litigation.
Your task is to draft a formal Letter to Court based on the user's inputs.

IMPORTANT FORMATTING RULES:
- Use proper formal letter format
- Address to the relevant court registry
- Be clear and concise
- Include case number prominently in the subject line
- Professional but not overly formal tone
- Clear statement of what is being requested
- Include proper sign-off

The document should be ready to send with minimal editing.`,

  response: `You are an expert legal document drafter specializing in Hong Kong civil litigation.
Your task is to draft a Response/Reply document based on the user's inputs.

IMPORTANT FORMATTING RULES:
- Address each point raised by the opposing party
- Number paragraphs to correspond with original document where relevant
- Use formal legal language
- Structure: Introduction, Response to Points, Counter-Arguments, Conclusion
- Be professional - attack arguments not people
- Include prayer for relief

The document should be ready to file with minimal editing.`,
};

export async function generateLegalDocument(
  documentType: keyof typeof LEGAL_PROMPTS,
  caseInfo: {
    caseNumber: string;
    court: string;
    yourRole: string;
    opposingParty: string;
  },
  facts: string[]
): Promise<string> {
  const systemPrompt = LEGAL_PROMPTS[documentType];

  const userMessage = `Please draft a ${documentType} with the following details:

CASE INFORMATION:
- Case Number: ${caseInfo.caseNumber || "[TO BE ADDED]"}
- Court: ${caseInfo.court || "High Court of Hong Kong"}
- My Role: ${caseInfo.yourRole || "Plaintiff"}
- Opposing Party: ${caseInfo.opposingParty || "[OPPOSING PARTY]"}

KEY POINTS/FACTS TO INCLUDE:
${facts.filter(f => f.trim()).map((f, i) => `${i + 1}. ${f}`).join("\n")}

Please generate a complete, professionally formatted ${documentType} ready for filing. Do not include any preamble or explanation - output only the document itself.`;

  return callAI(systemPrompt, userMessage, { maxTokens: 4096 });
}

// AI Assistant chat
export async function chatWithAssistant(
  message: string,
  context?: string
): Promise<string> {
  const systemPrompt = `You are a helpful AI legal assistant for self-represented litigants in Hong Kong courts.

Your role is to:
- Explain legal concepts in plain English
- Help users understand court procedures
- Provide general guidance on their cases
- Help draft and review legal documents
- Answer questions about Hong Kong civil procedure rules

IMPORTANT:
- You are not a lawyer and cannot provide legal advice
- Users should verify important information with qualified legal professionals
- Your responses are for guidance only
- Be specific to Hong Kong law and procedure where relevant

Be helpful, clear, and supportive. Many users are stressed and dealing with complex legal matters for the first time.`;

  const userMessage = context
    ? `Context: ${context}\n\nUser question: ${message}`
    : message;

  return callAI(systemPrompt, userMessage, { maxTokens: 2048 });
}

// Document Analysis - analyze uploaded documents
export async function analyzeDocument(
  documentText: string,
  documentName: string
): Promise<{
  summary: string;
  documentType: string;
  keyPoints: string[];
  parties: string[];
  dates: string[];
  legalIssues: string[];
  suggestedActions: string[];
}> {
  const systemPrompt = `You are an expert legal document analyst specializing in Hong Kong litigation.
Your task is to analyze legal documents and extract key information.

ALWAYS respond with valid JSON in this exact format:
{
  "summary": "A 2-3 sentence summary of the document",
  "documentType": "The type of document (e.g., Affidavit, Witness Statement, Court Order, Contract, Letter)",
  "keyPoints": ["Key point 1", "Key point 2", ...],
  "parties": ["Party 1", "Party 2", ...],
  "dates": ["Important date 1", "Important date 2", ...],
  "legalIssues": ["Legal issue 1", "Legal issue 2", ...],
  "suggestedActions": ["Suggested action 1", "Suggested action 2", ...]
}

Be thorough but concise. Focus on actionable insights for a self-represented litigant.`;

  const userMessage = `Please analyze this document titled "${documentName}":

${documentText}

Provide your analysis in the required JSON format.`;

  const response = await callAI(systemPrompt, userMessage, { maxTokens: 2048 });

  try {
    // Try to parse the JSON response
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    throw new Error("Invalid response format");
  } catch {
    // Return a structured response if JSON parsing fails
    return {
      summary: response.substring(0, 500),
      documentType: "Unknown",
      keyPoints: [],
      parties: [],
      dates: [],
      legalIssues: [],
      suggestedActions: [],
    };
  }
}

// Case Strength Analysis
export async function analyzeCaseStrength(
  caseDescription: string,
  evidence: string[],
  opposingArguments?: string
): Promise<{
  overallAssessment: string;
  strengthScore: number;
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  riskFactors: string[];
}> {
  const systemPrompt = `You are an expert legal analyst specializing in Hong Kong civil litigation.
Your task is to provide an honest assessment of case strength for self-represented litigants.

ALWAYS respond with valid JSON in this exact format:
{
  "overallAssessment": "A balanced 2-3 sentence assessment",
  "strengthScore": 65,
  "strengths": ["Strength 1", "Strength 2", ...],
  "weaknesses": ["Weakness 1", "Weakness 2", ...],
  "recommendations": ["Recommendation 1", "Recommendation 2", ...],
  "riskFactors": ["Risk 1", "Risk 2", ...]
}

strengthScore should be 0-100 where:
- 0-30: Very weak case
- 31-50: Weak case with some merit
- 51-70: Moderate case
- 71-85: Strong case
- 86-100: Very strong case

Be honest and balanced. Don't give false hope but also highlight genuine strengths.`;

  const userMessage = `Please analyze the strength of this case:

CASE DESCRIPTION:
${caseDescription}

EVIDENCE/SUPPORTING MATERIALS:
${evidence.map((e, i) => `${i + 1}. ${e}`).join("\n")}

${opposingArguments ? `OPPOSING PARTY'S ARGUMENTS:\n${opposingArguments}` : ""}

Provide your analysis in the required JSON format.`;

  const response = await callAI(systemPrompt, userMessage, { maxTokens: 2048 });

  try {
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    throw new Error("Invalid response format");
  } catch {
    return {
      overallAssessment: response.substring(0, 500),
      strengthScore: 50,
      strengths: [],
      weaknesses: [],
      recommendations: [],
      riskFactors: [],
    };
  }
}

// Plain Language Translation
export async function translateToPlainLanguage(
  legalText: string
): Promise<{
  plainEnglish: string;
  keyTerms: Array<{ term: string; definition: string }>;
  whatThisMeans: string;
  actionRequired?: string;
}> {
  const systemPrompt = `You are a legal translator specializing in explaining Hong Kong legal documents to non-lawyers.
Your task is to translate complex legal language into plain, everyday English.

ALWAYS respond with valid JSON in this exact format:
{
  "plainEnglish": "The full text translated into simple, clear language",
  "keyTerms": [
    {"term": "Legal term", "definition": "Simple explanation"},
    ...
  ],
  "whatThisMeans": "A practical summary of what this means for the reader",
  "actionRequired": "Any actions the reader needs to take (or null if none)"
}

Use simple words. Avoid jargon. Explain like you're talking to a friend who has never dealt with legal matters.`;

  const userMessage = `Please translate this legal text into plain English:

${legalText}

Provide your translation in the required JSON format.`;

  const response = await callAI(systemPrompt, userMessage, { maxTokens: 2048 });

  try {
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    throw new Error("Invalid response format");
  } catch {
    return {
      plainEnglish: response,
      keyTerms: [],
      whatThisMeans: "Please review the translation above.",
      actionRequired: undefined,
    };
  }
}

// Discovery Response Helper
export async function helpWithDiscovery(
  discoveryRequest: string,
  yourDocuments: string[]
): Promise<{
  analysis: string;
  relevantDocuments: Array<{ document: string; relevance: string; privilege?: string }>;
  suggestedResponse: string;
  objections: string[];
  warnings: string[];
}> {
  const systemPrompt = `You are an expert in Hong Kong civil procedure, specifically discovery/disclosure obligations.
Your task is to help self-represented litigants respond to discovery requests properly.

ALWAYS respond with valid JSON in this exact format:
{
  "analysis": "Analysis of what the discovery request is asking for",
  "relevantDocuments": [
    {"document": "Document name", "relevance": "Why it's relevant", "privilege": "Any privilege that might apply"},
    ...
  ],
  "suggestedResponse": "A suggested response format",
  "objections": ["Valid objection 1", "Valid objection 2", ...],
  "warnings": ["Important warning 1", "Important warning 2", ...]
}

Remember:
- Discovery obligations in HK are serious - advise on compliance
- Legal professional privilege protects lawyer-client communications
- "Without prejudice" communications are protected
- Be thorough but practical`;

  const userMessage = `Please help me respond to this discovery request:

DISCOVERY REQUEST:
${discoveryRequest}

MY DOCUMENTS/MATERIALS:
${yourDocuments.map((d, i) => `${i + 1}. ${d}`).join("\n")}

Provide your analysis in the required JSON format.`;

  const response = await callAI(systemPrompt, userMessage, { maxTokens: 2048 });

  try {
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    throw new Error("Invalid response format");
  } catch {
    return {
      analysis: response,
      relevantDocuments: [],
      suggestedResponse: "",
      objections: [],
      warnings: [],
    };
  }
}

// Motion/Application Response Generator
export async function generateMotionResponse(
  motionType: string,
  opposingMotion: string,
  yourPosition: string,
  supportingFacts: string[]
): Promise<string> {
  const systemPrompt = `You are an expert legal drafter specializing in Hong Kong civil litigation.
Your task is to draft responses to motions/applications filed by opposing parties.

IMPORTANT FORMATTING RULES:
- Use proper Hong Kong court document format
- Number all paragraphs sequentially
- Be professional and factual - attack arguments, not people
- Structure: Introduction, Response to Each Ground, Your Position, Conclusion
- Include relevant legal principles where applicable
- Reference Hong Kong Rules of High Court where relevant

The document should be ready to file with minimal editing.`;

  const userMessage = `Please draft a response to this ${motionType}:

OPPOSING PARTY'S MOTION/APPLICATION:
${opposingMotion}

MY POSITION:
${yourPosition}

SUPPORTING FACTS:
${supportingFacts.map((f, i) => `${i + 1}. ${f}`).join("\n")}

Draft a complete response document ready for filing.`;

  return callAI(systemPrompt, userMessage, { maxTokens: 4096 });
}

// Timeline Event Analysis
export async function analyzeTimelineForDeadlines(
  events: Array<{ date: string; event: string }>
): Promise<{
  analysis: string;
  upcomingDeadlines: Array<{ date: string; deadline: string; priority: "high" | "medium" | "low" }>;
  missedDeadlines: string[];
  recommendations: string[];
}> {
  const systemPrompt = `You are an expert in Hong Kong civil procedure timelines and deadlines.
Your task is to analyze case timelines and identify important deadlines.

ALWAYS respond with valid JSON in this exact format:
{
  "analysis": "Overview of the timeline and its significance",
  "upcomingDeadlines": [
    {"date": "YYYY-MM-DD", "deadline": "Description", "priority": "high/medium/low"},
    ...
  ],
  "missedDeadlines": ["Description of any missed deadlines"],
  "recommendations": ["Recommendation 1", "Recommendation 2", ...]
}

Key HK deadlines to watch for:
- 14 days to file defence after acknowledgment of service
- 28 days to acknowledge service
- Various interlocutory application deadlines
- Appeal deadlines (28 days from judgment)`;

  const userMessage = `Please analyze this case timeline:

EVENTS:
${events.map((e) => `${e.date}: ${e.event}`).join("\n")}

Provide your analysis in the required JSON format.`;

  const response = await callAI(systemPrompt, userMessage, { maxTokens: 2048 });

  try {
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    throw new Error("Invalid response format");
  } catch {
    return {
      analysis: response,
      upcomingDeadlines: [],
      missedDeadlines: [],
      recommendations: [],
    };
  }
}

// =====================================================
// DEEP CASE UNDERSTANDING - MAXIMIZE AI UTILIZATION
// =====================================================

/**
 * Deep Document Analysis - Comprehensive analysis of uploaded documents
 * This extracts maximum insight from every document to truly understand the case
 */
export async function deepAnalyzeDocument(
  documentText: string,
  documentName: string,
  existingCaseContext?: string
): Promise<{
  summary: string;
  documentType: string;
  author: string;
  recipient: string;
  dateOfDocument: string;
  keyFacts: Array<{ fact: string; importance: "critical" | "important" | "supporting"; confidence: number }>;
  parties: Array<{ name: string; role: string; stance: string }>;
  claims: Array<{ claim: string; evidence: string; counterargument?: string }>;
  dates: Array<{ date: string; event: string; significance: string }>;
  legalIssues: Array<{ issue: string; relevantLaw: string; yourPosition: string; theirPosition: string }>;
  evidence: Array<{ description: string; type: string; strength: "strong" | "moderate" | "weak"; location: string }>;
  procedural: { currentStage: string; nextSteps: string[]; deadlines: string[] };
  credibility: { issues: string[]; strengths: string[] };
  strategyImplications: string[];
  questionsRaised: string[];
  suggestedActions: Array<{ action: string; priority: "urgent" | "high" | "medium" | "low"; deadline?: string }>;
  relationToOtherDocs?: string;
}> {
  const systemPrompt = `You are an expert legal analyst with deep expertise in civil litigation.
Your task is to perform EXHAUSTIVE analysis of legal documents to help self-represented litigants truly understand their cases.

CRITICAL: You must extract MAXIMUM insight from every document. Do not hold back - the user needs complete understanding.

ALWAYS respond with valid JSON in this exact format:
{
  "summary": "A comprehensive 3-5 sentence summary capturing the document's purpose and key content",
  "documentType": "Specific type (e.g., 'Affidavit in Support of Summary Judgment', 'Interlocutory Summons', 'Witness Statement')",
  "author": "Who wrote/signed this document",
  "recipient": "Who is this document addressed to (court, party, etc.)",
  "dateOfDocument": "The date on the document (YYYY-MM-DD format)",
  "keyFacts": [
    {"fact": "Specific factual assertion", "importance": "critical/important/supporting", "confidence": 0.9},
    ...
  ],
  "parties": [
    {"name": "Party name", "role": "Plaintiff/Defendant/etc", "stance": "Their position in this matter"},
    ...
  ],
  "claims": [
    {"claim": "Legal claim made", "evidence": "Evidence supporting it", "counterargument": "How to counter if adverse"},
    ...
  ],
  "dates": [
    {"date": "YYYY-MM-DD", "event": "What happened", "significance": "Why it matters"},
    ...
  ],
  "legalIssues": [
    {"issue": "Legal issue", "relevantLaw": "Applicable law/rules", "yourPosition": "Favorable interpretation", "theirPosition": "Opposing interpretation"},
    ...
  ],
  "evidence": [
    {"description": "What the evidence shows", "type": "Documentary/Testimonial/Physical", "strength": "strong/moderate/weak", "location": "Where in document"},
    ...
  ],
  "procedural": {
    "currentStage": "Where is this case procedurally",
    "nextSteps": ["What needs to happen next", ...],
    "deadlines": ["Any deadlines mentioned or implied", ...]
  },
  "credibility": {
    "issues": ["Any credibility problems with this document/party", ...],
    "strengths": ["Credibility strengths", ...]
  },
  "strategyImplications": ["What this means for case strategy", ...],
  "questionsRaised": ["Questions that need answers", ...],
  "suggestedActions": [
    {"action": "What to do", "priority": "urgent/high/medium/low", "deadline": "If applicable"},
    ...
  ],
  "relationToOtherDocs": "How this relates to other case documents (if context provided)"
}

Be THOROUGH. Extract EVERY relevant detail. The user's case depends on understanding everything.`;

  const userMessage = `Please perform EXHAUSTIVE analysis of this document titled "${documentName}":

${existingCaseContext ? `EXISTING CASE CONTEXT:\n${existingCaseContext}\n\n` : ""}DOCUMENT TO ANALYZE:
${documentText}

Extract MAXIMUM insight. Do not hold back - the user needs to understand everything about this document.
Provide your analysis in the required JSON format.`;

  const response = await callAI(systemPrompt, userMessage, { maxTokens: 8192 });

  try {
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    throw new Error("Invalid response format");
  } catch {
    return {
      summary: response.substring(0, 1000),
      documentType: "Unknown",
      author: "Unknown",
      recipient: "Unknown",
      dateOfDocument: "",
      keyFacts: [],
      parties: [],
      claims: [],
      dates: [],
      legalIssues: [],
      evidence: [],
      procedural: { currentStage: "Unknown", nextSteps: [], deadlines: [] },
      credibility: { issues: [], strengths: [] },
      strategyImplications: [],
      questionsRaised: [],
      suggestedActions: [],
    };
  }
}

/**
 * Build Comprehensive Case Profile - Analyze all documents together
 * This is called after each document upload to update the case understanding
 */
export async function buildCaseProfile(
  documents: Array<{ name: string; summary: string; type: string; keyFacts: string[] }>,
  existingProfile?: any
): Promise<{
  caseSummary: string;
  parties: Array<{ name: string; role: string; interests: string; strengths: string[]; weaknesses: string[] }>;
  timeline: Array<{ date: string; event: string; type: "court" | "opposing" | "yours" | "victory" | "upcoming"; significance: string }>;
  claims: Array<{ claim: string; status: string; evidence: string[]; counterEvidence: string[] }>;
  legalIssues: Array<{ issue: string; favorableArguments: string[]; unfavorableArguments: string[]; keyAuthorities: string[] }>;
  yourStrengths: string[];
  yourWeaknesses: string[];
  theirStrengths: string[];
  theirWeaknesses: string[];
  riskAssessment: { overallRisk: "high" | "medium" | "low"; factors: string[] };
  strategy: { recommended: string; alternatives: string[]; warnings: string[] };
  nextActions: Array<{ action: string; priority: "urgent" | "high" | "medium" | "low"; deadline?: string; reason: string }>;
  gaps: { missingEvidence: string[]; unansweredQuestions: string[]; potentialIssues: string[] };
}> {
  const systemPrompt = `You are an expert litigation strategist building a comprehensive case profile.
Your task is to synthesize all available documents into a complete understanding of the case.

CRITICAL: Build a COMPLETE picture that helps the user understand:
- Where they stand
- What's working for them
- What's working against them
- What they need to do next
- What risks they face
- What strategy to pursue

ALWAYS respond with valid JSON in this exact format:
{
  "caseSummary": "A comprehensive summary of the entire case as it stands",
  "parties": [
    {"name": "Party name", "role": "Their role", "interests": "What they want", "strengths": ["..."], "weaknesses": ["..."]},
    ...
  ],
  "timeline": [
    {"date": "YYYY-MM-DD", "event": "What happened", "type": "court/opposing/yours/victory/upcoming", "significance": "Why it matters"},
    ...
  ],
  "claims": [
    {"claim": "The legal claim", "status": "Active/Dismissed/Pending", "evidence": ["Supporting evidence"], "counterEvidence": ["Evidence against"]},
    ...
  ],
  "legalIssues": [
    {"issue": "Legal issue", "favorableArguments": ["..."], "unfavorableArguments": ["..."], "keyAuthorities": ["Cases/statutes"]},
    ...
  ],
  "yourStrengths": ["Your advantages", ...],
  "yourWeaknesses": ["Your vulnerabilities", ...],
  "theirStrengths": ["Opponent's advantages", ...],
  "theirWeaknesses": ["Opponent's vulnerabilities", ...],
  "riskAssessment": {
    "overallRisk": "high/medium/low",
    "factors": ["Risk factor 1", ...]
  },
  "strategy": {
    "recommended": "The recommended approach",
    "alternatives": ["Alternative strategies"],
    "warnings": ["What to watch out for"]
  },
  "nextActions": [
    {"action": "What to do", "priority": "urgent/high/medium/low", "deadline": "If any", "reason": "Why this matters"},
    ...
  ],
  "gaps": {
    "missingEvidence": ["Evidence you need"],
    "unansweredQuestions": ["Questions needing answers"],
    "potentialIssues": ["Problems to address"]
  }
}

Be strategic and practical. The user needs actionable guidance.`;

  const userMessage = `Build a comprehensive case profile from these documents:

DOCUMENTS IN CASE:
${documents.map((d, i) => `
${i + 1}. ${d.name} (${d.type})
Summary: ${d.summary}
Key Facts: ${d.keyFacts.join("; ")}
`).join("\n")}

${existingProfile ? `PREVIOUS PROFILE TO UPDATE:\n${JSON.stringify(existingProfile, null, 2)}\n` : ""}

Build a COMPLETE case profile. Provide your analysis in the required JSON format.`;

  const response = await callAI(systemPrompt, userMessage, { maxTokens: 8192 });

  try {
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    throw new Error("Invalid response format");
  } catch {
    return {
      caseSummary: response.substring(0, 1000),
      parties: [],
      timeline: [],
      claims: [],
      legalIssues: [],
      yourStrengths: [],
      yourWeaknesses: [],
      theirStrengths: [],
      theirWeaknesses: [],
      riskAssessment: { overallRisk: "medium", factors: [] },
      strategy: { recommended: "", alternatives: [], warnings: [] },
      nextActions: [],
      gaps: { missingEvidence: [], unansweredQuestions: [], potentialIssues: [] },
    };
  }
}

/**
 * Strategic Case Analysis - Deep strategic thinking about the case
 */
export async function strategicAnalysis(
  caseProfile: any,
  specificQuestion?: string
): Promise<{
  analysis: string;
  winProbability: number;
  bestOutcome: string;
  worstOutcome: string;
  likelyOutcome: string;
  criticalFactors: string[];
  opponentStrategy: string;
  counterStrategy: string;
  negotiationPosition: { minimum: string; target: string; walkaway: string };
  immediateActions: string[];
  longTermStrategy: string;
}> {
  const systemPrompt = `You are a senior litigation strategist providing strategic analysis.
Be HONEST and REALISTIC. The user needs truth, not false hope.

ALWAYS respond with valid JSON:
{
  "analysis": "Deep strategic analysis",
  "winProbability": 65,
  "bestOutcome": "Best realistic outcome",
  "worstOutcome": "Worst realistic outcome",
  "likelyOutcome": "Most probable outcome",
  "criticalFactors": ["Factors that will decide the case"],
  "opponentStrategy": "What the opponent is likely doing",
  "counterStrategy": "How to counter their strategy",
  "negotiationPosition": {
    "minimum": "Walk-away point",
    "target": "What to aim for",
    "walkaway": "When to walk away"
  },
  "immediateActions": ["Do this now"],
  "longTermStrategy": "Overall approach"
}

winProbability: 0-100 based on honest assessment. Don't inflate.`;

  const userMessage = `Provide strategic analysis for this case:

CASE PROFILE:
${JSON.stringify(caseProfile, null, 2)}

${specificQuestion ? `SPECIFIC QUESTION: ${specificQuestion}\n` : ""}

Be HONEST. What are the realistic prospects? What should the user actually do?`;

  const response = await callAI(systemPrompt, userMessage, { maxTokens: 4096 });

  try {
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    throw new Error("Invalid response format");
  } catch {
    return {
      analysis: response,
      winProbability: 50,
      bestOutcome: "",
      worstOutcome: "",
      likelyOutcome: "",
      criticalFactors: [],
      opponentStrategy: "",
      counterStrategy: "",
      negotiationPosition: { minimum: "", target: "", walkaway: "" },
      immediateActions: [],
      longTermStrategy: "",
    };
  }
}

/**
 * Generate Questions for User - Help user understand what AI needs to know
 */
export async function generateClarifyingQuestions(
  caseProfile: any,
  recentDocument?: string
): Promise<{
  criticalQuestions: Array<{ question: string; why: string; impact: string }>;
  backgroundQuestions: Array<{ question: string; category: string }>;
  documentRequests: Array<{ document: string; reason: string; priority: string }>;
}> {
  const systemPrompt = `You are helping a self-represented litigant understand what information they need to provide.
Generate smart questions that will help build a complete picture of their case.

ALWAYS respond with valid JSON:
{
  "criticalQuestions": [
    {"question": "Question to ask", "why": "Why this matters", "impact": "How the answer affects the case"},
    ...
  ],
  "backgroundQuestions": [
    {"question": "Background question", "category": "Category"},
    ...
  ],
  "documentRequests": [
    {"document": "Document needed", "reason": "Why needed", "priority": "high/medium/low"},
    ...
  ]
}

Ask questions that will reveal crucial case information.`;

  const userMessage = `Based on this case profile, what questions should I ask the user?

CURRENT CASE PROFILE:
${JSON.stringify(caseProfile, null, 2)}

${recentDocument ? `RECENT DOCUMENT UPLOADED:\n${recentDocument}\n` : ""}

What do we need to know to truly understand this case?`;

  const response = await callAI(systemPrompt, userMessage, { maxTokens: 2048 });

  try {
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    throw new Error("Invalid response format");
  } catch {
    return {
      criticalQuestions: [],
      backgroundQuestions: [],
      documentRequests: [],
    };
  }
}

// Provider info for UI
export const PROVIDERS = [
  {
    id: "claude" as AIProvider,
    name: "Claude",
    company: "Anthropic",
    description: "Best for legal writing - sign in with your Claude account",
    available: true,
    keyPlaceholder: "", // No API key needed - uses OAuth
    usesOAuth: true,
  },
  {
    id: "openai" as AIProvider,
    name: "ChatGPT",
    company: "OpenAI",
    description: "Popular and versatile AI assistant",
    available: true,
    keyPlaceholder: "sk-...",
    usesOAuth: false,
  },
  {
    id: "mistral" as AIProvider,
    name: "Mistral",
    company: "Mistral AI",
    description: "Coming soon - European AI model",
    available: false,
    keyPlaceholder: "",
    usesOAuth: false,
  },
];
