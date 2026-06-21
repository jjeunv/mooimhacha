import { MigrationInterface, QueryRunner } from 'typeorm';

// 지각 기준(분)을 팀 설정에서 조정 가능하게.
// 기존엔 meeting-absences.service.ts 의 isLateByPresence 가 300초(5분) 하드코딩이었음.
export class AddLateThresholdMinutes1750600000000
  implements MigrationInterface
{
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`team_settings\` ADD COLUMN \`late_threshold_minutes\` INT NOT NULL DEFAULT 5`,
    );
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`team_settings\` DROP COLUMN \`late_threshold_minutes\``,
    );
  }
}
