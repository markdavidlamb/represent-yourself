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

### Deployment Options

Two ways to use Represent Yourself - user chooses based on trust level:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         DEPLOYMENT OPTIONS                                   │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│   OPTION A: CLOUD (app.representyourself.legal)                             │
│   ─────────────────────────────────────────────                             │
│   • Hosted by us, managed by us                                             │
│   • Zero setup - just sign up                                               │
│   • We handle AI API keys (included in price)                               │
│   • Data passes through our servers                                         │
│   • For users who value convenience                                         │
│                                                                              │
│   Trust model: "I trust you with my data"                                   │
│   Price: Subscription tiers ($50-$750/mo)                                   │
│                                                                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│   OPTION B: SELF-HOSTED (download + run locally)                            │
│   ─────────────────────────────────────────────                             │
│   • Runs on user's machine (Electron app or Docker)                         │
│   • User provides own API keys (BYOK)                                       │
│   • Data never leaves their device                                          │
│   • API calls go directly to providers                                      │
│   • For privacy-conscious users                                             │
│                                                                              │
│   Trust model: "I trust Anthropic/Google, not you"                          │
│   Price: License fee ($25/mo) + user pays own API costs                     │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Architecture Comparison

| Aspect | Cloud | Self-Hosted |
|--------|-------|-------------|
| **Hosting** | Our servers | User's machine |
| **Setup** | Sign up, done | Download + configure |
| **AI Keys** | We provide | User provides (BYOK) |
| **Data Flow** | Through our servers | Direct to providers |
| **Updates** | Automatic | Manual or auto-update |
| **Support** | Full support | Community + docs |
| **Price** | $50-750/mo (all-in) | $25/mo + API costs |
| **Privacy** | Standard | Maximum |

### Cloud Version (app.representyourself.legal)

```
User Browser
    │
    ▼
┌─────────────────────────┐
│   Our Cloud Platform    │
│   ─────────────────     │
│   • User accounts       │
│   • Document storage    │
│   • Case management     │
│   • Our API keys        │
└───────────┬─────────────┘
            │
            ▼
┌─────────────────────────┐
│   LLM Providers         │
│   (our accounts)        │
└─────────────────────────┘
```

**Pros:**
- Zero friction signup
- No technical setup
- Included AI credits
- Cross-device sync
- Automatic backups

**Cons:**
- Data on our servers
- Dependent on our uptime
- Less privacy

### Self-Hosted Version (Desktop App / Docker)

```
┌─────────────────────────────────────────────┐
│           USER'S MACHINE                     │
│                                              │
│   ┌──────────────────────────────────────┐  │
│   │  Represent Yourself App              │  │
│   │  ─────────────────────              │  │
│   │  • Local storage (SQLite/files)     │  │
│   │  • User's API keys                  │  │
│   │  • Direct API calls                 │  │
│   └──────────────────┬───────────────────┘  │
│                      │                       │
└──────────────────────┼───────────────────────┘
                       │
                       │ Direct HTTPS
                       ▼
            ┌─────────────────────────┐
            │   LLM Providers         │
            │   (user's accounts)     │
            └─────────────────────────┘

┌─────────────────────────┐
│   Our Servers           │
│   ─────────────         │
│   • License validation  │
│   • Feature flags       │
│   • Update checks       │
│   • NO user data        │
└─────────────────────────┘
```

**Pros:**
- Maximum privacy
- Data never leaves device
- User controls everything
- Works offline (except AI)
- No vendor lock-in

**Cons:**
- Technical setup required
- User manages own API keys
- No cross-device sync
- Manual backups

### Self-Hosted Deployment Options

**Option B1: Desktop App (Electron)**
```bash
# Download from releases page
# Double-click to install
# Enter license key
# Add your API keys in settings
```
- Mac (Intel + Apple Silicon)
- Windows
- Linux

**Option B2: Docker (for servers/NAS)**
```bash
docker run -d \
  -p 3000:3000 \
  -v ~/represent-data:/data \
  -e LICENSE_KEY=xxx \
  representyourself/app:latest
```
- Run on home server
- Run on NAS (Synology, etc.)
- Run on VPS (if user wants own cloud)

**Option B3: Source Code (developers)**
```bash
git clone https://github.com/representyourself/app
npm install
npm run build
npm start
```
- Full customization
- Self-audit the code
- Contribute improvements

### Pricing by Deployment

| Plan | Cloud | Self-Hosted |
|------|-------|-------------|
| **Starter** | $50/mo (2 docs included) | $25/mo + own API |
| **Pro** | $150/mo (6 docs included) | $25/mo + own API |
| **Litigation** | $350/mo (15 docs included) | $25/mo + own API |
| **High-Stakes** | $750/mo (premium AI included) | $50/mo + own API |

Self-hosted users pay flat license fee + their own API costs.
Typical API cost: $5-30/month depending on usage.

### Trust Spectrum

```
MAXIMUM CONVENIENCE ◄────────────────────────► MAXIMUM PRIVACY

┌─────────┐   ┌─────────────┐   ┌────────────┐   ┌──────────┐
│  Cloud  │   │ Cloud +     │   │Self-hosted │   │Self-hosted│
│ Managed │   │ Own Keys    │   │ + BYOK     │   │ + Ollama │
│         │   │ (hybrid)    │   │            │   │ (local)  │
└─────────┘   └─────────────┘   └────────────┘   └──────────┘
     │              │                  │               │
     ▼              ▼                  ▼               ▼
  We see        We see           We see           We see
  everything    metadata only    license only     nothing
```

### The Trust Problem (Addressed)

**User A:** "I just want it to work."
→ Use Cloud version. We handle everything.

**User B:** "I don't want you seeing my documents."
→ Use Self-hosted + BYOK. We only validate your license.

**User C:** "I don't trust anyone with my data."
→ Use Self-hosted + Ollama. Nothing leaves your machine.

### Zero-Knowledge Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    USER'S DEVICE                             │
│                                                              │
│   ┌──────────────┐    ┌──────────────┐    ┌──────────────┐  │
│   │  Our App     │    │  Local       │    │  API Keys    │  │
│   │  (UI only)   │    │  Storage     │    │  (encrypted) │  │
│   └──────┬───────┘    └──────────────┘    └──────┬───────┘  │
│          │                                        │          │
│          │         DIRECT CONNECTION              │          │
│          └────────────────┬───────────────────────┘          │
│                           │                                  │
└───────────────────────────┼──────────────────────────────────┘
                            │
                            │ HTTPS (user → provider directly)
                            │
                            ▼
            ┌───────────────────────────────┐
            │       LLM PROVIDER            │
            │   (Anthropic / Google)        │
            │                               │
            │   User has direct agreement   │
            │   with provider's ToS         │
            └───────────────────────────────┘

            ┌───────────────────────────────┐
            │       OUR SERVERS             │
            │                               │
            │   ❌ No documents             │
            │   ❌ No case data             │
            │   ❌ No API keys              │
            │   ❌ No user content          │
            │                               │
            │   ✅ Only: license validation │
            │   ✅ Only: usage counts       │
            │   ✅ Only: feature flags      │
            └───────────────────────────────┘
```

### What We See vs What Providers See

| Data | Us (Represent Yourself) | LLM Provider |
|------|-------------------------|--------------|
| Documents | ❌ Never | ✅ When analyzing |
| Case details | ❌ Never | ✅ When generating |
| Personal info | ❌ Never | ✅ If in documents |
| API keys | ❌ Never | ✅ User's own key |
| Usage count | ✅ Aggregate only | ✅ Per-request |
| Feature usage | ✅ Anonymous | ❌ No |

### Trust Model Options

**Option 1: BYOK (Maximum Privacy)**
```
User provides own API keys
├── Calls go directly from their device to provider
├── We see: nothing about their content
├── Provider sees: their requests (under user's account)
└── User's existing ToS with provider applies
```

**Option 2: Managed Keys (Convenience)**
```
We provide API access (pooled keys)
├── Calls still go from their device
├── We see: usage counts, not content
├── Provider sees: requests under our account
└── Our ToS + provider ToS apply
```

**Option 3: Local Only (Paranoid Mode)**
```
Ollama on user's machine
├── Nothing leaves their device
├── We see: nothing
├── Provider sees: nothing
└── User responsible for model quality
```

### Implementation: Client-Side Direct Calls

All LLM API calls are made directly from the user's browser/app:

```typescript
// This happens ON THE USER'S DEVICE
async function callLLM(prompt: string) {
  // API key from user's local storage
  const apiKey = localStorage.getItem('user_api_key');

  // Direct call to provider - never touches our servers
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    headers: {
      'x-api-key': apiKey,  // User's own key
      'anthropic-dangerous-direct-browser-access': 'true'
    },
    body: JSON.stringify({ messages: [...] })
  });

  // Response stays on user's device
  return response.json();
}
```

**Key point:** The `anthropic-dangerous-direct-browser-access` header enables browser-to-API calls without a backend proxy. Same pattern works for Gemini.

### What Our Backend Does (Minimal)

```
Our API handles ONLY:
├── License key validation (is subscription active?)
├── Document count tracking (how many this month?)
├── Feature flag checks (which tier features enabled?)
└── Anonymous analytics (which features are popular?)

Our API NEVER receives:
├── Document content
├── Case details
├── User's API keys
├── Generated outputs
└── Chat histories
```

### Data Residency Guarantees

| Data Type | Location | Encrypted | We Can Access? |
|-----------|----------|-----------|----------------|
| Documents | User's device only | Yes (browser) | ❌ No |
| Case profile | User's device only | Yes (browser) | ❌ No |
| API keys | User's device only | Yes (encrypted) | ❌ No |
| Chat history | User's device only | Yes (browser) | ❌ No |
| Usage counts | Our servers | Yes | ✅ Aggregate |
| Subscription | Our servers | Yes | ✅ Yes |

### Privacy Comparison

| Approach | Privacy | Convenience | Cost |
|----------|---------|-------------|------|
| **BYOK** | Maximum | Medium | User pays provider |
| **Managed** | High | Maximum | We pay provider |
| **Local Ollama** | Absolute | Low | Free (GPU costs) |

### User-Facing Privacy Controls

```
Settings → Privacy
├── [ ] Use my own API keys (BYOK mode)
├── [ ] Enable local processing only (Ollama)
├── [ ] Clear all local data
├── [ ] Export my data (JSON)
└── [ ] Delete my account
```

### Compliance Considerations

- **GDPR**: User controls all PII, we process nothing
- **HIPAA**: Not applicable (we don't store PHI)
- **Attorney-Client Privilege**: Tool is not a lawyer, no privilege created
- **Court Rules**: Users responsible for accuracy of filings
- **Data Sovereignty**: All data stays on user's device

### The Privacy Pitch

> "Your legal documents never leave your device. We're just the UI layer.
> When you use AI features, your device talks directly to Anthropic or Google -
> under your own account, your own API keys, your own agreement with them.
> We couldn't read your documents even if we wanted to."

---

## Business Model

### Pricing Strategy: Document-Based Subscriptions

Pricing based on document generation, not seats or features. Clear value exchange.

### Subscription Tiers (USD)

#### Starter — $50/month

**For:** Self-represented litigants, light matters, first-time users

| Included | Overage |
|----------|---------|
| 2 standard documents/month | $35/document |
| Basic case profile | |
| AI chat (limited) | |
| Email support | |

**Economics:**
```
Revenue:        $50
COGS (2 × $9):  $18
Gross Margin:   64%
```

*This tier converts skeptics and filters unserious users.*

---

#### Pro — $150/month

**For:** Active litigants, ongoing cases, regular filings

| Included | Overage |
|----------|---------|
| 6 standard documents/month | $30/document |
| Full case profile | |
| Unlimited AI chat | |
| Priority queue | |
| Evidence management | |

**Economics:**
```
Revenue:        $150
COGS (6 × $9):  $54
Gross Margin:   64%
```

*Core revenue tier. Most users land here.*

---

#### Litigation — $350/month

**For:** Heavy users, multiple motions, complex cases

| Included | Overage |
|----------|---------|
| 15 standard documents/month | $25/document |
| Extended context windows | |
| Deep document retrieval | |
| Long-form pleadings enabled | |
| Bundle generation | |
| Timeline automation | |

**Economics:**
```
Revenue:         $350
COGS (15 × $9):  $135
Gross Margin:    61%
```

*High volume, still healthy margins.*

---

#### High-Stakes — $750/month

**For:** Serious litigation, committal, summary judgment, appeals

| Included | Overage |
|----------|---------|
| 10 standard documents/month | $30/document |
| 5 high-stakes documents (Opus) | $120/document |
| Maximum reasoning depth | |
| Multi-pass verification | |
| Hearing simulator | |
| Opponent intelligence | |
| Direct support channel | |

**Economics:**
```
Revenue:              $750
COGS:
  10 standard × $9:   $90
  5 high-stakes × $18: $90
  Total COGS:         $180
Gross Margin:         76%
```

*This tier prints money and signals seriousness.*

---

### Tier Comparison

| Feature | Starter | Pro | Litigation | High-Stakes |
|---------|---------|-----|------------|-------------|
| **Price** | $50 | $150 | $350 | $750 |
| **Standard Docs** | 2 | 6 | 15 | 10 |
| **High-Stakes Docs** | - | - | - | 5 |
| **Overage (std)** | $35 | $30 | $25 | $30 |
| **Overage (premium)** | - | - | - | $120 |
| **AI Chat** | Limited | Unlimited | Unlimited | Unlimited |
| **Context Depth** | Basic | Standard | Extended | Maximum |
| **Verification** | - | - | Basic | Full |
| **Support** | Email | Email | Priority | Direct |
| **Gross Margin** | 64% | 64% | 61% | 76% |

### Unit Economics

**Per-Document COGS Breakdown:**

| Component | Standard Doc | High-Stakes Doc |
|-----------|--------------|-----------------|
| Ingestion (Gemini) | $0.50 | $0.50 |
| Reasoning (Sonnet) | $6.00 | - |
| Reasoning (Opus) | - | $15.00 |
| Verification | $0.50 | $1.50 |
| Infrastructure | $2.00 | $1.00 |
| **Total COGS** | **$9.00** | **$18.00** |

### Revenue Projections

| Scenario | Users | Mix | MRR | Annual |
|----------|-------|-----|-----|--------|
| **Seed** | 50 | 60% Starter, 30% Pro, 10% Lit | $4,250 | $51K |
| **Early** | 200 | 40% Starter, 40% Pro, 15% Lit, 5% High | $22,750 | $273K |
| **Growth** | 1,000 | 30% Starter, 40% Pro, 20% Lit, 10% High | $152,500 | $1.83M |

### Alternative: BYOK (Bring Your Own Key)

For price-sensitive users or those with existing API credits:

**BYOK Plan — $25/month**
- All features unlocked
- User provides own API keys (Claude, Gemini)
- We charge for platform only
- No included documents
- ~90% margin on subscription

*Good for developers, power users, privacy-conscious.*

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
