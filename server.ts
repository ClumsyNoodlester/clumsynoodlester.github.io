import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Gemini SDK on the server side
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.post("/api/translate", async (req, res) => {
    const { text, targetLang } = req.body;

    if (!text) {
      return res.status(400).json({ error: "Missing text to translate." });
    }

    const langName = targetLang === 'pt' ? 'Portuguese' : 'English';

    try {
      if (Array.isArray(text)) {
        // Translation for bullet points array
        const response = await ai.models.generateContent({
          model: "gemini-3.5-flash",
          contents: `You are a professional IT and sysadmin translator. Translate this list of bullet points or items into professional, corporate, and CV/portfolio-appropriate ${langName}. Preserve technical industry standard terms, acronyms, and proper nouns (e.g. 'Java', 'C', 'NIS2', 'DORA', 'IT', 'Intermarché'). Return a JSON array of strings containing the translations in the exact same order.
          
  List:
  ${JSON.stringify(text)}`,
          config: {
            responseMimeType: "application/json",
          }
        });
        const translatedItems = JSON.parse(response.text?.trim() || "[]");
        return res.json({ translated: translatedItems });
      } else {
        // Translation for single text field
        const response = await ai.models.generateContent({
          model: "gemini-3.5-flash",
          contents: `You are a professional IT and sysadmin translator. Translate the following term, phrase, or paragraph into professional and elegant ${langName}. Preserve technical terms and proper nouns. Return ONLY the translated text with no conversational markup or wrapping. If the string is empty or just whitespace, return it exactly.
          
  Text:
  ${text}`,
        });
        return res.json({ translated: response.text?.trim() || "" });
      }
    } catch (error: any) {
      console.error("Gemini translation error:", error);
      const errMsg = error?.message || String(error);
      res.status(500).json({ error: `Translation failed: ${errMsg}` });
    }
  });

  app.post("/api/messages/:id/reply", async (req, res) => {
    const { id } = req.params;
    const { email, replyText } = req.body;

    console.log(`[MOCK EMAIL] Sending reply to ${email} for message ${id}:`);
    console.log(`Content: ${replyText}`);

    // In a real production app, you would use nodemailer or a service like SendGrid here.
    // Example:
    // await transporter.sendMail({ from: '...', to: email, subject: '...', text: replyText });

    res.json({ 
      success: true, 
      message: "Reply processed and email sent (simulated)." 
    });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
