# Represent Yourself - Product Specification

## Executive Summary

**Represent Yourself** is an AI-powered legal assistant designed specifically for self-represented litigants (pro se / litigants in person). It combines document generation, case analysis, and procedural guidance into a native desktop application that helps ordinary people navigate complex legal proceedings without expensive legal representation.

---

## Problem Statement

### The Access to Justice Gap

1. **Legal representation is unaffordable** - Average hourly rates for lawyers range from $200-$500+. A typical civil case costs $10,000-$50,000+ in legal fees.

2. **Self-representation is overwhelming** - Court procedures, legal terminology, document formatting, and deadlines create massive barriers for non-lawyers.

3. **Existing tools are inadequate** - Legal templates are generic. ChatGPT gives generic answers. Neither understands your specific case context.

4. **Information asymmetry** - Opposing parties with lawyers have massive advantages in knowing procedures, deadlines, and effective arguments.

---

## Solution

**Represent Yourself** provides:

- **Deep case understanding** - Upload all your documents once, AI builds comprehensive case profile
- **Document generation** - Court-ready documents with proper formatting and legal language
- **Procedural guidance** - Step-by-step guidance through court procedures
- **Strategic analysis** - Honest assessment of case strengths, weaknesses, and risks
- **Deadline management** - Never miss a filing deadline
- **Hearing preparation** - Mock hearings and cross-examination practice

---

## Target Users

### Primary: Self-Represented Litigants

- **Civil litigation** defendants/plaintiffs
- **Family law** (divorce, custody, child support)
- **Employment disputes** (wrongful termination, discrimination)
- **Landlord-tenant** disputes
- **Small claims** escalated to higher courts
- **Consumer protection** cases

### User Personas

**1. Sarah - Divorce Litigant**
- Going through contested divorce
- Spouse has lawyer, she doesn't
- Needs help with financial disclosures, custody arrangements
- Budget: Can't afford $300/hour lawyer

**2. Marcus - Employment Dispute**
- Wrongfully terminated, filed complaint
- Company responded with motion to dismiss
- Needs to file opposition within 14 days
- Has evidence but doesn't know how to present it

**3. Chen - Landlord Dispute**
- Suing landlord for security deposit
- Case escalated beyond small claims
- Intimidated by formal court procedures
- English is second language

### Secondary: Legal Aid Organizations

- Provide tool to clients they can't fully represent
- Training resource for pro bono attorneys
- Intake and case assessment assistance

---

## Product Architecture

### Platform Strategy

```
                    REPRESENT YOURSELF

    +--------------+    +--------------+    +----------+
    |  Mac App     |    |  Windows App |    |  Web App |
    |  (Electron)  |    |  (Electron)  |    |  (Next)  |
    +--------------+    +--------------+    +----------+
           |                   |                  |
           +-------------------+------------------+
                               |
                     +---------v---------+
                     |   Next.js 14      |
                     |   React + TS      |
                     +---------+---------+
                               |
           +-------------------+-------------------+
           |                   |                   |
    +------v------+    +-------v-------+   +------v-----+
    |  AI Layer   |    |  Storage      |   | Integrations|
    |  - Claude   |    |  - LocalStore |   |  - Gmail    |
    |  - Gemini   |    |  - IndexedDB  |   |  - Drive    |
    |  - Ollama   |    |  - File System|   |  - Calendar |
    +-------------+    +---------------+   +------------+
```

### Technical Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| **Frontend** | Next.js 14, React 18, TypeScript | App framework |
| **Styling** | Tailwind CSS, Radix UI | Design system |
| **Desktop** | Electron 28 | Native Mac/Windows apps |
| **State** | Zustand + localStorage | Client-side persistence |
| **AI** | Claude API, Gemini API, Ollama | LLM providers |
| **Integrations** | Google APIs (Gmail, Drive, Calendar) | Productivity |
| **PDF** | pdf.js, pdf-lib | Document handling |

### Data Architecture

```
User Data (100% Client-Side)
|
+-- Case Profile
|   +-- Parties (plaintiffs, defendants, lawyers)
|   +-- Court details (case number, judge, jurisdiction)
|   +-- Procedural history
|   +-- Related proceedings
|
+-- Documents
|   +-- Uploaded files (PDF, DOCX, images)
|   +-- AI analysis results
|   +-- Generated drafts
|   +-- Filed documents
|
+-- Exhibits
|   +-- Exhibit metadata
|   +-- Bundles
|   +-- Page references
|
+-- Timeline
|   +-- Events (filings, hearings, deadlines)
|   +-- AI-extracted dates
|   +-- User-added events
|
+-- Configuration
    +-- AI provider settings
    +-- Google OAuth tokens
    +-- UI preferences
```

---

## Feature Set

### Phase 1: Core (Current)

#### 1. Case Setup & Onboarding
- AI-powered setup wizard
- Upload documents, AI extracts case details
- Guided questions to fill gaps
- Auto-generates case profile

#### 2. Document Drafting
- **5 document types:**
  - Affidavit/Affirmation
  - Written Submissions
  - Skeleton Arguments
  - Letter to Court
  - Response/Reply
- Step-by-step wizard interface
- Court-specific formatting
- Export to DOCX/PDF

#### 3. Document Analysis
- Upload any legal document
- AI extracts:
  - Document type and purpose
  - Key facts and dates
  - Legal issues raised
  - Required responses
  - Deadlines triggered

#### 4. Evidence Management
- Exhibit cataloging with metadata
- Bundle creation for hearings
- Page numbering and indexing
- Status tracking (draft to filed to admitted)

#### 5. Timeline Builder
- Chronological case visualization
- Event categorization (court/opposing/yours/victory)
- Deadline highlighting
- AI-assisted date extraction from documents

#### 6. AI Assistant Chat
- Context-aware legal Q&A
- Knows your case details
- Explains procedures in plain English
- Suggests next steps

#### 7. Plain Language Translator
- Paste legal jargon, get plain English
- Key term glossary
- "What this means for you" summary
- Action items extraction

### Phase 2: Strategic Tools

#### 8. Case Analyzer
- Comprehensive strength/weakness assessment
- Risk scoring (0-100)
- Win probability estimation
- Strategic recommendations

#### 9. Procedure Guide
- Court-specific procedure handbook
- Step-by-step filing instructions
- Form requirements
- Fee schedules

#### 10. Discovery Helper
- Analyze discovery requests
- Identify responsive documents
- Draft objections
- Privilege log assistance

#### 11. Motion Response Wizard
- Parse opposing motions
- Generate point-by-point responses
- Legal authority suggestions
- Filing checklist

#### 12. Deadline Calculator
- Auto-calculate procedural deadlines
- Calendar integration
- Reminder notifications
- "Days remaining" tracking

### Phase 3: Advanced Features

#### 13. Hearing Simulator
- Mock hearing practice
- AI plays opposing counsel
- Cross-examination prep
- Judge Q&A simulation

#### 14. Opponent Intelligence
- Track opposing party patterns
- Analyze their filing history
- Predict likely arguments
- Identify weaknesses

#### 15. Settlement Calculator
- Model settlement scenarios
- Risk-adjusted valuations
- Negotiation ranges
- Walk-away points

#### 16. Risk Scorecard
- Multi-factor risk assessment
- Litigation cost projections
- Outcome probability matrix
- Decision support

#### 17. Legal GPS
- Visual case navigation
- "You are here" indicator
- Next steps guidance
- Milestone tracking

#### 18. Bundle Generator
- Auto-generate hearing bundles
- Court-compliant formatting
- Index generation
- Paginated PDF output

### Phase 4: Integrations

#### 19. Gmail Integration
- Monitor case-related emails
- Auto-categorize by sender
- Extract deadlines from emails
- Draft responses

#### 20. Google Drive Integration
- Sync documents to Drive
- Collaborative editing
- Version history
- Backup protection

#### 21. Calendar Integration
- Sync deadlines and hearings
- Reminder scheduling
- Preparation timelines

---

## User Experience

### Design Principles

1. **Calm, not overwhelming** - Legal matters are stressful. UI should feel supportive, not add anxiety.

2. **Guide, don't dump** - Never show 50 options at once. Progressive disclosure with clear next steps.

3. **Plain language first** - Explain everything in plain English. Legal terms always have definitions.

4. **Mobile-ready but desktop-focused** - Legal work needs big screens. Mobile for reference only.

5. **Offline-capable** - Documents and case data work offline. AI features need connection.

### Navigation Structure

```
+----------------------------------------------------------+
|  [Logo]  Represent Yourself              [Cmd+K] [gear]  |
+---------------+------------------------------------------+
|               |                                          |
|  OVERVIEW     |                                          |
|  o Dashboard  |         MAIN CONTENT AREA                |
|  o My Case    |                                          |
|               |         - Views render here              |
|  PREPARE      |         - Full width                     |
|  o Documents  |         - Scrollable                     |
|  o Evidence   |                                          |
|  o Timeline   |                                          |
|               |                                          |
|  ANALYZE      |                                          |
|  o Case       |                                          |
|  o Arguments  |                                          |
|  o Opponent   |                                          |
|               |                                          |
|  TOOLS        |                                          |
|  o AI Chat    |                                          |
|  o Translate  |                                          |
|  o Deadlines  |                                          |
|  o Procedure  |                                          |
|               |                                          |
|  ------------ |                                          |
|  o Settings   |                                          |
|               |                                          |
+---------------+------------------------------------------+
```

### Key Flows

#### Flow 1: First-Time Setup
```
Welcome Screen
    |
    v
"Do you have case documents?"
    |
    +-- Yes --> Upload Documents --> AI Processing --> Review Extracted Info
    |                                                        |
    |                                                        v
    |                                              Clarifying Questions
    |                                                        |
    +-- No --> Manual Case Entry ----------------------------+
                                                             |
                                                             v
                                                     Case Profile Created
                                                             |
                                                             v
                                                        Dashboard
```

#### Flow 2: Document Generation
```
"Generate Document"
    |
    v
Select Type (Affidavit, Submission, etc.)
    |
    v
Wizard Step 1: Basic Info (auto-filled from case)
    |
    v
Wizard Step 2: Key Facts (checkboxes + custom)
    |
    v
Wizard Step 3: Arguments/Position
    |
    v
AI Generates Draft
    |
    v
Review & Edit
    |
    +-- Regenerate Section
    +-- Edit Manually
    +-- Export (DOCX/PDF)
```

---

## AI Strategy

### Strategic Foundation

**Core Decision: API-First, Not Open Source**

Open-source LLMs are a margin-expansion tool, not a foundation:
- At low user counts, APIs are significantly cheaper
- Fixed infrastructure costs for self-hosted: $3,500-8,000+/month
- API costs at early stage: $400-900/month
- Open-source only becomes economical at large, predictable scale

**Why Not Self-Hosted Open Source:**
- High fixed infrastructure costs
- DevOps + ML maintenance burden
- Lower reasoning reliability for legal tasks
- Silent failures are unacceptable in legal products
- No frontier open model can run locally (Qwen3-235B needs 4-8x H100 GPUs)

### Three-Layer Model Architecture

Users choose **quality tier**, not models. The system routes intelligently.

```
┌─────────────────────────────────────────────────────────────┐
│                    USER QUALITY SELECTION                    │
│                                                              │
│   [ Standard ]     [ Professional ]     [ Premium ]          │
│      Free             $0.10/doc           $0.25/doc          │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│              LAYER 1: INGESTION & STRUCTURING               │
│                        (Cheap Model)                         │
│                                                              │
│  • OCR and text extraction                                   │
│  • Timeline extraction                                       │
│  • Entity recognition (parties, dates, amounts)              │
│  • Document classification                                   │
│  • Metadata extraction                                       │
│                                                              │
│  Model: Gemini Flash / GPT-4o-mini                          │
│  Cost: ~$0.001-0.005 per document                           │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│             LAYER 2: LEGAL REASONING & DRAFTING             │
│                      (Premium Model)                         │
│                                                              │
│  • Document generation (affidavits, submissions)             │
│  • Case strength analysis                                    │
│  • Argument identification                                   │
│  • Strategic recommendations                                 │
│  • Motion response drafting                                  │
│                                                              │
│  Standard: Claude Sonnet (default)                          │
│  Premium: Claude Opus (high-stakes toggle)                  │
│  Cost: $0.01-0.10 per generation                            │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│            LAYER 3: VERIFICATION & CONSISTENCY              │
│                      (Cheap Model)                           │
│                                                              │
│  • Citation checking                                         │
│  • Internal consistency validation                           │
│  • Format compliance                                         │
│  • Deadline verification                                     │
│  • Cross-reference validation                                │
│                                                              │
│  Model: Gemini Flash / GPT-4o-mini                          │
│  Cost: ~$0.001-0.005 per check                              │
└─────────────────────────────────────────────────────────────┘
```

### Context Window Strategy

**Critical Insight: Large context ≠ legal reasoning quality**

No model (open or closed) should ingest an entire lawsuit at once. The correct approach:

```
┌─────────────────────────────────────────────────────────────┐
│                 STRUCTURED CASE MEMORY                       │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Case Profile (always in context)                           │
│  ├── Parties & roles                                        │
│  ├── Key dates & deadlines                                  │
│  ├── Current procedural status                              │
│  ├── Core claims & defenses                                 │
│  └── Strengths & weaknesses summary                         │
│                                                              │
│  RAG Layer (retrieved on demand)                            │
│  ├── Full document text (chunked, embedded)                 │
│  ├── Exhibit contents                                       │
│  ├── Previous filings                                       │
│  └── Relevant case law                                      │
│                                                              │
│  Multi-Pass Drafting                                        │
│  ├── Pass 1: Outline generation                             │
│  ├── Pass 2: Section-by-section drafting                    │
│  ├── Pass 3: Integration & consistency                      │
│  └── Pass 4: Final verification                             │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Quality Tiers (User-Facing)

| Tier | What User Sees | Backend Reality | Price |
|------|----------------|-----------------|-------|
| **Standard** | "Good for drafts" | Gemini + Sonnet | Free (limited) |
| **Professional** | "Recommended" | Gemini + Sonnet + verification | $0.10/doc |
| **Premium** | "Best quality" | Gemini + Opus + verification | $0.25/doc |

Users never see model names. They see quality and use-case descriptions.

### Provider Stack

**Layer 1 & 3 (Cheap Operations):**
- Primary: Google Gemini 1.5 Flash
- Fallback: OpenAI GPT-4o-mini
- Cost: ~$0.075/1M input, $0.30/1M output

**Layer 2 (Legal Reasoning):**
- Standard: Claude 3.5 Sonnet
- Premium: Claude Opus 4
- Cost: Sonnet ~$3/1M input, $15/1M output
- Cost: Opus ~$15/1M input, $75/1M output

### Cost Model

**Per-User Economics (Moderate Usage):**

| Component | Calls/Month | Cost/Call | Monthly |
|-----------|-------------|-----------|---------|
| Ingestion (Gemini) | 50 | $0.002 | $0.10 |
| Reasoning (Sonnet) | 30 | $0.05 | $1.50 |
| Verification (Gemini) | 30 | $0.002 | $0.06 |
| **Total COGS/user** | | | **~$1.70** |

**Platform Economics:**

| Users | Monthly AI COGS | Infra | Total |
|-------|-----------------|-------|-------|
| 100 | $170 | $50 | $220 |
| 1,000 | $1,700 | $100 | $1,800 |
| 10,000 | $17,000 | $500 | $17,500 |

**Compare to Self-Hosted:**
- Minimum viable GPU setup: $3,500/month
- Breakeven vs API: ~2,000+ active users
- And still inferior reasoning quality

### Important Distinctions

**Claude Max ≠ Claude API**
- Claude Max = subscription for claude.ai web usage
- Claude API = separate billing, requires $5 minimum credit
- They are completely separate products

**Ollama/Local = Privacy Option Only**
- Not a cost savings
- Not better quality
- Useful for: users who cannot send data to cloud
- We support it but don't recommend it

### Model Routing Logic

```
function selectModel(task, tier, sensitivity) {
  // Layer 1: Always cheap
  if (task in ['ocr', 'extract', 'classify']) {
    return 'gemini-flash';
  }

  // Layer 2: Based on tier
  if (task in ['draft', 'analyze', 'strategize']) {
    if (tier === 'premium') return 'claude-opus';
    return 'claude-sonnet';
  }

  // Layer 3: Always cheap
  if (task in ['verify', 'check', 'validate']) {
    return 'gemini-flash';
  }

  // Privacy override
  if (sensitivity === 'high' && user.hasOllama) {
    return 'ollama-local';
  }
}
```

### Future: When to Add Open Source

Open source becomes viable when:
1. **Volume**: 5,000+ active users
2. **Predictability**: Stable usage patterns
3. **Use case**: Bulk processing, not frontier reasoning
4. **Team**: Dedicated ML ops capability

Target open-source use cases:
- Document OCR at scale
- Embedding generation
- Classification/routing
- NOT legal reasoning or drafting

---

## Jurisdictions

### Phase 1: Hong Kong
- High Court Civil Procedure Rules
- District Court Rules
- Lands Tribunal
- Labour Tribunal

### Phase 2: UK
- Civil Procedure Rules (CPR)
- Family Procedure Rules
- Employment Tribunals

### Phase 3: US
- Federal Rules of Civil Procedure
- State-specific rules (California, New York, Texas priority)

### Phase 4: Other Common Law
- Australia
- Canada
- Singapore

---

## Privacy & Security

### Data Handling Principles

1. **Client-side first** - All case data stored locally in browser/app
2. **No server storage** - We never store your documents or case details
3. **Encrypted in transit** - All API calls over HTTPS
4. **Minimal AI sharing** - Only send what's needed for each request
5. **Optional local AI** - Ollama option for complete privacy

### What Gets Sent to AI Providers

| Data Type | Sent to AI? | Purpose |
|-----------|-------------|---------|
| Document text | Yes (when analyzing) | Analysis/generation |
| Case summary | Yes (for context) | Better responses |
| Personal details | Minimal | Only if in documents |
| API keys | Never | Stored locally only |
| Usage patterns | No | N/A |

### Compliance Considerations

- **GDPR**: No EU data storage, user controls all data
- **Attorney-Client Privilege**: Tool is not a lawyer, no privilege created
- **Court Rules**: Users responsible for accuracy of filings

---

## Business Model Options

### Option A: Freemium SaaS
```
FREE TIER
- 3 document generations/month
- Basic case profile
- Limited AI chat (10 messages/day)
- Community support

PRO ($29/month)
- Unlimited document generation
- Full case analysis
- Unlimited AI chat
- Email support
- Google integrations

TEAM ($99/month)
- Multiple cases
- Priority support
- API access
- Custom templates
```

### Option B: One-Time Purchase
```
PERSONAL LICENSE ($99)
- Desktop app (Mac/Windows)
- Lifetime updates for 1 year
- All features unlocked
- Bring your own AI API key

PROFESSIONAL ($249)
- + 5 years updates
- + Priority support
- + Custom jurisdiction templates
```

### Option C: Open Source + Services
```
OPEN SOURCE (FREE)
- Full app, self-hosted
- Bring your own AI key
- Community support

MANAGED SERVICE ($19/month)
- Hosted version
- Included AI credits
- Auto-updates
- Support

ENTERPRISE (Custom)
- Legal aid organizations
- Custom integrations
- Training
```

---

## Competitive Landscape

| Product | Strengths | Weaknesses | Our Advantage |
|---------|-----------|------------|---------------|
| **LegalZoom** | Brand recognition | Generic templates, expensive | Case-specific AI |
| **Rocket Lawyer** | Lawyer network | Subscription model, not AI-native | Deep case understanding |
| **DoNotPay** | Automation | Limited scope, US only | Comprehensive toolkit |
| **ChatGPT** | General capability | No case context, generic | Persistent case profile |
| **Clio** | Full practice management | For lawyers, not litigants | User-focused UX |

---

## Success Metrics

### User Success
- Documents filed without rejection
- Cases won/settled favorably
- Time saved vs manual drafting
- User confidence scores

### Product Metrics
- Daily active users
- Documents generated/user
- Feature adoption rates
- Session duration
- Retention (D1, D7, D30)

### Business Metrics
- MRR/ARR
- Customer acquisition cost
- Lifetime value
- Churn rate
- NPS score

---

## Roadmap

### Q1 2025: Foundation
- [x] Core document generation
- [x] Case profile management
- [x] Evidence management
- [x] Timeline builder
- [x] AI chat assistant
- [ ] Gemini API integration
- [ ] Polish onboarding flow

### Q2 2025: Strategic Tools
- [ ] Enhanced case analyzer
- [ ] Motion response wizard
- [ ] Deadline automation
- [ ] Hearing simulator beta

### Q3 2025: Integrations
- [ ] Gmail deep integration
- [ ] Calendar sync
- [ ] Google Drive backup
- [ ] PDF annotation

### Q4 2025: Scale
- [ ] UK jurisdiction support
- [ ] Mobile companion app
- [ ] Legal aid partnerships
- [ ] Community features

### 2026: Expansion
- [ ] US state coverage
- [ ] Video tutorials
- [ ] Lawyer marketplace
- [ ] API for integrations

---

## Open Questions

1. **Pricing model** - Which model best serves access to justice mission while being sustainable?

2. **Jurisdiction priority** - Which markets after HK? UK has similar legal system, US has bigger market.

3. **AI provider default** - Gemini (free) vs Claude (quality)? Let user choose?

4. **Legal disclaimers** - How prominent? Every page or just onboarding?

5. **Community features** - Should users share templates? Privacy concerns?

6. **Lawyer involvement** - Review marketplace? Referral network?

---

## Appendix: Document Types

### Affidavit/Affirmation
- Sworn statement of facts
- Used to submit evidence
- Requires proper jurat
- Numbered paragraphs

### Written Submissions
- Legal arguments
- Cites authorities
- Responds to issues
- Structured sections

### Skeleton Argument
- Brief argument outline
- For hearings
- Key points only
- 3-5 pages max

### Letter to Court
- Administrative requests
- Adjournments
- Directions
- Formal but concise

### Response/Reply
- Answers to motions
- Point-by-point rebuttal
- Counter-arguments
- Prayer for relief

---

*Document Version: 1.0*
*Last Updated: December 2024*
