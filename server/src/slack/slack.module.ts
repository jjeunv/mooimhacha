import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TeamSettings } from '../entities/team-settings.entity';
import { SlackController } from './slack.controller';
import { SlackService } from './slack.service';

@Module({
  imports: [TypeOrmModule.forFeature([TeamSettings])],
  controllers: [SlackController],
  providers: [SlackService],
  exports: [SlackService],
})
export class SlackModule {}
