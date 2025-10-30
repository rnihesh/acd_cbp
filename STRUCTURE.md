# Project Structure

## Backend (server/)

```
server/
├── server.js              # Express app entry point
├── routes/
│   └── ast.js            # API routes for parsing & AI
├── services/
│   ├── parser.js         # Babel parser & AST generation
│   └── ai.js             # AI service (Ollama → Gemini fallback)
├── .env                  # Environment variables (you fill these)
├── .env.example          # Template for environment variables
└── package.json
```

## Frontend (client/)

```
client/
├── src/
│   ├── App.jsx                    # Main application component
│   ├── App.css                    # Mermaid & custom styles
│   ├── components/
│   │   ├── CodeEditor.jsx         # Code input with examples
│   │   ├── TreeVisualizer.jsx     # Mermaid tree rendering
│   │   ├── GrammarRules.jsx       # CFG rules display
│   │   ├── ExplanationPanel.jsx   # AI explanations display
│   │   └── ErrorDisplay.jsx       # Syntax error handling
│   └── services/
│       └── api.js                 # Axios API calls
├── .env                           # Environment variables
├── .env.example                   # Template
└── package.json
```

## Data Flow

1. User enters code in `CodeEditor`
2. Click "Parse & Visualize" → calls `/api/parse`
3. `parser.js` uses Babel to generate AST
4. Returns: AST + Mermaid diagram + Grammar rules
5. `TreeVisualizer` renders Mermaid diagram
6. `GrammarRules` displays CFG rules
7. User clicks node → calls `/api/explain-node`
8. `ai.js` tries Ollama first, falls back to Gemini
9. `ExplanationPanel` shows AI response

## AI Flow

```
User Request
    ↓
Check Ollama (http://localhost:11434)
    ↓
Available? → Use Ollama
    ↓
Not Available/Error? → Fallback to Gemini
    ↓
Return Explanation
```

## Key Files

- `server/services/parser.js` - Core AST parsing logic
- `server/services/ai.js` - AI provider management
- `client/src/components/TreeVisualizer.jsx` - Mermaid integration
- `client/src/App.jsx` - State management & orchestration
