import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
} from 'typeorm';

// 확정 발화(텍스트만). 음성 원본은 저장하지 않는다.
@Entity('utterances')
@Index(['meeting_id', 'user_id'])
// 안건 완료 시 LLM 요약이 agenda_id 단독 조건으로 최대 테이블을 조회 — 풀스캔 방지
@Index(['agenda_id'])
export class Utterance {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id!: number;

  @Column({ type: 'bigint', unsigned: true })
  meeting_id!: number;

  @Column({ type: 'bigint', unsigned: true })
  user_id!: number;

  @Column({ type: 'text' })
  text!: string;

  @Column({ type: 'int' })
  char_count!: number;

  // Web Speech alternative.confidence (0~1) 그대로 저장, null 허용
  @Column({ type: 'float', nullable: true })
  confidence!: number | null;

  @Column({ type: 'int' })
  started_at_offset_ms!: number;

  @Column({ type: 'int' })
  ended_at_offset_ms!: number;

  // ★ 발화 시점 진행 중 안건에 자동 매칭
  @Column({ type: 'bigint', unsigned: true, nullable: true })
  agenda_id!: number | null;

  @CreateDateColumn()
  created_at!: Date;
}
