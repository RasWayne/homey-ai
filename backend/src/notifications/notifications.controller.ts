import { Body, Controller, Get, Param, ParseUUIDPipe, Patch, Query } from '@nestjs/common';
import { UpdateNotificationPreferencesDto } from './dto/update-notification-preferences.dto';
import { NotificationsService } from './notifications.service';

@Controller()
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get('notifications')
  list(@Query('userId', new ParseUUIDPipe()) userId: string) {
    return this.notificationsService.list(userId);
  }

  @Patch('notifications/:id/read')
  markRead(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Query('userId', new ParseUUIDPipe()) userId: string,
  ) {
    return this.notificationsService.markRead(id, userId);
  }

  @Patch('users/me/notification-preferences')
  updatePreferences(
    @Query('userId', new ParseUUIDPipe()) userId: string,
    @Body() dto: UpdateNotificationPreferencesDto,
  ) {
    return this.notificationsService.updatePreferences(userId, dto);
  }
}
