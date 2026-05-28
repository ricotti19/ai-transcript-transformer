require('dotenv').config();
const express = require('express');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const axios = require('axios');
const { AssemblyAI } = require('assemblyai');

const app = express();
const PORT = process.env.PORT || 5000;

// 1. Enable Global CORS Policies for Frontend Interaction
app.use(cors());
app.use(express.json());

// 2. Initialize the AssemblyAI Engine using the .env credentials
const client = new AssemblyAI({
  apiKey: process.env.ASSEMBLYAI_API_KEY
});

// 3. Ensure local 'uploads' directory boundaries exist on launch
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// 4. Configure Multer Storage Pipelines to preserve various incoming files
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage: storage });

// Helper function to handle cleanup reliably
function safeDelete(pathString) {
  if (pathString && fs.existsSync(pathString)) {
    fs.unlink(pathString, (err) => {
      if (err) console.error("[CLEANUP WARNING] Failed to purge temporary file:", err);
    });
  }
}

// =========================================================================
// DYNAMIC OAUTH ACCESS TOKEN RECOVERY FUNCTION
// =========================================================================
async function getZohoAccessToken() {
  try {
    const response = await axios.post('https://accounts.zoho.com/oauth/v2/token', null, {
      params: {
        grant_type: 'refresh_token',
        client_id: process.env.ZOHO_CLIENT_ID,
        client_secret: process.env.ZOHO_CLIENT_SECRET,
        refresh_token: process.env.ZOHO_REFRESH_TOKEN
      }
    });
    return response.data.access_token;
  } catch (error) {
    console.error('[ZOHO AUTH EXCEPTION] Couldn\'t rotate access keys:', error.response?.data || error.message);
    throw new Error('Zoho Authentication Layer Failure');
  }
}

// 5. The Core Transcription Route Engine with Automated CRM Sync
app.post('/api/transcribe', upload.single('audio'), async (req, res) => {
  const filePath = req.file ? req.file.path : null;

  try {
    // Structural Validation Check for the File Payload
    if (!filePath) {
      console.error('[ERROR] Target file missing from req.file');
      return res.status(400).json({ error: "No audio file uploaded from client dashboard." });
    }

    // Backend Form Validation Check
    const leadName = req.body.username ? req.body.username.trim() : "";
    const userCorridor = req.body.corridor ? req.body.corridor.trim() : "";

    if (!leadName || !userCorridor) {
      console.error('[VALIDATION REJECTION] Missing required string fields in request body.');
      safeDelete(filePath);
      return res.status(400).json({
        error: "Server Validation Failed: Lead Name and Regional Corridor fields are strictly required parameters."
      });
    }

    console.log(`[FILE RECEIVED] Successfully intercepted binary audio: ${req.file.originalname}`);
    console.log(`[PIPELINE] Routing stream for verified client: ${leadName} via ${userCorridor}...`);

    // Intercepting audio using verified structural model setup
    const transcript = await client.transcripts.transcribe({
      audio: filePath,
      speech_models: ['universal-3-pro']
    });

    if (transcript.status === 'error') {
      console.error(`[AI ERROR] Processing failed: ${transcript.error}`);
      safeDelete(filePath);
      return res.status(500).json({ error: `AssemblyAI failed: ${transcript.error}` });
    }

    console.log(`[SUCCESS] Transcription completed successfully!`);

    // =========================================================================
    // LIVE DYNAMIC WEBHOOK PIPELINE WITH METADATA FILTERING ROUTING
    // =========================================================================
   
    // Establish fallback default endpoint configurations
    let targetWebhookUrl = process.env.WEBHOOK_URL || process.env.INDIA_WEBHOOK_URL;
    let routingPriority = "Standard Routing";

    // Run Metadata Filtering: Inspect the string data passed from React client
    const normalizedCorridor = userCorridor.toLowerCase();

    if (normalizedCorridor.includes('india')) {
      targetWebhookUrl = process.env.INDIA_WEBHOOK_URL;
      routingPriority = "High Priority - South Asia Ops";
      console.log(`[FILTER MATCH] Routing payload dynamically to the India Operations cluster.`);
    } else if (normalizedCorridor.includes('singapore')) {
      targetWebhookUrl = process.env.SINGAPORE_WEBHOOK_URL;
      routingPriority = "High Priority - APAC Sales";
      console.log(`[FILTER MATCH] Routing payload dynamically to the Singapore Corporate cluster.`);
    } else if (normalizedCorridor.includes('uae') || normalizedCorridor.includes('dubai') || normalizedCorridor.includes('emirates')) {
      targetWebhookUrl = process.env.UAE_WEBHOOK_URL;
      routingPriority = "High Priority - EMEA Hub";
      console.log(`[FILTER MATCH] Routing payload dynamically to the UAE/EMEA cluster.`);
    } else {
      console.log(`[ROUTING FALLBACK] No regional metadata matching rules triggered. Reverting to baseline route.`);
    }

    // Construct the enhanced payload with injected priority tags
    const crmPayload = {
      lead_name: leadName,                           // Dynamic client name
      timestamp: new Date().toLocaleString(),           // Dynamic timestamp
      audio_file_name: req.file.originalname,        // Dynamic file metadata
      transcript_text: transcript.text,              // Real converted string text
      status: "Automatic Logged Activity",
      corridor_origin: userCorridor,                  // Dynamic route marker
      workflow_priority: routingPriority            // Injected filtering evaluation tag
    };

    console.log(`[ZOHO PIPELINE] Asynchronously dispatching payload package via dynamic filtering layer...`);
    console.log("LIVE DYNAMIC PAYLOAD DATA:", JSON.stringify(crmPayload, null, 2));
   
    // Post out data directly to the dynamically selected cloud link
    if (targetWebhookUrl) {
      axios.post(targetWebhookUrl, crmPayload, {
        headers: { 'Content-Type': 'application/json' },
        timeout: 3000
      })
      .then(() => {
        console.log(`[ZOHO SUCCESS] Dynamic filtered entry successfully broadcasted onto the web for ${leadName}!`);
      })
      .catch((webhookError) => {
        console.error(`[ZOHO PENDING WARNING] Background dispatch paused: ${webhookError.message}`);
      });
    }

    // =========================================================================
    // NATIVE LIVE ZOHO CRM LEAD INJECTION COUPLING
    // =========================================================================
    try {
      console.log(`[CRM INTEGRATION] Exchanging persistent refresh token for an active token session...`);
      const activeAccessToken = await getZohoAccessToken();

      const zohoRecordPayload = {
        data: [
          {
            "Last_Name": leadName,
            "Company": `${userCorridor} Corridor Call Log`,
            "Description": `[System Priority Tag: ${routingPriority}]\n\nAudio Asset Name: ${req.file.originalname}\n\nAutomated Call Transcript:\n"${transcript.text}"`,
            "Lead_Source": "AI Transcript Transformer"
          }
        ]
      };

      console.log(`[CRM INTEGRATION] Transmitting fresh contact sheet entry parameters onto Zoho endpoints...`);
      const zohoResponse = await axios.post('https://www.zohoapis.com/crm/v2/Leads', zohoRecordPayload, {
        headers: {
          'Authorization': `Zoho-oauthtoken ${activeAccessToken}`,
          'Content-Type': 'application/json'
        }
      });
      console.log(`[CRM INTEGRATION SUCCESS] Server response accepted. Profile lead mapped for: ${leadName}`);
    } catch (crmApiError) {
      console.error(`[CRM INTEGRATION WARNING] Sync skipped for this execution block:`, crmApiError.response?.data || crmApiError.message);
    }
   
    // File is explicitly purged from disk storage now that transcription is finished
    safeDelete(filePath);

    // Return final processed text payload to update React state engine
    return res.status(200).json({ text: transcript.text });

  } catch (error) {
    console.error("[CRITICAL ROUTE EXCEPTION] Pipeline failed:", error);
    if (filePath) safeDelete(filePath);
    return res.status(500).json({ error: "Internal server pipeline failure during processing." });
  }
});

// 6. Fire up the execution listener
app.listen(PORT, () => {
  console.log(`===================================================`);
  console.log(` BACKEND ENGINE ONLINE AND ACTIVE ON PORT: ${PORT}`);
  console.log(` LIVE AUTOMATED ZOHO CRM INJECTION MODULE ACTIVE`);
  console.log(`===================================================`);
});
