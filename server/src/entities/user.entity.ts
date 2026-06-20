import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id!: number;

  @Column({ type: 'varchar', length: 64, unique: true })
  kakao_id!: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  kakao_email!: string | null;

  @Column({ type: 'varchar', length: 50 })
  name!: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  university!: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  department!: string | null;

  @Column({ type: 'varchar', length: 500, nullable: true })
  profile_image_url!: string | null;

  @Column({ type: 'boolean', default: false })
  email_opt_out!: boolean;

  @Column({ type: 'varchar', length: 32, nullable: true })
  slack_user_id!: string | null;

  // 탈퇴는 행 내 익명화 방식(이름·카카오 식별자 제거) — deleted_at을 쓰면
  // TypeORM soft-delete 필터가 과거 리포트의 사용자 조인을 null로 만들기 때문.
  @Column({ type: 'boolean', default: false })
  is_deleted!: boolean;

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;

  @DeleteDateColumn()
  deleted_at!: Date | null;
}
