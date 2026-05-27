import { useEffect } from "react";
import { useToast } from "@/hooks/useToast";
import Card from "@/components/Card";

const MEMBERS = [
  {
    av: "a1",
    name: "김민준",
    tag: "나",
    role: "팀장 · 기획/디자인",
    score: 38,
    scoreCls: "hi",
    stats: [
      { l: "발언 비중", v: "38%", vc: "var(--green)" },
      { l: "태스크", v: "3/3" },
      { l: "참석", v: "3회" },
      { l: "액션 완료", v: "100%" },
    ],
    bar: 38,
    barColor: "var(--green)",
  },
  {
    av: "a2",
    name: "이서연",
    tag: "",
    role: "조사/분석",
    score: 31,
    scoreCls: "hi",
    stats: [
      { l: "발언 비중", v: "31%", vc: "var(--blue)" },
      { l: "태스크", v: "2/3" },
      { l: "참석", v: "3회" },
      { l: "액션 완료", v: "75%" },
    ],
    bar: 31,
    barColor: "var(--blue)",
  },
  {
    av: "a4",
    name: "최유나",
    tag: "",
    role: "발표/문서",
    score: 23,
    scoreCls: "md",
    stats: [
      { l: "발언 비중", v: "23%", vc: "var(--pink)" },
      { l: "태스크", v: "2/3" },
      { l: "참석", v: "2회" },
      { l: "액션 완료", v: "60%" },
    ],
    bar: 23,
    barColor: "var(--pink)",
  },
  {
    av: "a3",
    name: "박지호",
    tag: "",
    role: "디자인",
    score: 8,
    scoreCls: "lo",
    stats: [
      { l: "발언 비중", v: "8%", vc: "var(--coral)" },
      { l: "태스크", v: "0/2", vc: "var(--coral)" },
      { l: "참석", v: "3회" },
      { l: "액션 완료", v: "0%", vc: "var(--coral)" },
    ],
    bar: 8,
    barColor: "var(--coral)",
  },
];

const SESSIONS = [
  {
    num: 1,
    title: "킥오프 회의",
    sub: "5/1 · 38분",
    body: "팀 구성 및 역할 분담 확정. 전원 참석, 발언 비중 균등.",
    meta: "결정 2개 · 액션 4개 완료",
  },
  {
    num: 2,
    title: "중간 점검 회의",
    sub: "5/5 · 52분",
    body: "시장 조사 결과 공유. 박지호 미준비로 지연 발생.",
    meta: "결정 3개 · 미결 2개",
  },
  {
    num: 3,
    title: "발표 준비 회의",
    sub: "오늘 · 진행 중",
    body: "슬라이드 구성 검토 및 발표 역할 확정 중.",
    meta: "결정 2개 · 진행 중",
  },
];

function drawRadar(svgEl: SVGSVGElement) {
  const cx = 120,
    cy = 120,
    R = 88,
    axes = 4;
  const labels = ["발언", "태스크", "참석", "액션완료"];
  const me = [38, 100, 100, 100],
    avg = [25, 58, 92, 59];
  const css = getComputedStyle(document.documentElement);
  const ang = (i: number) => (Math.PI * 2 * i) / axes - Math.PI / 2;
  const pt = (i: number, v: number): [number, number] => [
    cx + (Math.cos(ang(i)) * R * v) / 100,
    cy + (Math.sin(ang(i)) * R * v) / 100,
  ];
  let h = "";
  [25, 50, 75, 100].forEach((v) => {
    let p = "";
    for (let i = 0; i < axes; i++) {
      const [x, y] = pt(i, v);
      p += (i ? "L" : "M") + x.toFixed(1) + " " + y.toFixed(1);
    }
    h += `<path d="${p}Z" fill="none" stroke="${css.getPropertyValue("--border")}" stroke-width="1"/>`;
  });
  for (let i = 0; i < axes; i++) {
    const [x, y] = pt(i, 100);
    h += `<line x1="${cx}" y1="${cy}" x2="${x}" y2="${y}" stroke="${css.getPropertyValue("--border")}" stroke-width="1"/>`;
    const [lx, ly] = pt(i, 128);
    h += `<text x="${lx.toFixed(1)}" y="${(ly + 4).toFixed(1)}" text-anchor="middle" font-size="11" font-weight="700" fill="${css.getPropertyValue("--text-mut")}">${labels[i]}</text>`;
  }
  const poly = (data: number[], stroke: string, fill: string) => {
    let p = "";
    for (let i = 0; i < axes; i++) {
      const [x, y] = pt(i, data[i]);
      p += (i ? "L" : "M") + x.toFixed(1) + " " + y.toFixed(1);
    }
    return `<path d="${p}Z" fill="${fill}" stroke="${stroke}" stroke-width="2.4" stroke-linejoin="round"/>`;
  };
  h += poly(avg, css.getPropertyValue("--text-soft"), "rgba(150,160,150,.16)");
  h += poly(me, css.getPropertyValue("--green"), "rgba(29,158,117,.2)");
  for (let i = 0; i < axes; i++) {
    const [x, y] = pt(i, me[i]);
    h += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="3.4" fill="${css.getPropertyValue("--green")}"/>`;
  }
  svgEl.innerHTML = h;
}

export default function ReportPage() {
  const { showToast } = useToast();

  useEffect(() => {
    const el = document.getElementById("radar") as SVGSVGElement | null;
    if (el) drawRadar(el);
  }, []);

  return (
    <div className="report-wrap">
      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          marginBottom: 12,
        }}
      >
        <button
          className="btn btn-primary btn-sm"
          onClick={() => showToast("PDF 리포트를 저장했습니다")}
        >
          <i className="ti ti-file-export" /> PDF 저장 (제출용)
        </button>
      </div>

      {/* 배너 */}
      <div className="report-banner">
        <div>
          <div className="rb-title">팀플 기여도 최종 리포트</div>
          <div className="rb-sub">캡스톤 설계 팀 A · 2026년 5월</div>
          <div className="rb-meta">총 회의 3회 · 태스크 11개 · 5/1 ~ 5/14</div>
        </div>
        <div>
          <div className="rb-score-lbl">종합 달성률</div>
          <div className="rb-score">64%</div>
        </div>
      </div>

      {/* 팀원별 기여도 */}
      <Card
        icon="ti ti-chart-bar"
        title="팀원별 기여도"
        style={{ marginBottom: 14 }}
      >
        <div style={{ padding: "0 18px 14px" }}>
          {MEMBERS.map((m) => (
            <div key={m.name} className="mrc">
              <div className="mrc-head">
                <div className={`av ${m.av} av-lg`}>{m.name[0]}</div>
                <div>
                  <div className="mrc-name">
                    {m.name}{" "}
                    {m.tag && (
                      <span
                        style={{
                          fontSize: 10,
                          color: "var(--text-soft)",
                          fontWeight: 400,
                        }}
                      >
                        {m.tag}
                      </span>
                    )}
                  </div>
                  <div className="mrc-role">{m.role}</div>
                </div>
                <div className={`mrc-score ${m.scoreCls}`}>
                  {m.score}점{m.score < 10 ? " ⚠️" : ""}
                </div>
              </div>
              <div className="mrc-stats">
                {m.stats.map((s) => (
                  <div key={s.l} className="mrc-stat">
                    <div className="mrc-stat-l">{s.l}</div>
                    <div
                      className="mrc-stat-v"
                      style={s.vc ? { color: s.vc } : undefined}
                    >
                      {s.v}
                    </div>
                  </div>
                ))}
              </div>
              <div className="mrc-bar">
                <i style={{ width: `${m.bar}%`, background: m.barColor }} />
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* 레이더 차트 */}
      <Card
        icon="ti ti-chart-dots"
        title="기여도 레이더"
        extra={
          <span className="card-link" style={{ cursor: "default" }}>
            김민준 vs 팀 평균
          </span>
        }
        style={{ marginBottom: 14 }}
      >
        <div className="radar-wrap">
          <svg id="radar" width="240" height="240" viewBox="0 0 240 240" />
          <div className="radar-legend">
            <div className="rl-item">
              <span
                className="rl-swatch"
                style={{ background: "var(--green)" }}
              />{" "}
              김민준 (나)
            </div>
            <div className="rl-item">
              <span
                className="rl-swatch"
                style={{ background: "var(--text-soft)" }}
              />{" "}
              팀 평균
            </div>
            <div
              style={{
                fontSize: 11,
                color: "var(--text-soft)",
                lineHeight: 1.7,
                marginTop: 4,
              }}
            >
              발언 · 태스크 · 참석 · 액션완료
              <br />
              4개 축 기준 정규화 점수
            </div>
          </div>
        </div>
      </Card>

      {/* 회의별 요약 */}
      <Card icon="ti ti-calendar" title="회의별 요약">
        <div style={{ padding: "0 18px 14px" }}>
          {SESSIONS.map((s) => (
            <div key={s.num} className="ms-row">
              <div className="ms-num">{s.num}</div>
              <div>
                <div className="ms-title">
                  {s.title} <span>{s.sub}</span>
                </div>
                <div className="ms-body">{s.body}</div>
                <div className="ms-meta">{s.meta}</div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
