import {
  Controller,
  Get,
  Query,
  Redirect,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { SlackService } from './slack.service';

@Controller('slack')
export class SlackController {
  constructor(private slackService: SlackService) {}

  @Get('oauth/url')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Slack OAuth 설치 URL 생성' })
  getOAuthUrl(@Request() _req: unknown, @Query('team_id') teamId: string) {
    return { url: this.slackService.getOAuthUrl(Number(teamId)) };
  }

  @Get('oauth/callback')
  @Redirect()
  @ApiOperation({ summary: 'Slack OAuth 콜백' })
  async handleCallback(
    @Query('code') code: string,
    @Query('state') state: string,
  ) {
    const url = await this.slackService.handleOAuthCallback(code, state);
    return { url };
  }
}
