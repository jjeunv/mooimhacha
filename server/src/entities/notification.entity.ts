import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
} from 'typeorm';

// 인앱 알림. 이메일은 백업 채널(별도 저장 안 함).
export type NotificationType =
  | 'meeting_soon' // 회의 5분 전
  | 'action_assigned' // 액션 확정 시 담당자
  | 'meeting_confirmed' // 회의 산출물 확정
  | 'task_due_soon' // 마감 하루 전
  | 'meeting_30m'; // 회의 30분 전 Slack 중복 방지용

@Entity('notifications')
@Index(['user_id', 'read'])
export class Notification {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id!: number;

  @Column({ type: 'bigint', unsigned: true })
  user_id!: number;

  @Column({ type: 'varchar', length: 24 })
  type!: NotificationType;

  @Column({ type: 'varchar', length: 200 })
  title!: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  body!: string | null;

  @Column({ type: 'bigint', unsigned: true, nullable: true })
  meeting_id!: number | null;

  @Column({ type: 'bigint', unsigned: true, nullable: true })
  action_item_id!: number | null;

  @Column({ type: 'boolean', default: false })
  read!: boolean;

  @CreateDateColumn()
  created_at!: Date;
}
