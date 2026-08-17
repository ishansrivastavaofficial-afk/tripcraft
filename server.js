import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public'))); 

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY});

app.post('/api/generate-itinerary', async (req, res) => {
  try {
    const { destination, days, budget, interests, travelStyle } = req.body;
    
    // We update the prompt to strictly match the visual layout of your reference images
    const prompt = `You are a professional travel planner. Plan a ${days}-day trip to${destination}.
      Budget: ${budget}. Travel Style: ${travelStyle}. Interests: ${interests}.
      
      Format your response STRICTLY using this exact Markdown structure:

      ## ${destination}
      **Est. total: ${budget}**
      
      ---
      
      ### DAY 01: [Insert Day Theme Here]
      * **10:00 AM** - [Activity 1 description] _(INR [Cost])_
      * **01:00 PM** - [Activity 2 description] _(INR [Cost])_
      * **04:00 PM** - [Activity 3 description] _(INR [Cost])_
      * **07:00 PM** - [Activity 4 description] _(INR [Cost])_
      
      **🍽️ Food:** Breakfast: [Idea] - Lunch: [Idea] - Dinner: [Idea]
      **💡 Tip:** [A specific tip for this day]
      
      ---
      (Repeat for all ${days} days)

      ### 🎒 PACKING CHECKLIST
      * [Item 1]
      * [Item 2]
      
      ### 📍 TRAVEL TIPS
      * [Tip 1]
      * [Tip 2]`;

    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Transfer-Encoding', 'chunked');

    const responseStream = await ai.models.generateContentStream({
      model: 'gemini-3.6-flash',
      contents: prompt,
    });

    for await (const chunk of responseStream) {
      if (chunk.text) res.write(chunk.text);
    }
    res.end();
  } catch (error) {
    console.error('\n--- GEMINI API ERROR ---');
    console.error(error.message || error);
    res.status(500).write('\n\n[Error generating itinerary.]');
    res.end();
  }
});

const server = app.listen(PORT, () => {
  console.log(`TripCraft server running at http://localhost:${PORT}`);
});
server.keepAliveTimeout = 65000;
server.headersTimeout = 66000;