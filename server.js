const express = require("express");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: "20kb" }));

app.use((req, res, next) => {
  res.header(
    "Access-Control-Allow-Origin",
    "https://anayatullahfuad4-cmd.github.io"
  );
  res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.sendStatus(204);
  }

  next();
});

app.use(express.static(path.join(__dirname, "public")));

let ai;

async function getAI() {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("AI_KEY_MISSING");
  }

  if (!ai) {
    const { GoogleGenAI } = await import("@google/genai");
    ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY
    });
  }

  return ai;
}

function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function generateWithRetry(gemini, message) {
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      return await gemini.models.generateContent({
        model: "gemini-3.8-flash",
        contents: message
      });
    } catch (error) {
      const errorText = String(error.message || error);

      if (
        !errorText.includes("503") &&
        !errorText.includes("UNAVAILABLE")
      ) {
        throw error;
      }

      if (attempt === 3) {
        throw error;
      }

      await wait(attempt * 2000);
    }
  }
}

app.post("/api/chat", async (req, res) => {
  const message =
    typeof req.body?.message === "string"
      ? req.body.message.trim()
      : "";

  if (!message) {
    return res.status(400).json({
      error: "প্রশ্ন লিখে পাঠাও।"
    });
  }

  if (message.length > 4000) {
    return res.status(413).json({
      error: "প্রশ্নটি ৪০০০ অক্ষরের মধ্যে রাখো।"
    });
  }

  try {
    const gemini = await getAI();

    const response = await generateWithRetry(gemini, message);

    res.json({
      reply: response.text || "উত্তর পাওয়া যায়নি।"
    });

  } catch (error) {
    console.error("AI error:", error.message);

    res.status(500).json({
      error: "দুঃখিত, AI উত্তর দিতে পারেনি। পরে আবার চেষ্টা করো।"
    });
  }
});

app.listen(PORT, () => {
  console.log(`Pragya AI is running on port ${PORT}`);
});
