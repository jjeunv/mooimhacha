import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Meeting } from '../entities/meeting.entity';
import { Agenda } from '../entities/agenda.entity';
import { Utterance } from '../entities/utterance.entity';
import { Decision } from '../entities/decision.entity';
import { ActionItem } from '../entities/action-item.entity';
import { TeamMembership } from '../entities/team-membership.entity';
import { PresenceEvent } from '../entities/presence-event.entity';
import { TeamSettings } from '../entities/team-settings.entity';
import { TeamsModule } from '../teams/teams.module';
import { ContributionsModule } from '../contributions/contributions.module';
import { LlmModule } from '../llm/llm.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { SlackModule } from '../slack/slack.module';
import { MeetingsController } from './meetings.controller';
import { MeetingsService } from './meetings.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Meeting,
      Agenda,
      Utterance,
      Decision,
      ActionItem,
      TeamMembership,
      PresenceEvent,
      TeamSettings,
    ]),
    TeamsModule,
    ContributionsModule,
    LlmModule,
    NotificationsModule,
    SlackModule,
  ],
  controllers: [MeetingsController],
  providers: [MeetingsService],
  exports: [MeetingsService],
})
export class MeetingsModule {}
