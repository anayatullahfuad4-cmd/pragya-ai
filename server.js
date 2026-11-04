// Pragya AI starter backend — provider connection is intentionally not configured yet.
const express = require("express");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: "20kb" }));
app.use(express.static(path.join(__dirname, "public")));

app.post("/api/chat", async (req, res) => {
  const message = typeof req.body?.message === "string" ? req.body.message.trim() : "";

  if (!message) {
    return res.status(400).json({ error: "প্রশ্ন লিখে পাঠাও।" });
  }
  if (message.length > 4000) {
    return res.status(413).json({ error: "প্রশ্নটি ৪০০০ অক্ষরের মধ্যে রাখো।" });
  }

  // A trusted AI provider will be connected here later.
  // Keep any API key on the server in an environment variable.
  return res.status(503).json({
    error: "প্রজ্ঞা AI-এর AI সংযোগ এখনো সেটআপ করা হয়নি। সার্ভার প্রস্তুত আছে।"
  });
});

app.listen(PORT, () => {
  console.log(`Pragya AI is running on port ${PORT}`);
});
