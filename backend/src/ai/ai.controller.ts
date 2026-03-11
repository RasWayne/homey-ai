import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { AiService } from './ai.service';
import { CreateAiMessageDto } from './dto/create-ai-message.dto';
import { CreateAiSessionDto } from './dto/create-ai-session.dto';
import { ExplainDocumentDto } from './dto/explain-document.dto';

@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('sessions')
  createSession(@Body() dto: CreateAiSessionDto) {
    return this.aiService.createSession(dto);
  }

  @Post('sessions/:id/messages')
  createMessage(
    @Param('id') id: string,
    @Body() dto: CreateAiMessageDto,
  ) {
    return this.aiService.createMessage(id, dto);
  }

  @Get('sessions/:id/messages')
  listMessages(@Param('id') id: string) {
    return this.aiService.listMessages(id);
  }

  @Post('documents/:id/explain')
  explainDocument(
    @Param('id') id: string,
    @Body() dto: ExplainDocumentDto,
  ) {
    return this.aiService.explainDocument(id, dto);
  }
}
