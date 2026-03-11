import { Body, Controller, Post } from '@nestjs/common';

@Controller('chat')
export class ChatController {
  @Post()
  async chat(@Body() body: { message: string }) {
    return {
      reply: "Hello! I'm Homey AI. How can I help with your home purchase or sale today?",
      received: body.message,
    };
  }
}
