import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { TeamsModule } from './teams/teams.module';
import { ContributionModule } from './contribution/contribution.module';
import { buildTypeOrmOptions } from './data-source';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        // DB 옵션 단일 출처 — data-source.ts(마이그레이션 CLI)와 공유
        ...buildTypeOrmOptions((key) => config.get<string>(key)),
        synchronize: config.get<string>('NODE_ENV') !== 'production',
      }),
      inject: [ConfigService],
    }),
    AuthModule,
    TeamsModule,
    ContributionModule,
  ],
})
export class AppModule {}
