import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { CreateDocumentDto } from './dto/create-document.dto';
import { CreateUploadUrlDto } from './dto/create-upload-url.dto';
import { DocumentsService } from './documents.service';

@Controller()
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  @Post('documents/upload-url')
  createUploadUrl(@Body() dto: CreateUploadUrlDto) {
    return this.documentsService.createUploadUrl(dto);
  }

  @Post('documents')
  create(@Body() dto: CreateDocumentDto) {
    return this.documentsService.create(dto);
  }

  @Get('transactions/:id/documents')
  listByTransaction(@Param('id') id: string) {
    return this.documentsService.listByTransaction(id);
  }

  @Get('documents/:id/access-url')
  createAccessUrl(@Param('id') id: string) {
    return this.documentsService.createAccessUrl(id);
  }
}
