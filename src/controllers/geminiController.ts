import { Request, Response } from 'express';
import { chatWithAssistant, analyzeEligibility, verifyDocument } from '../services/geminiService.js';

export async function chat(req: Request, res: Response) {
  try {
    const { history, userInput, language } = req.body;
    if (!userInput) {
      res.status(400).json({ error: 'userInput is required' });
      return;
    }
    const text = await chatWithAssistant(history || [], userInput, language || 'en');
    res.json({ text });
  } catch (error: any) {
    console.error('Backend Gemini Chat Error:', error);
    res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
}

export async function analyze(req: Request, res: Response) {
  try {
    const { profile, schemes, language } = req.body;
    if (!profile || !schemes) {
      res.status(400).json({ error: 'profile and schemes are required' });
      return;
    }
    const text = await analyzeEligibility(profile, schemes, language || 'en');
    res.json({ text });
  } catch (error: any) {
    console.error('Backend Gemini Eligibility Error:', error);
    res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
}

export async function verify(req: Request, res: Response) {
  try {
    const { imageData, schemeName, language } = req.body;
    if (!imageData || !schemeName) {
      res.status(400).json({ error: 'imageData and schemeName are required' });
      return;
    }
    const text = await verifyDocument(imageData, schemeName, language || 'en');
    res.json({ text });
  } catch (error: any) {
    console.error('Backend Gemini Verify Error:', error);
    res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
}
