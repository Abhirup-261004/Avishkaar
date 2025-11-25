const express = require("express");
const axios = require("axios");
const multer = require("multer");
const sharp = require("sharp");

const router = express.Router();

// Multer setup – allow up to 3 prescription images
const upload = multer({ limits: { fileSize: 50 * 1024 * 1024 } });

// Supported formats
const SUPPORTED_FORMATS = ["jpg", "jpeg", "png", "bmp", "gif", "webp", "tiff"];

// --------- IMAGE PREPROCESSING + OCR HELPERS ----------

// Preprocess image using sharp
async function preprocessImage(buffer) {
  try {
    return await sharp(buffer)
      .jpeg({ quality: 95 })
      .normalise()           // auto contrast enhancement
      .sharpen(2, 1, 1)      // improve OCR sharpness
      .toBuffer();
  } catch (err) {
    console.log("Image preprocess error:", err);
    return buffer;
  }
}


// OCR.SPACE
async function tryOCR(base64, ext) {
  try {
    const result = await axios.post(
      "https://api.ocr.space/parse/image",
      new URLSearchParams({
        apikey: "K87899142388957",
        base64Image: `data:image/${ext};base64,${base64}`,
        language: "eng",
      })
    );

    if (!result.data.ParsedResults) return null;

    return result.data.ParsedResults[0].ParsedText;
  } catch (err) {
    console.log("OCR error:", err.message);
    return null;
  }
}

async function extractTextFromFile(file) {
  if (!file) return null;

  const ext = file.originalname.split(".").pop().toLowerCase();
  if (!SUPPORTED_FORMATS.includes(ext)) {
    throw new Error(`Unsupported format for file: ${file.originalname}`);
  }

  // Preprocess image
  const processed = await preprocessImage(file.buffer);
  const base64 = processed.toString("base64");

  // OCR
  let text = await tryOCR(base64, ext);
  if (!text) text = await tryOCR(file.buffer.toString("base64"), ext);

  if (!text) return null;
  return text;
}

// --------- PRESCRIPTION PARSING HELPERS ----------

// Very simple keyword list for common conditions
const KNOWN_CONDITIONS = [
  "fever",
  "cold",
  "cough",
  "infection",
  "throat infection",
  "flu",
  "diabetes",
  "hypertension",
  "bp",
  "blood pressure",
  "asthma",
  "allergy",
  "headache",
  "migraine",
  "pain",
  "acidity",
  "ulcer",
  "anxiety",
  "depression"
];

function extractDoctor(text) {
  const lines = text.split("\n");
  for (let line of lines) {
    const l = line.trim();
    if (/^dr\.?/i.test(l)) {
      return l;
    }
  }
  return null;
}

function extractDiagnosis(text) {
  const lower = text.toLowerCase();
  const found = [];
  for (let cond of KNOWN_CONDITIONS) {
    if (lower.includes(cond)) {
      found.push(cond);
    }
  }
  // unique
  return [...new Set(found)];
}

function extractMedicines(text) {
  const lines = text.split("\n");
  const meds = [];

  lines.forEach((rawLine) => {
    let line = rawLine.trim();

    if (!line) return;
    // Skip header-ish lines
    if (/^dr\.?/i.test(line)) return;
    if (/diagnosis/i.test(line)) return;
    if (/rx/i.test(line)) return;

    // Heuristic: lines with mg/ml/tab/cap/syp/syrup are likely medicines
    if (/(mg|mcg|ml|tab|tablet|cap|capsule|syp|syrup)/i.test(line)) {
      // Try to split: "Paracetamol 650mg 1-1-1 5 days"
      const parts = line.split(/\s+/);
      const nameParts = [];
      const dosageParts = [];

      for (let p of parts) {
        if (/(mg|mcg|ml)/i.test(p) || /^\d+(-\d+)*$/.test(p)) {
          dosageParts.push(p);
        } else {
          nameParts.push(p);
        }
      }

      const name = nameParts.join(" ").trim();
      const dosage = dosageParts.join(" ").trim();

      if (name.length > 0) {
        meds.push({
          name,
          dosage: dosage || null,
          raw: line
        });
      }
    }
  });

  // unique by name+dosage
  const map = new Map();
  meds.forEach((m) => {
    const key = `${m.name.toLowerCase()}|${m.dosage || ""}`;
    if (!map.has(key)) map.set(key, m);
  });

  return Array.from(map.values());
}

function extractDuration(text) {
  const lower = text.toLowerCase();
  const durations = [];

  const regex = /(\d+)\s*(day|days|week|weeks|month|months)/gi;
  let match;
  while ((match = regex.exec(lower)) !== null) {
    durations.push(match[0]);
  }
  return [...new Set(durations)];
}

function extractFrequency(text) {
  const lower = text.toLowerCase();
  const patterns = [];

  // Common patterns: 1-0-1, 1-1-1, 0-1-0
  const freqRegex = /\b[0-3]-[0-3]-[0-3]\b/g;
  let match;
  while ((match = freqRegex.exec(lower)) !== null) {
    patterns.push(match[0]);
  }

  // Word-based
  const keywords = [
    "once daily",
    "twice daily",
    "thrice daily",
    "three times a day",
    "two times a day",
    "every 8 hours",
    "every 6 hours",
    "every 12 hours",
    "at night",
    "in the morning",
    "after food",
    "before food"
  ];

  keywords.forEach((k) => {
    if (lower.includes(k)) patterns.push(k);
  });

  return [...new Set(patterns)];
}

function parsePrescriptionText(text) {
  if (!text) {
    return {
      doctor: null,
      diagnosis: [],
      medicines: [],
      duration: [],
      frequency: []
    };
  }

  return {
    doctor: extractDoctor(text),
    diagnosis: extractDiagnosis(text),
    medicines: extractMedicines(text),
    duration: extractDuration(text),
    frequency: extractFrequency(text)
  };
}

function generateHealthSummary(parsedList) {
  const valid = parsedList.filter(Boolean);
  if (!valid.length) {
    return "No prescription data could be reliably extracted from the images.";
  }

  const allDiagnosis = new Set();
  const allMedicines = new Set();
  const allDurations = new Set();
  const allFrequency = new Set();
  const doctors = new Set();

  valid.forEach((p) => {
    (p.diagnosis || []).forEach((d) => allDiagnosis.add(d));
    (p.medicines || []).forEach((m) => allMedicines.add(m.name));
    (p.duration || []).forEach((d) => allDurations.add(d));
    (p.frequency || []).forEach((f) => allFrequency.add(f));
    if (p.doctor) doctors.add(p.doctor);
  });

  const diagnosisArr = Array.from(allDiagnosis);
  const medsArr = Array.from(allMedicines);
  const durationArr = Array.from(allDurations);
  const freqArr = Array.from(allFrequency);
  const docArr = Array.from(doctors);

  let summary = "Based on the uploaded prescriptions, the patient is currently under medical treatment.";

  if (docArr.length) {
    summary += ` The prescriptions appear to be written by: ${docArr.join(", ")}.`;
  }

  if (diagnosisArr.length) {
    summary += ` The main health issues mentioned include: ${diagnosisArr.join(", ")}.`;
  } else {
    summary += " The exact diagnosis is not clearly mentioned in the text extracted.";
  }

  if (medsArr.length) {
    summary += ` Medicines prescribed include: ${medsArr.slice(0, 10).join(", ")}.`;
    if (medsArr.length > 10) {
      summary += " (and others)";
    }
  }

  if (freqArr.length) {
    summary += ` The dosage/frequency patterns detected include: ${freqArr.join(", ")}.`;
  }

  if (durationArr.length) {
    summary += ` The treatment duration mentioned includes: ${durationArr.join(", ")}.`;
  }

  summary += " This is an approximate summary generated from OCR and should not be used as a substitute for professional medical advice.";

  return summary;
}

// ------------------ ROUTES ------------------

// Render page
router.get("/prescription", (req, res) => {
  res.render("prescription", {
    title: "Prescription Parser | MediVault",
  });
});

// MAIN API: accept up to 3 prescriptions (morning, afternoon, night)
router.post(
  "/parse",
  upload.fields([
    { name: "morning", maxCount: 1 },
    { name: "afternoon", maxCount: 1 },
    { name: "night", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const morningFile = req.files?.morning?.[0] || null;
      const afternoonFile = req.files?.afternoon?.[0] || null;
      const nightFile = req.files?.night?.[0] || null;

      if (!morningFile && !afternoonFile && !nightFile) {
        return res.json({
          success: false,
          error: "No prescription images uploaded",
        });
      }

      const [morningText, afternoonText, nightText] = await Promise.all([
        extractTextFromFile(morningFile),
        extractTextFromFile(afternoonFile),
        extractTextFromFile(nightFile),
      ]);

      const morningParsed = morningText ? parsePrescriptionText(morningText) : null;
      const afternoonParsed = afternoonText ? parsePrescriptionText(afternoonText) : null;
      const nightParsed = nightText ? parsePrescriptionText(nightText) : null;

      const summary = generateHealthSummary(
        [morningParsed, afternoonParsed, nightParsed].filter(Boolean)
      );

      return res.json({
        success: true,
        data: {
          morning: {
            raw_text: morningText || null,
            parsed: morningParsed,
          },
          afternoon: {
            raw_text: afternoonText || null,
            parsed: afternoonParsed,
          },
          night: {
            raw_text: nightText || null,
            parsed: nightParsed,
          },
          summary,
        },
      });
    } catch (err) {
      console.log(err);
      res.json({ success: false, error: err.message });
    }
  }
);

module.exports = router;
