# Grok API Interaction

**Grok API Interaction** is a modular platform for creating **bespoke Chrome extensions** powered by AI-based chat interfaces. Tailored toward client-specific workflows, this repository streamlines the development and deployment of customized AI-driven extensions for various industries and use cases.

The architecture is designed for **reusability**, **scalability**, and **easy customization**, ensuring that developers can quickly adapt the core solution to suit different clients, branding guidelines, and feature sets.

---

## Key Features

- **Modular Architecture**: A centralized core for logic in `core/` with a plug-and-play structure under `clients/` for tailoring to each client.
- **Flexible AI Backend Integration**: Built-in wrappers for AI services (e.g., OpenAI) to generate responses, summaries, and transformations.
- **Seamless Frontend-Backend Communication**: A `/chat` API endpoint paired with frontend logic (`popup.js`) for intuitive user interactions.
- **Customizable Branding and UI**: Easily swap logos, styles, and configurations per client for white-label solutions.
- **Chat History Management**: Save, view, download, and clear chat histories using local storage.
- **File Upload and Processing**: Users can upload files directly via the extension and process them through AI services (e.g., summarization, key points).
- **Essential AI Utilities for Legal and Corporate Use Cases**:
  - **Document Summarization**: Quickly condense contracts, filings, and case files.
  - **Compliance Automation**: Real-time checklists, regulatory updates, and risk alerts.
  - **Real-Time Legal Research**: Search and retrieve relevant case law, precedents, and keywords instantly.
  - **Task Tracking**: Manage deadlines, calendars, and reminders effectively.
  - **Data Insights**: Generate financial breakdowns, client reports, and actionable trends.
  - **Interactive Tools**: Facilitate drafting policies, analyzing risks, and calculating scenarios.
  - **File Processing**: Enable seamless upload, organization, and parsing of documents.

---

## Project Structure

```markdown
grok-api-interaction/
│
├── .env # Environment variables, including API keys
├── .gitignore # Ensures sensitive files like .env are not committed
├── grok-interaction.js # Main script for backend logic & AI interaction
├── manifest.json # Chrome extension manifest (v3)
├── package.json # Node.js project dependencies & scripts
│
├── core/ # Modular core for shared, reusable logic
│ ├── models/ # Schemas and models
│ │ ├── ChatHistory.js # Firestore structure for chat logs
│ │ └── LawFirm.js # Firestore structure for client info
│ ├── clientMetadata.js # Centralized metadata file for client-specific information, such as business details, key contacts, compliance policies, branding, and response templates
│ ├── firebase-config.js # Firebase initialization and configuration
│ ├── firestore-service.js # Encapsulated Firestore database operations
│ ├── ai-service.js # Wrapper for AI interactions (e.g., OpenAI)
│ ├── file-handler.js # Utilities for file uploads, parsing, format conversion
│ ├── storage-handler.js # Manages local storage operations
│ ├── logger.js # Centralized logging for debugging and monitoring
│ └── client-config.js # Default configuration and feature toggles
│
├── clients/ # Client-specific configurations and assets
│ ├── business-name/
│ │ ├── client-config.json # Configuration template for a given client
│ │ ├── branding/ # Branding assets (logo, custom styles)
│ │ │ ├── logo.png
│ │ │ └── styles.css
│ │ └── custom.js # Optional client-specific customization logic
│
├── templates/ # Templates for UI components and default logic
│ ├── popup.js # Frontend JS for Chrome extension popup
│ ├── styles.css # Shared CSS styles for the UI
│ └── client-config.json # Fallback template config for new clients
│
├── tools/ # Utility scripts and deployment tools
│ ├── build.js # Script for packaging client-specific extensions
│ ├── deploy.js # Script for deploying Chrome extensions
│ ├── migrate.js # Script for updating/migrating client configurations
│ └── seed-database.js # Script to initialize Firestore with default data
│
├── index.html # Main HTML for the Chrome extension popup UI
└── grok-interaction.js # Primary backend script managing AI interactions
```

```scss
┌────────────────────────────────────────────────────┐
│           Start (DOM Loaded)                       │
└────────────────────────────────────────────────────┘
                    │
                    ▼
┌────────────────────────────────────────────────────┐
│ 1. Setup Utility Functions                         │
│ - generateUniqueId()                               │
│ - removeAILabel(response)                          │
│ - constructPrompt(action, userInput)               │
│ - cleanResponse(response)                          │
│ - formatAndTruncateResponse(message)               │
│ - displayResponse(message)                         │
│ - displayMetadata(metadata)                        │
│ - userRequestsMetadata(input)                      │
│ - processInput(action, userInput)                  │
│ - etc.                                             │
└────────────────────────────────────────────────────┘
                    │
                    ▼
┌────────────────────────────────────────────────────┐
│ 2. Element References and Event Listeners          │
│ - saveAllChatsButton, overlay triggers             │
│ - fileInput, sendButton, clearHistoryButton, etc.  │
└────────────────────────────────────────────────────┘
                    │
                    ▼
┌────────────────────────────────────────────────────┐
│ 3. loadChatHistory() Called at Startup             │
│ - Reads saved history from localStorage            │
│ - For each saved chat:                             │
│ - Build UI of chat message                         │
│ - Prepend to chatHistoryDiv                        │
│ - updateSaveChatsButtonVisibility()                │
│ - scrollTop = 0                                    │
└────────────────────────────────────────────────────┘
                    │
                    ▼
┌────────────────────────────────────────────────────┐
│ 4. When User Clicks "Send":                        │
│ - If file is selected, may do OCR or read text     │
│ - Else uses text input directly                    │
│ - processInput(action, userInput) is called        │
└────────────────────────────────────────────────────┘
                    │
                    ▼
┌────────────────────────────────────────────────────┐
│ 5. processInput(action, userInput):                │
│ - If userRequestsMetadata(userInput):              │
│ → displayMetadata()                                │
│ → saveChatHistory() (skips if needed)              │
│                   Else:                            │
│ (1) Build prompt with constructPrompt()            │
│ (2) POST to /chat endpoint on server               │
│ (3) Clean up AI response (remove prompt, etc)      │
│ (4) displayResponse(finalAIResponse)               │
│ (5) saveChatHistory(userMessage, AI, action)       │
│ (6) loadChatHistory()                              │
└────────────────────────────────────────────────────┘
                    │
                    ▼
┌────────────────────────────────────────────────────┐
│ 6. saveChatHistory():                              │
│ - Possibly skip if metadata                        │
│ - Clean + remove AI label                          │
│ - Generate ID, time, hash                          │
│ - Push new chat to localStorage                    │
│ - updateChatHistoryVisibility()                    │
└────────────────────────────────────────────────────┘
                    │
                    ▼
┌────────────────────────────────────────────────────┐
│ 7. loadChatHistory() Re-Called                     │
│ - Rebuild chat UI from localStorage                │
│ - Show "Download Chat" & "Delete Chat" buttons     │
│ - Keep a max of 10 stored messages                 │
└────────────────────────────────────────────────────┘
                    │
                    ▼
┌────────────────────────────────────────────────────┐
│ 8. UI: Clear Chat, Save All Chats, Overlays, etc.  │
│ - Buttons perform final tasks                      │
└────────────────────────────────────────────────────┘
```
