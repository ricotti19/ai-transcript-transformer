# AI Transcript Transformer

AI supported audio to automatic text transcript (PDF) processing pipeline designed with localized multi-region backend corridors (Singapore Node, UAE Node, India Node) for data-sovereignty compliant content ingestion.

(Must upload or drag-and-drop any audio file, enter name for identification, select region of business)

## 🛠️ System Architecture

- **Data Sovereignty & Mocking Validation**: Explicitly isolates routing configurations locally to run structural validation without incurring cloud egress penalties or spinning up redundant cross-region instances.
  
- **Fail-Safe Directory Initialization**: The backend automatically asserts and creates local transient storage dependencies on launch, eliminating system initialization gaps.
  
- **Third-Party Webhook & CRM Integration (Simulated Lifecycle)**: The external pipeline architecture utilizes a decoupled backend mocking engine to simulate Zoho CRM payload logging without executing live cloud requests during local testing.

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

## 🛠️  Installation & Setup

### Clone the repo and set up .env file:

* `git clone https://github.com/ricotti19/ai-transcript-transformer.git`

* Create a new file in the root directory named exactly `.env` in backend directory.

* First line should be: PORT=5000

* Grab your key from: https://www.assemblyai.com/ (Developer Dashboard) after logging in and clicking "API Keys"

* .env format: ASSEMBLYAI_API_KEY=your_assemblyai_key_here                            <------- replace with your key on right

### Simulated Webhook & CRM Ingestion

* Setup webhooks in: Webhook.site

* Create a unique URL and in .env, list as ZOHO_WEBHOOK_URL=........                       <------ replace with your URL on right

### Configure the Backend Gateway

* `cd backend`

* `npm install`

* `npm install jspdf`

* `npm install axios`

* `npm start`

### Initialize the Frontend Workspace

* Open a separate terminal window or pane and type:

* `cd frontend`

* `npm start`

* localhost:3000 will open up automatically in Chrome

### Interface: 

<img width="1916" height="1151" alt="image" src="https://github.com/user-attachments/assets/6a664e9e-4104-4f51-8523-859cd92928db" />

💡 Real-Time Telemetry Demo: Keep your terminal/Webhook url(s) open while running the app to watch the backend logs update in real time as files are uploaded and processed across the corridors.
