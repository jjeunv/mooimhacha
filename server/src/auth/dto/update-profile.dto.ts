import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateProfileDto {
  @ApiPropertyOptional({ example: '인하대학교' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  university?: string;

  @ApiPropertyOptional({ example: '컴퓨터공학과' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  department?: string;

  @ApiPropertyOptional({ example: 'U0123456', description: 'Slack 유저 ID' })
  @IsOptional()
  @IsString()
  @MaxLength(32)
  slack_user_id?: string;
}
