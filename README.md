# Counsel

An open-source, AI-powered legal document assistant with deep Google integration.

## Features

- **Document Analysis**: Upload opposing filings and extract key arguments, dates, and weaknesses
- **Document Generation**: Create affirmations, submissions, speeches, and other legal documents
- **Gmail Integration**: Monitor for new filings, search case-related emails
- **Google Drive**: All documents live in Drive - no separate storage
- **Google Docs**: Generate documents directly as Google Docs
- **Google Sheets**: Track cases, deadlines, and document status
- **Timeline Extraction**: Automatically extract and visualize case timelines
- **Argument Mapping**: Map your arguments against opponent's claims
- **Local LLM Support**: Run with Mistral locally via Ollama (no data leaves your machine)
- **Claude API**: Optionally use Claude for higher quality analysis
- **CLI Interface**: Power user command-line interface
- **Mac App**: Native Mac application with Electron

## Privacy First

- **Local LLM Option**: Use Mistral via Ollama - all processing happens on your machine
- **Your Google Account**: Data stays in your own Google Drive
- **Open Source**: Audit the code yourself

## Quick Start

### Prerequisites

1. **Node.js 18+**
2. **Ollama** (for local LLM) - [Install Ollama](https://ollama.ai)
3. **Google Cloud Project** with OAuth credentials

### Install

```bash
# Clone the repo
git clone https://github.com/counsel/counsel.git
cd counsel

# Install dependencies
npm install

# Run development server (web)
npm run dev

# Run Mac app in development
npm run electron:dev
```

### Build Mac App

```bash
# Build for distribution
npm run electron:build:mac

# Output will be in dist/ folder as .dmg
```

### CLI Installation

```bash
# Install globally
npm link

# Use CLI
counsel --help
```

## Setup Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project
3. Enable these APIs:
   - Gmail API
   - Google Drive API
   - Google Docs API
   - Google Sheets API
4. Create OAuth 2.0 credentials (Desktop app)
5. In the app Settings, enter your Client ID, Client Secret, and Refresh Token

## Setup Local LLM

```bash
# Install Ollama
curl -fsSL https://ollama.ai/install.sh | sh

# Pull Mistral
ollama pull mistral:latest

# Start server
ollama serve
```

In Settings, select "Ollama (Local)" as your LLM provider.

## Setup Claude API (Optional)

1. Get API key from [console.anthropic.com](https://console.anthropic.com)
2. In Settings, select "Claude API" and enter your key

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Cmd+1` | Inbox |
| `Cmd+2` | Cases |
| `Cmd+3` | Analyze |
| `Cmd+N` | Generate Document |
| `Cmd+4` | Timeline |
| `Cmd+K` | Search |
| `Cmd+,` | Settings |

## CLI Commands

```bash
# Check system status
counsel check

# Configuration
counsel config --show
counsel config --llm ollama
counsel config --model mistral:latest
counsel config --api-key sk-ant-xxx

# Case management
counsel case --list
counsel case --new
counsel case --delete <id>

# Document analysis
counsel analyze document.pdf
counsel analyze filing.pdf --timeline
counsel analyze brief.pdf --output analysis.txt

# Document generation
counsel generate affirmation --facts facts.txt
counsel generate submission --case <id>
counsel generate letter
counsel generate speech

# Email operations
counsel email --inbox 10
counsel email --search "FROM opposing@law.com"
counsel email --from "lawyer@firm.com"

# Authentication
counsel auth --setup
counsel auth --status
```

## Project Structure

```
counsel/
├── src/
│   ├── app/                  # Next.js app router
│   │   ├── page.tsx          # Main dashboard
│   │   ├── layout.tsx        # Root layout
│   │   └── globals.css       # Global styles
│   ├── components/           # React components
│   │   ├── InboxView.tsx     # Gmail monitor
│   │   ├── DocumentAnalyzer.tsx
│   │   ├── DocumentGenerator.tsx
│   │   ├── CaseManager.tsx   # Case management
│   │   ├── TimelineView.tsx  # Timeline visualization
│   │   └── SettingsView.tsx  # Configuration
│   ├── services/             # Backend services
│   │   ├── llm.ts            # LLM abstraction (Ollama/Claude)
│   │   └── google.ts         # Google APIs
│   ├── lib/
│   │   └── store.ts          # Zustand state management
│   └── cli/
│       └── index.ts          # CLI interface
├── electron/                 # Electron main process
│   ├── main.ts
│   └── preload.ts
├── build/                    # Electron build resources
└── public/                   # Static assets
```

## Document Templates

### Affirmation / Affidavit
Sworn statement of facts with proper court formatting.

### Written Submissions
Structured legal arguments for court hearings.

### Letter to Court
Formal correspondence with the court registry.

### Oral Submissions
Speech structure for court appearances with timing markers.

### Skeleton Argument
Outline of legal issues and arguments.

## Tech Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **UI Components**: Radix UI, Lucide Icons
- **State**: Zustand with persistence
- **Google APIs**: googleapis
- **Local LLM**: Ollama
- **Cloud LLM**: Anthropic Claude API
- **Desktop**: Electron
- **CLI**: Commander.js

## LLM Comparison

| Feature | Ollama (Local) | Claude (Cloud) |
|---------|----------------|----------------|
| Privacy | 100% local | Data sent to API |
| Speed | Depends on hardware | Fast |
| Quality | Good (Mistral) | Excellent |
| Cost | Free | ~$3-15/MTok |
| Offline | Yes | No |

## Contributing

PRs welcome! Areas needing work:
- More document templates
- Court-specific formatting (UK, US, AU, HK)
- Precedent search integration
- Better PDF parsing
- Auto-update functionality

## License

MIT License - use freely, modify freely.

## Disclaimer

This tool assists with legal document preparation. It is not legal advice. Always consult a qualified lawyer for legal matters.
