import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, IsNull, Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { User } from '../entities/user.entity';
import { Team } from '../entities/team.entity';
import { TeamMembership } from '../entities/team-membership.entity';
import { KakaoLoginDto } from './dto/kakao-login.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';

interface KakaoTokenResponse {
  access_token: string;
  token_type: string;
  refresh_token: string;
  expires_in: number;
}

interface KakaoUserInfo {
  id: number;
  kakao_account?: {
    email?: string;
    profile?: {
      nickname?: string;
      profile_image_url?: string;
    };
  };
}

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepo: Repository<User>,
    @InjectRepository(TeamMembership)
    private membershipRepo: Repository<TeamMembership>,
    private jwtService: JwtService,
    private config: ConfigService,
    private dataSource: DataSource,
  ) {}

  async kakaoLogin(dto: KakaoLoginDto) {
    const kakaoToken = await this.exchangeKakaoCode(dto.authorization_code);
    const kakaoUser = await this.getKakaoUserInfo(kakaoToken.access_token);

    const kakaoId = String(kakaoUser.id);
    const email = kakaoUser.kakao_account?.email ?? null;
    const name = kakaoUser.kakao_account?.profile?.nickname ?? '사용자';
    const profileImageUrl =
      kakaoUser.kakao_account?.profile?.profile_image_url ?? null;

    console.log('name:', name, '| hex:', Buffer.from(name).toString('hex'));

    let user = await this.userRepo.findOne({ where: { kakao_id: kakaoId } });
    const isNewUser = !user;

    if (!user) {
      user = this.userRepo.create({
        kakao_id: kakaoId,
        kakao_email: email,
        name,
        profile_image_url: profileImageUrl,
      });
      await this.userRepo.save(user);
    }

    return {
      ...this.issueTokens(user),
      user: {
        id: user.id,
        name: user.name,
        kakao_email: user.kakao_email,
        university: user.university,
        department: user.department,
      },
      is_new_user: isNewUser,
    };
  }

  getKakaoAuthUrl(): string {
    const params = new URLSearchParams({
      response_type: 'code',
      client_id: this.config.get<string>('KAKAO_CLIENT_ID')!,
      redirect_uri: this.config.get<string>('KAKAO_REDIRECT_URI')!,
    });
    return `https://kauth.kakao.com/oauth/authorize?${params.toString()}`;
  }

  async updateProfile(userId: number, dto: UpdateProfileDto) {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('사용자를 찾을 수 없습니다.');

    if (dto.university !== undefined) user.university = dto.university;
    if (dto.department !== undefined) user.department = dto.department;
    if (dto.slack_user_id !== undefined) user.slack_user_id = dto.slack_user_id;
    await this.userRepo.save(user);

    return {
      id: user.id,
      name: user.name,
      university: user.university,
      department: user.department,
      slack_user_id: user.slack_user_id,
    };
  }

  async refresh(refreshToken: string) {
    let payload: { sub: number; type: string };
    try {
      payload = this.jwtService.verify(refreshToken, {
        secret: this.config.get<string>('JWT_SECRET'),
      });
    } catch {
      throw new UnauthorizedException('유효하지 않은 refresh_token입니다.');
    }

    if (payload.type !== 'refresh') {
      throw new UnauthorizedException('유효하지 않은 refresh_token입니다.');
    }

    const user = await this.userRepo.findOne({ where: { id: payload.sub } });
    if (!user) throw new UnauthorizedException('사용자를 찾을 수 없습니다.');
    const { access_token } = this.issueTokens(user);
    return { access_token };
  }

  private issueTokens(user: Pick<User, 'id' | 'name' | 'profile_image_url'>) {
    const secret = this.config.get<string>('JWT_SECRET');
    const access_token = this.jwtService.sign(
      { sub: user.id, name: user.name, picture: user.profile_image_url },
      { secret, expiresIn: this.config.get('JWT_EXPIRES_IN') ?? '7d' },
    );
    const refresh_token = this.jwtService.sign(
      { sub: user.id, type: 'refresh' },
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      { secret, expiresIn: '30d' as any },
    );
    return { access_token, refresh_token };
  }

  private async exchangeKakaoCode(code: string): Promise<KakaoTokenResponse> {
    const params = new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: this.config.get<string>('KAKAO_CLIENT_ID')!,
      client_secret: this.config.get<string>('KAKAO_CLIENT_SECRET')!,
      redirect_uri: this.config.get<string>('KAKAO_REDIRECT_URI')!,
      code,
    });

    const res = await fetch('https://kauth.kakao.com/oauth/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString(),
    });

    if (!res.ok) {
      const err: unknown = await res.json();
      console.error('[Kakao token error]', err);
      throw new UnauthorizedException('카카오 토큰 발급에 실패했습니다.');
    }

    return res.json() as Promise<KakaoTokenResponse>;
  }

  private async getKakaoUserInfo(accessToken: string): Promise<KakaoUserInfo> {
    const res = await fetch('https://kapi.kakao.com/v2/user/me', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!res.ok) {
      throw new UnauthorizedException(
        '카카오 사용자 정보 조회에 실패했습니다.',
      );
    }

    return res.json() as Promise<KakaoUserInfo>;
  }

  // 회원 탈퇴 — 행 내 익명화 + 전 팀 탈퇴 (기여도 기록은 익명으로 보존)
  async deleteAccount(userId: number) {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user || user.is_deleted) {
      throw new NotFoundException('사용자를 찾을 수 없습니다.');
    }

    const memberships = await this.membershipRepo.find({
      where: { user_id: userId, deleted_at: IsNull() },
    });

    // 본인이 팀장인 팀에 다른 활성 멤버가 있으면 위임을 먼저 요구
    for (const m of memberships) {
      if (m.role !== 'leader') continue;
      const count = await this.membershipRepo.count({
        where: { team_id: m.team_id, deleted_at: IsNull() },
      });
      if (count > 1) {
        throw new ConflictException('팀장을 넘긴 뒤 탈퇴할 수 있어요.');
      }
    }

    const kakaoId = user.kakao_id;

    await this.dataSource.transaction(async (manager) => {
      // 전 멤버십 soft delete + 본인이 마지막 멤버였던 팀은 팀도 정리
      for (const m of memberships) {
        const count = await manager.count(TeamMembership, {
          where: { team_id: m.team_id, deleted_at: IsNull() },
        });
        await manager.softRemove(m);
        if (count === 1) {
          const team = await manager.findOne(Team, {
            where: { id: m.team_id },
          });
          if (team) await manager.softRemove(team);
        }
      }

      // 행 내 익명화 — deleted_at은 설정하지 않는다.
      // (soft-delete 필터가 과거 리포트의 사용자 조인을 깨뜨리기 때문)
      user.is_deleted = true;
      user.name = '탈퇴한 사용자';
      user.kakao_id = `deleted:${user.id}`;
      user.kakao_email = null;
      user.profile_image_url = null;
      user.university = null;
      user.department = null;
      await manager.save(user);
    });

    await this.unlinkKakao(kakaoId);
    return { deleted: true };
  }

  // 카카오 앱 연결 끊기 — KAKAO_ADMIN_KEY 미설정 시 건너뜀 (탈퇴 자체는 진행)
  private async unlinkKakao(kakaoId: string) {
    const adminKey = this.config.get<string>('KAKAO_ADMIN_KEY');
    if (!adminKey) {
      console.warn(
        '[Kakao unlink] KAKAO_ADMIN_KEY가 설정되지 않아 연결끊기를 건너뜁니다.',
      );
      return;
    }
    try {
      const res = await fetch('https://kapi.kakao.com/v1/user/unlink', {
        method: 'POST',
        headers: {
          Authorization: `KakaoAK ${adminKey}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          target_id_type: 'user_id',
          target_id: kakaoId,
        }).toString(),
      });
      if (!res.ok) {
        console.warn('[Kakao unlink] 실패:', res.status, await res.text());
      }
    } catch (err) {
      console.warn('[Kakao unlink] 호출 오류:', err);
    }
  }
}
