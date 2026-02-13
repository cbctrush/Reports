// api/rewrite.js
import { GoogleGenerativeAI } from "@google/generative-ai";

export default async function handler(req, res) {
  // 1. Get the prompt from the frontend
  const { notes, patientName } = req.body;

  if (!process.env.GEMINI_API_KEY) {
    return res.status(500).json({ error: "API Key missing" });
  }

  try {
    // 2. Setup Gemini
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // 3. The Instruction to the AI
    const prompt = `
      You are an expert Endodontist's assistant. 
      Task: Rewrite the following rough notes into a professional, formal French dental report for a referring dentist.
      
      Context:
      - Patient: ${patientName}
      - Tone: Professional, clinical, precise (use "nous", "il/elle").
      - Output language: French ONLY.
      - Do not add fake dates or fake names if not provided.
      - Clean up grammar and logic flow.

      Rough Notes:
      "${notes}"
    `;

    // 4. Generate
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // 5. Send back to frontend
    res.status(200).json({ output: text });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to generate report" });
  }
}