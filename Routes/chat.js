const express = require("express");
const router = express.Router();
const fetch = require("node-fetch");

// ------------------------------
// 🔥 MediVault Dataset Responses
// ------------------------------
const mediData = {
  features: [
    "📌 MediVault allows users to store medical reports, prescriptions, and emergency info in one secure place.",
    "💊 You can upload prescriptions and generate QR codes for verification.",
    "🩺 The system includes emergency mode, hospital locator, and digital health vault."
  ],
  prescription: [
    "🧾 You can upload prescriptions, view them later after login, and even generate secure QR-based validation.",
    "📤 Prescription upload errors usually occur due to missing fields or wrong file format. Make sure to use JPG or PNG.",
    "🔍 The prescription parser uses OCR — ensure the image is clear for better accuracy."
  ],
  reports: [
    "📁 Reports are stored safely and linked to your user account so you can see them after logging in.",
    "📂 If reports are not loading, ensure your model and route files return the correct data to `reports.ejs`.",
    "📥 You can upload lab reports, X-rays, and health summaries anytime."
  ],
  qr: [
    "🔐 MediVault uses encoded QR tokens that include report/prescription metadata and expiration timestamps.",
    "📱 If QR is not generating, check if all input fields are filled and the QR API endpoint is working.",
    "🛠 If QR scan fails, ensure the base64 token is formed correctly and not expired."
  ],
  account: [
    "👤 If login is failing, ensure you switched from Passport.js to bcrypt properly.",
    "🔑 Registration needs hashed password using bcrypt. Missing hashing causes validation errors.",
    "💬 If dashboard data isn't loading, verify your user session middleware is functioning."
  ],
  emergency: [
    "🚨 In emergency mode, MediVault can find nearby hospitals using geolocation + Google Maps API.",
    "📍 If the hospital locator map isn't visible, ensure your API key and map container size are correct.",
    "🆘 Emergency info can be stored and accessed via a special emergency QR."
  ],
  general: [
    "💙 Welcome to MediVault — your secure digital health vault!",
    "📌 I can help with prescriptions, reports, accounts, QR, errors and project features.",
    "🤖 Try asking: 'Why QR is not working?' or 'How to store reports?'"
  ]
};

// ---------------------
// 🔍 Topic Finder Logic
// ---------------------
function findTopic(message) {
  const msg = message.toLowerCase();

  if (msg.includes("prescription") || msg.includes("medicine") || msg.includes("upload"))
    return "prescription";

  if (msg.includes("report") || msg.includes("lab") || msg.includes("records"))
    return "reports";

  if (msg.includes("qr") || msg.includes("scan") || msg.includes("code"))
    return "qr";

  if (msg.includes("login") || msg.includes("register") || msg.includes("account") || msg.includes("password"))
    return "account";

  if (msg.includes("emergency") || msg.includes("hospital") || msg.includes("nearby"))
    return "emergency";

  if (msg.includes("feature") || msg.includes("what is") || msg.includes("about"))
    return "features";

  return "general";
}

// ---------------------
// 💬 Chat Route
// ---------------------
router.post("/chat", async (req, res) => {
  const { message } = req.body;
  
  const topic = findTopic(message);
  const responses = mediData[topic];
  const reply = responses[Math.floor(Math.random() * responses.length)];

  res.json({ reply });
});

module.exports = router;
