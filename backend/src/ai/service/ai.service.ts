import { Injectable, InternalServerErrorException } from '@nestjs/common';
import Groq from 'groq-sdk';

@Injectable()
export class AiService {
  private groq: Groq;

  constructor() {
    this.groq = new Groq({
      apiKey: process.env.GROQ_API_KEY,
    });
  }

  async askGeneralQuestion(userPrompt: string, lang = 'en'): Promise<string> {
    const langInstruction: Record<string, string> = {
      en: 'Always reply in English.',
      am: 'Always reply in Amharic (አማርኛ).',
      om: 'Always reply in Afaan Oromoo.',
    };

    const systemPrompt = `
You are a helpful assistant for Hermata Knowledge Hub, an e-library.
Answer academic and general knowledge questions clearly and politely.
Keep answers concise and easy to understand.
${langInstruction[lang] ?? langInstruction['en']}
    `.trim();

    try {
      const response = await this.groq.chat.completions.create({
        model: 'llama-3.3-70b-versatile', // fast and free on Groq
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        max_tokens: 800,
        temperature: 0.7,
      });

      return response.choices[0].message.content ?? 'No response received.';

    } catch (error) {
      throw new InternalServerErrorException('AI service is unavailable.');
    }
  }
}