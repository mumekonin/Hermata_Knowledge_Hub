import { Controller, Post, Body, BadRequestException } from '@nestjs/common';
import { AiService } from '../service/ai.service';

@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('chat')
  async chat(
    @Body('question') question: string,
    @Body('lang') lang: string,
  ) {
    if (!question || question.trim().length === 0) {
      throw new BadRequestException('Question cannot be empty.');
    }

    const answer = await this.aiService.askGeneralQuestion(question, lang);
    return { answer };
  }
}