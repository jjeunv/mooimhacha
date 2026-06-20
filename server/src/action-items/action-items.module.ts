import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ActionItem } from '../entities/action-item.entity';
import { TeamSettings } from '../entities/team-settings.entity';
import { User } from '../entities/user.entity';
import { TeamsModule } from '../teams/teams.module';
import { SlackModule } from '../slack/slack.module';
import { ActionItemsController } from './action-items.controller';
import { ActionItemsService } from './action-items.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([ActionItem, TeamSettings, User]),
    TeamsModule,
    SlackModule,
  ],
  controllers: [ActionItemsController],
  providers: [ActionItemsService],
  exports: [ActionItemsService],
})
export class ActionItemsModule {}
