import 'reflect-metadata';
import { join } from 'path';
import { config as loadDotenv } from 'dotenv';
import { DataSource, DataSourceOptions } from 'typeorm';
import { ALL_ENTITIES } from './entities';

// 마이그레이션 CLI(typeorm migration:*)로 단독 실행될 때 server/.env를 읽는다.
// - 앱 부팅 경로에서는 @nestjs/config가 같은 파일을 로드하며, dotenv는 이미 설정된
//   process.env 값을 덮어쓰지 않으므로 중복 호출돼도 무해하다.
// - dotenv는 @nestjs/config의 직접 의존성이라 production 설치(--omit=dev)에도 항상 존재.
loadDotenv();

// app.module.ts(TypeOrmModule.forRootAsync)와 마이그레이션 CLI(AppDataSource)가 공유하는
// DB 옵션의 단일 출처. 두 곳의 설정이 어긋나면 migration:generate가 가짜 diff를 만들므로
// DB 접속·charset·timezone·엔티티 목록 변경은 반드시 이 함수에서만 한다.
// (synchronize는 의도적으로 제외 — 앱은 dev 자동 동기화, CLI는 항상 off로 서로 다르다)
export function buildTypeOrmOptions(
  get: (key: string) => string | undefined,
): DataSourceOptions {
  return {
    type: 'mysql',
    host: get('DB_HOST'),
    port: Number(get('DB_PORT')),
    username: get('DB_USER'),
    password: get('DB_PASSWORD'),
    database: get('DB_NAME'),
    entities: ALL_ENTITIES,
    timezone: '+09:00',
    // 한글 등 멀티바이트 문자 깨짐(???) 방지
    charset: 'utf8mb4',
    // bigint PK/FK를 JS number로 반환. TypeORM 기본값(true)은 문자열로 직렬화해
    // API 응답의 id가 "1"로 나가는데 입력 검증(@IsInt)은 숫자만 받는 자기모순이 생긴다.
    // Number 안전 범위(2^53)를 넘는 값만 문자열 폴백 — auto-increment id에선 도달 불가.
    bigNumberStrings: false,
  };
}

// 마이그레이션 CLI 전용 DataSource (사용법: docs/12-배포.md §5)
// - synchronize는 CLI에서 항상 off — initialize() 시 의도치 않은 스키마 자동 변경 방지.
// - migrations 글롭: ts 소스 실행(src/) 시 *.ts, 빌드 산출물(dist/) 실행 시 *.js가 잡힌다.
// - 주의: TypeORM 1.0.0 CLI는 파일 내 DataSource export가 정확히 1개여야 한다
//   (default 중복 export 금지) — 추가 DataSource를 export하지 말 것.
export const AppDataSource = new DataSource({
  ...buildTypeOrmOptions((key) => process.env[key]),
  synchronize: false,
  migrations: [join(__dirname, 'migrations', '*{.ts,.js}')],
});
