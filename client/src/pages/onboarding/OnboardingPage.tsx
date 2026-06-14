import "@/styles/onboarding.css";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/useToast";
import { apiFetch, authHeader } from "@/lib/apiFetch";

// 그룹 생성 시 함께 지정하는 팀 설정 — 값은 서버 TeamSettings 엔티티 default 와 일치.
// 기본값에서 바뀐 항목만 생성 직후 PATCH /teams/:id/settings 로 저장한다.
interface OnboardingSettings {
  contribution_visibility: "team" | "self" | "leader";
  absent_meeting_handling: "exclude" | "zero" | "attendance_only";
  deadline_penalty_curve: "standard" | "lenient" | "strict";
  min_meeting_minutes: number;
  leader_bonus_multiplier: number;
}

const DEFAULT_SETTINGS: OnboardingSettings = {
  contribution_visibility: "team",
  absent_meeting_handling: "exclude",
  deadline_penalty_curve: "standard",
  min_meeting_minutes: 5,
  leader_bonus_multiplier: 1.0,
};

export default function OnboardingPage() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [step, setStep] = useState(0);
  const [teamId, setTeamId] = useState(0);
  const [teamName, setTeamName] = useState("");
  const [selectedChip, setSelectedChip] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [copied, setCopied] = useState(false);
  // 팀 설정 접이식 — 기본 접힘. 펼쳐서 바꾼 값만 생성 후 PATCH 한다.
  const [showSettings, setShowSettings] = useState(false);
  const [settings, setSettings] = useState<OnboardingSettings>({
    ...DEFAULT_SETTINGS,
  });

  async function copyCode() {
    try {
      await navigator.clipboard.writeText(inviteCode);
    } catch {
      const el = document.createElement("textarea");
      el.value = inviteCode;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
    }
    setCopied(true);
    showToast("초대코드가 복사됐습니다");
    setTimeout(() => setCopied(false), 2000);
  }

  async function createTeam() {
    if (!teamName.trim()) {
      showToast("그룹 이름을 입력해주세요");
      return;
    }
    setIsCreating(true);
    try {
      type CreateTeamResponse = {
        id: number;
        name: string;
        course_name: string;
        invite_code: string;
        created_by: number;
      };

      const data = await apiFetch<CreateTeamResponse>("/api/teams", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...authHeader(),
        },
        body: JSON.stringify({
          name: teamName.trim(),
          course_name: selectedChip || "기타",
        }),
      });

      // 기본값에서 바뀐 팀 설정만 저장 — 서버 계약(PATCH settings) 재사용, 생성 API 는 그대로.
      const changed = Object.fromEntries(
        Object.entries(settings).filter(
          ([k, v]) => v !== DEFAULT_SETTINGS[k as keyof OnboardingSettings],
        ),
      );
      if (Object.keys(changed).length > 0) {
        try {
          await apiFetch(`/api/teams/${data.id}/settings`, {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
              ...authHeader(),
            },
            body: JSON.stringify(changed),
          });
        } catch {
          showToast(
            "설정은 저장하지 못했어요 — 설정 페이지에서 다시 조정해 주세요",
            "error",
          );
        }
      }

      setInviteCode(data.invite_code);
      setTeamId(data.id);
      console.log(data);
      
      setStep(1);
    } catch (err) {
      showToast((err as Error).message || "팀 생성 실패");
    } finally {
      setIsCreating(false);
    }
  }

  const chips = ["캡스톤 설계", "전공 팀플", "교양", "스터디"];

  return (
    <div
      className="screen active scroll"
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        overflowY: "auto",
        padding: "38px 24px",
        height: "100vh",
        position: "relative",
      }}
    >
      {/* step > 0이면 이전 스텝으로, step === 0이면 /home으로 */}
      <button
        className="ob-back"
        onClick={() => (step > 0 ? setStep((s) => s - 1) : navigate("/home"))}
      >
        <i className="ti ti-arrow-left" />
      </button>
      {/* 스텝 인디케이터 */}
      <div className="ob-steps">
        {["그룹 생성", "팀원 초대", "시작"].map((label, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center" }}>
            <div
              className={`ob-step ${step === i ? "active" : ""} ${step > i ? "done" : ""}`}
            >
              <div className="ob-sc">
                {step > i ? <i className="ti ti-check" /> : i + 1}
              </div>
              <span className="ob-sl">{label}</span>
            </div>
            {i < 2 && <div className={`ob-line ${step > i ? "done" : ""}`} />}
          </div>
        ))}
      </div>

      <div className="ob-card">
        {/* STEP 1 */}
        {step === 0 && (
          <div className="ob-pane active">
            <div className="ob-top">
              <div className="ob-ic">
                <i className="ti ti-users-group" />
              </div>
              <div className="ob-title">우리 팀 그룹을 만들어볼게요</div>
              <div className="ob-sub">
                그룹 정보를 입력하고 다음 단계에서 팀원을 초대하세요.
              </div>
            </div>
            <div className="ob-form">
              <div className="field">
                <label className="field-label">그룹 이름</label>
                <input
                  className="input"
                  placeholder="예) 캡스톤 팀플 B"
                  maxLength={100}
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                />
                <div className="field-hint">한글·영문·숫자 포함 최대 30자</div>
              </div>
              <div className="field">
                <label className="field-label">
                  과목 유형 <span className="opt">(선택)</span>
                </label>
                <div className="chip-row">
                  {chips.map((chip) => (
                    <div
                      key={chip}
                      className={`chip ${selectedChip === chip ? "on" : ""}`}
                      onClick={() => setSelectedChip(chip)}
                    >
                      {chip}
                    </div>
                  ))}
                </div>
              </div>
              <div className="field-row">
                <div className="field">
                  <label className="field-label">
                    마감일 <span className="opt">(선택)</span>
                  </label>
                  <input className="input" type="date" />
                </div>
                <div className="field">
                  <label className="field-label">최대 인원</label>
                  <select className="input">
                    <option>2명</option>
                    <option>3명</option>
                    <option defaultValue="4명">4명</option>
                    <option>5명</option>
                    <option>6명 이상</option>
                  </select>
                </div>
              </div>

              {/* 팀 설정 — 기본 접힘. 바꾼 값만 생성 직후 저장된다 (나중에 설정 페이지에서 변경 가능). */}
              <div className="ob-settings">
                <button
                  type="button"
                  className="ob-settings-toggle"
                  onClick={() => setShowSettings((v) => !v)}
                  aria-expanded={showSettings}
                >
                  <i
                    className={`ti ti-chevron-${showSettings ? "down" : "right"}`}
                  />
                  팀 설정 <span className="opt">(선택)</span>
                </button>
                {showSettings && (
                  <div className="ob-settings-body">
                    <div className="field">
                      <label className="field-label">기여도 공개 범위</label>
                      <select
                        className="input"
                        value={settings.contribution_visibility}
                        onChange={(e) =>
                          setSettings((s) => ({
                            ...s,
                            contribution_visibility: e.target
                              .value as OnboardingSettings["contribution_visibility"],
                          }))
                        }
                      >
                        <option value="team">전체 팀원 공개</option>
                        <option value="self">본인만 열람</option>
                        <option value="leader">팀장만 열람</option>
                      </select>
                    </div>
                    <div className="field">
                      <label className="field-label">무단결석 처리</label>
                      <select
                        className="input"
                        value={settings.absent_meeting_handling}
                        onChange={(e) =>
                          setSettings((s) => ({
                            ...s,
                            absent_meeting_handling: e.target
                              .value as OnboardingSettings["absent_meeting_handling"],
                          }))
                        }
                      >
                        <option value="exclude">
                          해당 회의 기여도 집계 제외
                        </option>
                        <option value="zero">기여도 0점 처리</option>
                        <option value="attendance_only">출석 점수만 차감</option>
                      </select>
                    </div>
                    <div className="field">
                      <label className="field-label">마감 패널티</label>
                      <select
                        className="input"
                        value={settings.deadline_penalty_curve}
                        onChange={(e) =>
                          setSettings((s) => ({
                            ...s,
                            deadline_penalty_curve: e.target
                              .value as OnboardingSettings["deadline_penalty_curve"],
                          }))
                        }
                      >
                        <option value="standard">표준</option>
                        <option value="lenient">완화</option>
                        <option value="strict">엄격</option>
                      </select>
                    </div>
                    <div className="field-row">
                      <div className="field">
                        <label className="field-label">최소 회의 시간 (분)</label>
                        <input
                          className="input"
                          type="number"
                          min={1}
                          max={240}
                          value={settings.min_meeting_minutes}
                          onChange={(e) =>
                            setSettings((s) => ({
                              ...s,
                              // 빈 입력은 기본값(5)으로 폴백 — 0은 서버 @Min(1) 위반
                              min_meeting_minutes:
                                e.target.value === ""
                                  ? DEFAULT_SETTINGS.min_meeting_minutes
                                  : Number(e.target.value),
                            }))
                          }
                        />
                      </div>
                      <div className="field">
                        <label className="field-label">팀장 보너스 배율</label>
                        <input
                          className="input"
                          type="number"
                          min={0}
                          max={1}
                          step={0.1}
                          value={settings.leader_bonus_multiplier}
                          onChange={(e) =>
                            setSettings((s) => ({
                              ...s,
                              // 빈 입력은 기본값(1.0)으로 폴백 — 명시적 0은 유효(보너스 없음)
                              leader_bonus_multiplier:
                                e.target.value === ""
                                  ? DEFAULT_SETTINGS.leader_bonus_multiplier
                                  : Number(e.target.value),
                            }))
                          }
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="ob-foot">
              <button
                className="btn btn-primary btn-full"
                onClick={createTeam}
                disabled={isCreating}
              >
                {isCreating ? (
                  "생성 중..."
                ) : (
                  <>
                    팀원 초대 <i className="ti ti-arrow-right" />
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* STEP 2 */}
        {step === 1 && (
          <div className="ob-pane active">
            <div className="ob-top">
              <div className="ob-ic">
                <i className="ti ti-user-plus" />
              </div>
              <div className="ob-title">팀원을 초대해요</div>
              <div className="ob-sub">아래 초대코드를 팀원에게 공유하세요.</div>
            </div>
            <div className="ob-form">
              <div className="code-strip">
                <div>
                  <div className="code-label">
                    <i className="ti ti-key" /> 우리 팀 초대코드
                  </div>
                  <div className="code-val">{inviteCode}</div>
                </div>
                <button
                  className="copy-btn"
                  onClick={copyCode}
                  style={
                    copied
                      ? { background: "rgba(255,255,255,0.35)" }
                      : undefined
                  }
                >
                  <i className={copied ? "ti ti-check" : "ti ti-copy"} />
                  {copied ? "복사됨" : "복사"}
                </button>
              </div>
              <div
                className="field-hint"
                style={{ marginTop: 12, lineHeight: 1.7 }}
              >
                이 코드를 팀원에게 공유하면 바로 합류할 수 있어요. 그룹에 들어온
                후에도 팀원을 초대할 수 있습니다.
              </div>
            </div>
            <div className="ob-foot">
              <button
                className="btn btn-primary btn-full"
                onClick={() => setStep(2)}
              >
                시작 <i className="ti ti-arrow-right" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3 */}
        {step === 2 && (
          <div className="ob-pane active">
            <div className="ob-confetti">
              <i className="ti ti-confetti" />
              <div>준비 완료! 팀플을 시작해볼게요</div>
            </div>
            <div className="ob-top" style={{ textAlign: "center" }}>
              <div className="ob-team-avs">
                <div className="av a1 av-lg">{teamName[0]}</div>
              </div>
              <div className="ob-title">{teamName} · 1명</div>
              <div className="ob-sub">
                그룹이 만들어졌어요. 회의를 시작하고 기여도를 기록해보세요.
              </div>
            </div>
            <div className="ob-form">
              <div className="ob-summary">
                <div className="ob-sg">
                  <div className="ob-sg-l">
                    <i className="ti ti-users" /> 팀원
                  </div>
                  <div className="ob-sg-v">1명</div>
                </div>
                <div className="ob-sg">
                  <div className="ob-sg-l">
                    <i className="ti ti-key" /> 초대코드
                  </div>
                  <div className="ob-sg-v">{inviteCode}</div>
                </div>
                <div className="ob-sg">
                  <div className="ob-sg-l">
                    <i className="ti ti-checklist" /> 태스크
                  </div>
                  <div className="ob-sg-v">0개</div>
                </div>
              </div>
              <div className="panel-label">지금 바로 시작할 수 있어요</div>
              {[
                {
                  cls: "green",
                  icon: "ti-video",
                  t: "첫 회의 만들기",
                  s: "아젠다 작성 · 발언 시간 측정 시작",
                },
                {
                  cls: "blue",
                  icon: "ti-checklist",
                  t: "태스크 등록",
                  s: "담당자 지정 · 마감일 설정",
                },
                {
                  cls: "amber",
                  icon: "ti-chart-bar",
                  t: "기여도 리포트",
                  s: "회의가 끝나면 자동 집계",
                },
              ].map(({ cls, icon, t, s }) => (
                <div key={t} className="ob-feat">
                  <div
                    className="ob-feat-ic"
                    style={{
                      background: `var(--${cls}-soft)`,
                      color: `var(--${cls})`,
                    }}
                  >
                    <i className={`ti ${icon}`} />
                  </div>
                  <div>
                    <div className="ob-feat-t">{t}</div>
                    <div className="ob-feat-s">{s}</div>
                  </div>
                </div>
              ))}
            </div>
            <div className="ob-foot">
              <button
                className="btn btn-primary btn-full"
                onClick={() => navigate(`/dashboard/${teamId}`)}
              >
                <i className="ti ti-rocket" /> 대시보드로 이동
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
