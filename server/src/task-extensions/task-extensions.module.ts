import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ActionItem } from '../entities/action-item.entity';
import { TaskExtensionRequest } from '../entities/task-extension-request.entity';
import { User } from '../entities/user.entity';
import { TeamMembership } from '../entities/team-membership.entity';
import { TeamSettings } from '../entities/team-settings.entity';
import { TeamsModule } from '../teams/teams.module';
import { SlackModule } from '../slack/slack.module';
import { TaskExtensionsController } from './task-extensions.controller';
import { TaskExtensionsService } from './task-extensions.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      TaskExtensionRequest,
      ActionItem,
      User,
      TeamMembership,
      TeamSettings,
    ]),
    TeamsModule,
    SlackModule,
  ],
  controllers: [TaskExtensionsController],
  providers: [TaskExtensionsService],
  exports: [TaskExtensionsService],
})
export class TaskExtensionsModule {}
