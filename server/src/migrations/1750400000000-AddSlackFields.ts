import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddSlackFields1750400000000 implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`users\` ADD COLUMN \`slack_user_id\` VARCHAR(32) NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`team_settings\` ADD COLUMN \`slack_bot_token\` VARCHAR(200) NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`team_settings\` ADD COLUMN \`slack_channel_id\` VARCHAR(32) NULL`,
    );
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`team_settings\` DROP COLUMN \`slack_channel_id\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`team_settings\` DROP COLUMN \`slack_bot_token\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`users\` DROP COLUMN \`slack_user_id\``,
    );
  }
}
