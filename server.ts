import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
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
