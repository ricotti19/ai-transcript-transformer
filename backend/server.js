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

    // STEP 1: Generate pristine core transcript using modern model array settings
    const transcript = await client.transcripts.transcribe({
      audio: filePath,
      speech_models: ["universal-3-pro", "universal-2"]
    });

    if (transcript.status === 'error') {
      console.error(`[AI ERROR] Processing failed: ${transcript.error}`);
      safeDelete(filePath);
      return res.status(500).json({ error: `AssemblyAI failed: ${transcript.error}` });
    }

    if (!transcript || !transcript.text) {
      safeDelete(filePath);
      return res.status(500).json({ error: "AssemblyAI processing completed but returned an empty text payload." });
    }

    console.log(`[SUCCESS] Text transcription completed successfully.`);

    // STEP 2: Leverage modern LLM Gateway to build a safe, isolated paragraph summary -- ** STILL IN PROGRESS  **
    let generatedSummary = "No summary returned from pipeline.";
    try {
      console.log(`[AI LLM GATEWAY] Querying integrated LLM layer for narrative summary context...`);
      const llmResponse = await axios.post('https://llm-gateway.assemblyai.com/v1/chat/completions', {
        model: 'claude-sonnet-4-6',
        messages: [
          { 
            role: 'user', 
            content: 'Provide a clean, informative, concise one-paragraph summary of this recording:\n\n{{ transcript }}' 
          }
        ],
        transcript_id: transcript.id,
        max_tokens: 500
      }, {
        headers: { 
          'authorization': process.env.ASSEMBLYAI_API_KEY,
          'Content-Type': 'application/json'
        }
      });

      if (llmResponse.data?.choices?.[0]?.message?.content) {
        generatedSummary = llmResponse.data.choices[0].message.content.trim();
        console.log(`[SUCCESS] Narrative text summarization completed.`);
      }
    } catch (summaryError) {
      console.error(`[AI SUMMARIZATION WARNING] LLM layer fell back:`, summaryError.message);
    }

    // =========================================================================
    // LIVE DYNAMIC WEBHOOK PIPELINE WITH METADATA FILTERING ROUTING
    // =========================================================================
    let targetWebhookUrl = process.env.WEBHOOK_URL || process.env.INDIA_WEBHOOK_URL;
    let routingPriority = "Standard Routing";

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

    const crmPayload = {
      lead_name: leadName,
      timestamp: new Date().toLocaleString(),
      audio_file_name: req.file.originalname,
      transcript_text: transcript.text,
      summary_text: generatedSummary,
      status: "Automatic Logged Activity",
      corridor_origin: userCorridor,
      workflow_priority: routingPriority
    };

    console.log(`[ZOHO PIPELINE] Asynchronously dispatching payload package via dynamic filtering layer...`);
    
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

      let cleanRegion = "Other Corridor";
      if (normalizedCorridor.includes('india')) cleanRegion = "US-India";
      else if (normalizedCorridor.includes('singapore')) cleanRegion = "US-Singapore";
      else if (normalizedCorridor.includes('uae') || normalizedCorridor.includes('dubai') || normalizedCorridor.includes('emirates')) cleanRegion = "US-UAE";

      const zohoRecordPayload = {
        data: [
          {
            "Last_Name": leadName,
            "Company": `${userCorridor} Corridor Call Log`,
            "Description": `[System Priority Tag: ${routingPriority}]\n\nAudio Asset Name: ${req.file.originalname}\n\nAutomated Call Summary:\n"${generatedSummary}"\n\nFull Transcript:\n"${transcript.text}"`,
            "Lead_Source": "AI Transcript Transformer",
            "Industry": cleanRegion
          }
        ]
      };

      console.log(`[CRM INTEGRATION] Transmitting fresh contact sheet entry parameters onto Zoho endpoints...`);
      await axios.post('https://www.zohoapis.com/crm/v2/Leads', zohoRecordPayload, {
        headers: {
          'Authorization': `Zoho-oauthtoken ${activeAccessToken}`,
          'Content-Type': 'application/json'
        }
      });
      console.log(`[CRM INTEGRATION SUCCESS] Server response accepted. Profile lead mapped for: ${leadName}`);
    } catch (crmApiError) {
      console.error(`[CRM INTEGRATION WARNING] Sync skipped for this execution block:`, crmApiError.response?.data || crmApiError.message);
    }  

    // Final clean exit delivery point
    safeDelete(filePath);
    return res.status(200).json({ 
      text: transcript.text,
      summary: generatedSummary
    });
  } 
  catch (error) {
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
