# AI-Based Syntax Tree Visualizer

Parse code, visualize Abstract Syntax Trees (AST), learn grammar rules, and get AI-powered explanations.

## Features

✅ **Code Parsing** - Parse JavaScript code into AST using Babel Parser  
✅ **Tree Visualization** - Interactive Mermaid.js diagrams  
✅ **Grammar Rules** - Extract and display Context-Free Grammar rules  
✅ **AI Explanations** - Click nodes for AI-powered explanations  
✅ **Error Detection** - AI helps fix syntax errors  
✅ **Dual AI Support** - Uses Ollama (local) or falls back to Gemini  
✅ **Dark Mode** - Full dark mode support

## Quick Start

### Backend Setup

```bash
cd server
cp .env.example .env
# Edit .env and add your API keys
npm run dev
```

Server runs on: `http://localhost:5000`

### Frontend Setup

```bash
cd client
cp .env.example .env
npm run dev
```

Client runs on: `http://localhost:5173`

## Environment Variables

### Server (.env)

```env
PORT=5000
OLLAMA_URL=http://localhost:11434
OLLAMA_MODEL=llama3.2
GEMINI_API_KEY=your_key_here
GEMINI_MODEL=gemini-1.5-flash
```

### Client (.env)

```env
VITE_API_URL=http://localhost:5000/api
```

## How It Works

1. **Enter code** in the code editor
2. **Parse & Visualize** - generates AST and Mermaid tree diagram
3. **View Grammar Rules** - see CFG rules extracted from code
4. **Click nodes** in the tree to get AI explanations
5. **Get AI help** for syntax errors and grammar understanding

## Tech Stack

- **Frontend**: React, Tailwind CSS v4, Mermaid.js, Axios
- **Backend**: Express.js, Babel Parser, CORS
- **AI**: Ollama (local) / Google Gemini (fallback)

## API Endpoints

- `POST /api/parse` - Parse code and generate AST
- `POST /api/explain-node` - Get AI explanation for AST node
- `POST /api/explain-grammar` - Explain grammar rules
- `POST /api/detect-errors` - Detect and fix syntax errors
- `GET /api/ai-status` - Check AI provider status

## Educational Features

- Abstract Syntax Tree (AST) visualization
- Parse tree understanding
- Context-Free Grammar (CFG) rules
- Syntax-directed translation concepts
- Error detection and recovery
- Grammar simplification suggestions
