import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Notification } from '../entities/notification.entity';
import { Meeting } from '../entities/meeting.entity';
import { TeamMembership } from '../entities/team-membership.entity';
import { User } from '../entities/user.entity';
import { ActionItem } from '../entities/action-item.entity';
import { TeamSettings } from '../entities/team-settings.entity';
import { SlackModule } from '../slack/slack.module';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Notification,
      Meeting,
      TeamMembership,
      User,
      ActionItem,
      TeamSettings,
    ]),
    SlackModule,
  ],
  controllers: [NotificationsController],
  providers: [NotificationsService],
  exports: [NotificationsService],
})
export class NotificationsModule {}
