const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
app.use(express.json());

// Endpoint: Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

// Endpoint: Ask the AI Agent
app.post("/ask", (req, res) => {
  const { question } = req.body;
  const portfolioPath = path.join(__dirname, "memory", "userPortfolio.json");
  const promptPath = path.join(__dirname, "prompts", "advisor.txt");

  try {
    const portfolioData = JSON.parse(fs.readFileSync(portfolioPath, "utf-8"));
    const promptTemplate = fs.readFileSync(promptPath, "utf-8");
    const filledPrompt = promptTemplate.replace("{portfolioData}", JSON.stringify(portfolioData, null, 2));

    // Here you can integrate OpenAI API or Claude if needed.
    const fakeAnswer = "✅ بعد مراجعة المحفظة: الوقت غير مناسب للسحب بسبب IL مرتفع في زوج ETH/USDC. يُنصح بإعادة التوازن اليوم.";

    res.json({
      prompt: filledPrompt,
      answer: fakeAnswer
    });
  } catch (err) {
    res.status(500).json({ error: "Internal error", details: err.message });
  }
});

// Run the server
app.listen(4000, () => {
  console.log("MCP Agent running at http://localhost:4000");
});
