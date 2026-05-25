# AI Transcript Transformer

AI supported audio to automatic text transcript (PDF) processing pipeline designed with localized multi-region backend corridors for data-sovereignty compliant content ingestion.

(Must upload or drag-and-drop any audio file, enter name for identification, select region of business)

## 🛠️ System Architecture & Core Concept

This system is built as an isolated enterprise proof-of-concept simulating a high-throughput, localized audio intelligence ingestion network. It enforces **strict environmental parity** and regional routing topology across three specific data compliance corridors: Singapore Node, UAE Node, India Node

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
├── backend/
│   ├── server.js
│   ├── package.json
│   └── package-lock.json
├── frontend/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── App.css
│   │   ├── App.js
│   │   └── index.js
│   ├── package.json
│   └── package-lock.json
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

4. Initialize the Frontend Workspace

Open a separate terminal window or pane and type:
`cd frontend`

`npm start`

localhost:3000 will open up automatically in Chrome

Interface: <img width="1914" height="1158" alt="image" src="https://github.com/user-attachments/assets/92a6c81c-b41c-4509-a6c4-b8e6ef183f7c" />

