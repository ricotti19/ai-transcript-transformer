# AI Transcript Transformer & Multi-Region Data Pipeline

AI supported audio to automatic text transcript (PDF) processing pipeline designed with localized multi-region backend corridors (Singapore, UAE, India) for data-sovereignty compliant content ingestion.

## 🛠️ System Architecture & Core Concept

This system is built as an isolated enterprise proof-of-concept simulating a high-throughput, localized audio intelligence ingestion network. It enforces **strict environmental parity** and regional routing topology across three specific data compliance corridors:

Singapore Node, UAE Node, India Node

### Architectural Highlights
- **Data Sovereignty & Mocking Validation**: Explicitly isolates routing configurations locally to run structural validation without incurring cloud egress penalties or spinning up redundant cross-region instances.
- **Fail-Safe Directory Initialization**: The backend automatically asserts and creates local transient storage dependencies on launch, eliminating system initialization gaps.

## 🚀 Technical Stack

- **Frontend:** React.js, Custom Layouts (Optimized for viewport containment & low-latency UI responsiveness).
- **Backend:** Node.js, Express microservices, native File System management (`fs`), pathing modules.
- **Data Intake:** Multi-tenant binary streams via file-upload multi-part buffers.

---

## 📦 Project Structure
```
ai-transcript-transformer/
├── frontend/             # React Client Interface
│   ├── build/            # Static production production artifacts
│   ├── src/              # Application UI logic
│   └── package.json
└── backend/              # Node.js Core API Gateway
    ├── uploads/          # Transient storage (Auto-generated on startup, git-ignored)
    ├── server.js         # Entrypoint and corridor routing engine
    └── package.json
```

### 🛠️  Installation & Setup
1. Clone the repo and set up .env file:

`git clone https://github.com/ricotti19/ai-transcript-transformer.git`

Create a new file in the root directory named exactly `.env`.

First line should be: PORT=5000

Grab your key from: https://www.assemblyai.com/ (Developer Dashboard) after logging in and clicking "API Keys"

.env format: ASSEMBLYAI_API_KEY=your_assemblyai_key_here                            <------- replace with your key on right

# Simulated Webhook & CRM Ingestion

Setup webhooks in: Webhook.site

Create a unique URL and in .env, list as WEBHOOK_URL=........                       <------ replace with your URL on right

2. Configure the Backend Gateway
`cd backend`
`npm install`
`npm install jspdf`
`npm install axios`
`npm start`

3. Initialize the Frontend Workspace

Open a separate terminal window or pane and type:
`cd frontend`
`npm start`

localhost:3000 will open up automatically in Chrome
