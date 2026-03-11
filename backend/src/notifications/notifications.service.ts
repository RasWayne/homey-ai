import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, PrismaClient } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateNotificationPreferencesDto } from './dto/update-notification-preferences.dto';

type PrismaExecutor = PrismaClient | Prisma.TransactionClient;

@Injectable()
export class NotificationsService {
  constructor(private readonly prisma: PrismaService) {}

  async list(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return this.prisma.notification.findMany({
      where: { userId },
      select: {
        id: true,
        type: true,
        message: true,
        isRead: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async markRead(id: string, userId: string) {
    const notification = await this.prisma.notification.findUnique({
      where: { id },
      select: {
        id: true,
        userId: true,
      },
    });

    if (!notification) {
      throw new NotFoundException('Notification not found');
    }

    if (notification.userId !== userId) {
      throw new BadRequestException('Notification does not belong to user');
    }

    return this.prisma.notification.update({
      where: { id },
      data: { isRead: true },
      select: {
        id: true,
        type: true,
        message: true,
        isRead: true,
        createdAt: true,
      },
    });
  }

  async updatePreferences(userId: string, dto: UpdateNotificationPreferencesDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return this.prisma.user.update({
      where: { id: userId },
      data: {
        ...(dto.emailEnabled !== undefined ? { emailEnabled: dto.emailEnabled } : {}),
        ...(dto.smsEnabled !== undefined ? { smsEnabled: dto.smsEnabled } : {}),
        ...(dto.pushEnabled !== undefined ? { pushEnabled: dto.pushEnabled } : {}),
      },
      select: {
        id: true,
        emailEnabled: true,
        smsEnabled: true,
        pushEnabled: true,
      },
    });
  }

  async createNotification(
    userId: string,
    type: string,
    message: string,
    prismaClient: PrismaExecutor = this.prisma,
  ) {
    const trimmedMessage = message.trim();
    if (!trimmedMessage) {
      throw new BadRequestException('message cannot be empty');
    }

    const user = await prismaClient.user.findUnique({
      where: { id: userId },
      select: { id: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return prismaClient.notification.create({
      data: {
        userId,
        type,
        message: trimmedMessage,
      },
      select: {
        id: true,
        type: true,
        message: true,
        isRead: true,
        createdAt: true,
      },
    });
  }
}
