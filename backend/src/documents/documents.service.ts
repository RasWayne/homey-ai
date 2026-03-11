import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDocumentDto } from './dto/create-document.dto';
import { CreateUploadUrlDto } from './dto/create-upload-url.dto';

@Injectable()
export class DocumentsService {
  constructor(private readonly prisma: PrismaService) {}

  async createUploadUrl(
    dto: CreateUploadUrlDto,
  ): Promise<{ uploadUrl: string; fileUrl: string }> {
    const transaction = await this.prisma.transaction.findUnique({
      where: { id: dto.transactionId },
      select: { id: true },
    });

    if (!transaction) {
      throw new NotFoundException('Transaction not found');
    }

    const fileName = dto.fileName.trim();
    if (!fileName) {
      throw new BadRequestException('fileName cannot be empty');
    }

    const safeFileName = fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
    const objectKey = `${dto.transactionId}/${Date.now()}-${safeFileName}`;
    const signature = randomUUID();

    return {
      uploadUrl: `https://storage.placeholder.local/upload/${objectKey}?signature=${signature}&contentType=${encodeURIComponent(dto.contentType)}`,
      fileUrl: `https://storage.placeholder.local/files/${objectKey}`,
    };
  }

  async create(dto: CreateDocumentDto) {
    const fileUrl = dto.fileUrl.trim();
    if (!fileUrl) {
      throw new BadRequestException('fileUrl cannot be empty');
    }
    const documentType = dto.documentType.trim();
    if (!documentType) {
      throw new BadRequestException('documentType cannot be empty');
    }

    const [transaction, uploader] = await Promise.all([
      this.prisma.transaction.findUnique({
        where: { id: dto.transactionId },
        select: { id: true, userId: true },
      }),
      this.prisma.user.findUnique({
        where: { id: dto.uploadedBy },
        select: { id: true },
      }),
    ]);

    if (!transaction) {
      throw new NotFoundException('Transaction not found');
    }

    if (!uploader) {
      throw new NotFoundException('Uploader not found');
    }

    if (transaction.userId !== dto.uploadedBy) {
      throw new BadRequestException(
        'Document uploader must belong to the transaction owner',
      );
    }

    return this.prisma.document.create({
      data: {
        transactionId: dto.transactionId,
        uploadedBy: dto.uploadedBy,
        documentType,
        fileUrl,
      },
      select: {
        id: true,
        transactionId: true,
        uploadedBy: true,
        documentType: true,
        fileUrl: true,
        uploadedAt: true,
        createdAt: true,
      },
    });
  }

  async listByTransaction(transactionId: string) {
    const transaction = await this.prisma.transaction.findUnique({
      where: { id: transactionId },
      select: { id: true },
    });

    if (!transaction) {
      throw new NotFoundException('Transaction not found');
    }

    return this.prisma.document.findMany({
      where: { transactionId },
      select: {
        id: true,
        transactionId: true,
        documentType: true,
        fileUrl: true,
        uploadedAt: true,
        createdAt: true,
        uploader: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createAccessUrl(id: string): Promise<{ accessUrl: string; fileUrl: string }> {
    const document = await this.prisma.document.findUnique({
      where: { id },
      select: {
        id: true,
        transactionId: true,
        fileUrl: true,
      },
    });

    if (!document) {
      throw new NotFoundException('Document not found');
    }

    if (!document.fileUrl.trim()) {
      throw new BadRequestException('Document fileUrl is invalid');
    }

    const temporaryToken = randomUUID();
    return {
      accessUrl: `${document.fileUrl}?tempToken=${temporaryToken}&expiresIn=900`,
      fileUrl: document.fileUrl,
    };
  }
}
