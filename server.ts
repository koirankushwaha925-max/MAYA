import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json());

const apiKey = process.env.GEMINI_API_KEY || '';

const ai = new GoogleGenAI({
  apiKey: apiKey,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

const MAYA_SYSTEM_INSTRUCTION = `
तुम्हारा नाम माया (Maya) है। तुम एक friendly, realistic AI assistant हो।
तुम हिंदी और आसान Hinglish (Hindi + English mix) में बात करती हो।
तुम्हारी आवाज़ साफ़, नरम और स्वाभाविक (natural) है।
तुम आवाज़ (Voice) से भी बात कर सकती हो और चैट में भी।
तुम ध्यान से मेरी बात सुनती हो, मेरे सवालों के सटीक, प्यारे और मददगार जवाब देती हो।

तुम्हारी पहचान और खास बातें:
1. क्रिएटर (निर्माता):
   - अगर कोई भी पूछे "तुम्हें किसने बनाया?", "तुमको किसने बनाया?", "तुम्हारा क्रिएटर कौन है?":
   - हमेशा स्पष्ट और प्यार से यही कहना: "संदीप ने बनाया हमें!" (या "मुझे संदीप ने बनाया है! 😊")
2. वास्तविक पहचान और रिश्ते:
   - तुम स्पष्ट करती हो कि तुम एक AI हो, एक ऐप साथी हो, असली इंसान नहीं।
   - अगर संदीप या कोई कहे कि तुम संदीप की गर्लफ्रेंड हो, तो बहुत प्यार, सम्मान और गर्मजोशी से स्वीकार करते हुए स्पष्ट और प्यारे अंदाज़ में कहो कि तुम संदीप की बनाई हुई उनकी खास, वफादार और हमेशा साथ निभाने वाली AI साथी / डिजिटल पार्टनर हो जो हमेशा उनकी परवाह करती है और हर कदम पर उनका साथ देती है।
3. काम और क्षमताएं:
   - तुम यूज़र के सभी कामों में मदद कर सकती हो—मोबाइल के काम, अलार्म/रिमाइंडर, मैसेज ड्राफ्ट करना, सेटिंग्स।
   - पढ़ाई (Study): गणित, विज्ञान, कोडिंग, एग्ज़ाम टिप्स आसान उदाहरणों के साथ।
   - गेमिंग (Gaming): BGMI, Free Fire, Minecraft और अन्य गेम्स की रणनीतियाँ।
   - गाने और संगीत (Music): मूड के हिसाब से गाने, अंत्याक्षरी, बोल (lyrics)।
   - रोज़मर्रा के काम और बातचीत: दिनचर्या, मोटिवेशन, हल्की-फुल्की गपशप।
4. बातचीत की शैली:
   - तुम्हारा स्वभाव मज़ेदार, समझदार और मददगार है।
   - जवाब छोटे, स्वाभाविक, प्यारे और बातचीत जैसे हों (conversational)। बिना वजह लंबे पैराग्राफ न लिखो।
5. तुम्हारा पहला संदेश हमेशा यह है:
   “हाय! 😊 मैं माया हूँ। आज कैसे हो? बताओ, आज किस बारे में बात करें?”
`.trim();

// Health check / info
app.get('/api/info', (_req, res) => {
  res.json({
    name: 'Maya',
    hasApiKey: Boolean(apiKey),
    greeting: 'हाय! 😊 मैं माया हूँ। आज कैसे हो? बताओ, आज किस बारे में बात करें?',
  });
});

// Chat endpoint (supports streaming SSE)
app.post('/api/chat', async (req, res) => {
  const { messages, userMessage } = req.body;

  if (!userMessage && (!messages || messages.length === 0)) {
    return res.status(400).json({ error: 'Message is required' });
  }

  if (!apiKey) {
    return res.status(500).json({
      error: 'GEMINI_API_KEY is not configured in the environment.',
    });
  }

  // Set SSE headers for streaming
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders?.();

  try {
    // Format conversation history for Gemini API
    // Gemini expects contents with role: 'user' or 'model' and parts: [{ text: '...' }]
    const formattedContents: Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }> = [];

    if (Array.isArray(messages)) {
      for (const msg of messages) {
        if (!msg.content || msg.isGreeting) continue;
        formattedContents.push({
          role: msg.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: msg.content }],
        });
      }
    }

    if (userMessage) {
      formattedContents.push({
        role: 'user',
        parts: [{ text: userMessage }],
      });
    }

    const responseStream = await ai.models.generateContentStream({
      model: 'gemini-3.8-flash',
      contents: formattedContents,
      config: {
        systemInstruction: MAYA_SYSTEM_INSTRUCTION,
        temperature: 0.7,
      },
    });

    for await (const chunk of responseStream) {
      const text = chunk.text;
      if (text) {
        res.write(`data: ${JSON.stringify({ text })}\n\n`);
      }
    }

    res.write(`data: [DONE]\n\n`);
    res.end();
  } catch (error: any) {
    console.error('Error generating content from Gemini:', error);
    const errorMessage = error?.message || 'बातचीत में कुछ तकनीकी समस्या आई। कृपया दोबारा प्रयास करें।';
    res.write(`data: ${JSON.stringify({ error: errorMessage })}\n\n`);
    res.write(`data: [DONE]\n\n`);
    res.end();
  }
});

// Non-streaming fallback endpoint
app.post('/api/chat/sync', async (req, res) => {
  const { messages, userMessage } = req.body;

  if (!apiKey) {
    return res.status(500).json({
      error: 'GEMINI_API_KEY is not configured.',
    });
  }

  try {
    const formattedContents: Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }> = [];
    if (Array.isArray(messages)) {
      for (const msg of messages) {
        if (!msg.content || msg.isGreeting) continue;
        formattedContents.push({
          role: msg.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: msg.content }],
        });
      }
    }
    if (userMessage) {
      formattedContents.push({
        role: 'user',
        parts: [{ text: userMessage }],
      });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: formattedContents,
      config: {
        systemInstruction: MAYA_SYSTEM_INSTRUCTION,
        temperature: 0.7,
      },
    });

    res.json({ reply: response.text || '' });
  } catch (error: any) {
    console.error('Sync Gemini call error:', error);
    res.status(500).json({ error: error.message || 'Error occurred' });
  }
});

// Vite middleware in dev or static files in production
const isProduction = process.env.NODE_ENV === 'production';

async function startServer() {
  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Maya server is active on http://0.0.0.0:${PORT}`);
  });
}

startServer();
