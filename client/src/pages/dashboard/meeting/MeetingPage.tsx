import { useState, useEffect, useRef } from "react";
import { useToast } from "@/hooks/useToast";
import Modal from "@/components/Modal";

const MEETINGS = [
  {
    name: "발표 준비 회의",
    status: "live",
    meta: "오늘 3:00 · 4명 · 아젠다 3",
  },
  { name: "최종 발표 리허설", status: "soon", meta: "5월 11일 2:00 · 4명" },
  { name: "중간 점검 회의", status: "done", meta: "5월 5일 · 52분" },
  { name: "킥오프 회의", status: "done", meta: "5월 1일 · 38분" },
];

const SPEAK = [
  { av: "a1", name: "김민준", pct: 38, grad: "var(--av1)", label: "9분 · 38%" },
  { av: "a2", name: "이서연", pct: 31, grad: "var(--av2)", label: "7분 · 31%" },
  { av: "a4", name: "최유나", pct: 23, grad: "var(--av4)", label: "6분 · 23%" },
  {
    av: "a3",
    name: "박지호",
    pct: 8,
    grad: "var(--coral)",
    label: "2분 · 8%",
    warn: true,
  },
];

type Tab = "agenda" | "speak" | "decision" | "summary";

export default function MeetingPage() {
  const { showToast } = useToast();
  const [tab, setTab] = useState<Tab>("agenda");
  const [elapsed, setElapsed] = useState(24 * 60 + 17);
  const [decisions, setDecisions] = useState([
    "슬라이드 총 12장, 민준이 최종 편집 담당",
    "발표 순서: 서연(서론) → 민준(본론) → 유나(결론)",
  ]);
  const [decInput, setDecInput] = useState("");
  const [modalOpen, setModalOpen] = useState<
    "meeting" | "decision" | "agenda" | null
  >(null);
  const barsAnimated = useRef(false);

  useEffect(() => {
    const id = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (tab === "speak" && !barsAnimated.current) {
      barsAnimated.current = true;
      requestAnimationFrame(() => {
        document
          .querySelectorAll<HTMLElement>(".speak-bar i[data-w]")
          .forEach((b) => {
            b.style.width = b.dataset.w + "%";
          });
      });
    }
  }, [tab]);

  const fmt = (s: number) =>
    String(Math.floor(s / 60)).padStart(2, "0") +
    ":" +
    String(s % 60).padStart(2, "0");

  function addDecision() {
    if (!decInput.trim()) {
      showToast("결정 내용을 입력해주세요");
      return;
    }
    setDecisions((d) => [...d, decInput.trim()]);
    setDecInput("");
    setModalOpen(null);
    showToast("결정 사항이 추가되었습니다");
  }

  const spillCls = {
    live: "spill-live",
    soon: "spill-soon",
    done: "spill-done",
  } as const;
  const spillLabel = { live: "진행", soon: "예정", done: "완료" } as const;
  const groups = [
    { label: "진행 중", items: MEETINGS.filter((m) => m.status === "live") },
    { label: "예정", items: MEETINGS.filter((m) => m.status === "soon") },
    { label: "완료", items: MEETINGS.filter((m) => m.status === "done") },
  ];

  return (
    <>
      <div className="meeting-layout">
        {/* 사이드바 */}
        <div className="msidebar">
          <div className="msb-head">
            <span>회의 목록</span>
            <button
              className="btn btn-primary btn-sm"
              onClick={() => setModalOpen("meeting")}
            >
              <i className="ti ti-plus" />
            </button>
          </div>
          <div className="msb-list scroll">
            {groups.map(
              ({ label, items }) =>
                items.length > 0 && (
                  <div key={label}>
                    <div className="msb-group">{label}</div>
                    {items.map((m) => (
                      <div
                        key={m.name}
                        className={`mcard ${m.status === "live" ? "sel" : ""}`}
                      >
                        <div className="mcard-top">
                          <div className="mcard-name">{m.name}</div>
                          <span
                            className={`spill ${spillCls[m.status as keyof typeof spillCls]}`}
                          >
                            {spillLabel[m.status as keyof typeof spillLabel]}
                          </span>
                        </div>
                        <div className="mcard-meta">{m.meta}</div>
                      </div>
                    ))}
                  </div>
                ),
            )}
          </div>
        </div>

        {/* 상세 */}
        <div className="mdetail">
          <div className="mdetail-head">
            <div className="mdh-top">
              <div className="mdh-title">발표 준비 회의</div>
              <button className="btn btn-danger btn-sm">
                <i className="ti ti-player-stop" /> 회의 종료
              </button>
            </div>
            <div className="mdh-meta">
              <span>
                <i className="ti ti-calendar" /> 오늘 오후 3:00
              </span>
              <span>
                <i className="ti ti-users" /> 4명 참석
              </span>
              <span style={{ color: "var(--coral)", fontWeight: 700 }}>
                <i className="ti ti-clock" /> {fmt(elapsed)}
              </span>
            </div>
            <div className="tabs">
              {(["agenda", "speak", "decision", "summary"] as Tab[]).map(
                (t) => (
                  <div
                    key={t}
                    className={`tab ${tab === t ? "active" : ""}`}
                    onClick={() => setTab(t)}
                  >
                    {
                      {
                        agenda: "아젠다",
                        speak: "발언 기록",
                        decision: "결정 사항",
                        summary: "회의 요약",
                      }[t]
                    }
                  </div>
                ),
              )}
            </div>
          </div>

          <div className="tab-body scroll">
            {/* 아젠다 */}
            {tab === "agenda" && (
              <div className="tab-panel active">
                <div className="panel-label">아젠다 진행</div>
                <div className="ag-item cur">
                  <div className="ag-num">
                    <i
                      className="ti ti-player-play-filled"
                      style={{ fontSize: 9 }}
                    />
                  </div>
                  <div className="ag-text">슬라이드 구성 검토</div>
                  <div className="ag-prog">
                    <i style={{ width: "72%" }} />
                  </div>
                  <div className="ag-time">10분</div>
                </div>
                {[
                  { num: "2", text: "발표 역할 분담 확정", time: "10분" },
                  { num: "3", text: "Q&A 예상 질문 준비", time: "15분" },
                ].map((a) => (
                  <div key={a.num} className="ag-item">
                    <div className="ag-num">{a.num}</div>
                    <div className="ag-text">{a.text}</div>
                    <div className="ag-prog">
                      <i style={{ width: "0%" }} />
                    </div>
                    <div className="ag-time">{a.time}</div>
                  </div>
                ))}
                <button
                  className="add-col"
                  style={{ marginTop: 4 }}
                  onClick={() => setModalOpen("agenda")}
                >
                  <i className="ti ti-plus" /> 아젠다 추가
                </button>
              </div>
            )}

            {/* 발언 기록 */}
            {tab === "speak" && (
              <div className="tab-panel active">
                <div
                  className="panel-label"
                  style={{ display: "flex", alignItems: "center", gap: 6 }}
                >
                  발언 분포{" "}
                  <span
                    className="live-dot"
                    style={{ background: "var(--green)" }}
                  />
                  <span
                    style={{
                      marginLeft: "auto",
                      textTransform: "none",
                      letterSpacing: 0,
                      color: "var(--text-soft)",
                      fontWeight: 500,
                    }}
                  >
                    총 24분 기준
                  </span>
                </div>
                {SPEAK.map((s) => (
                  <div key={s.name} className="speak-row">
                    <div className={`av ${s.av} av-sm`}>{s.name[0]}</div>
                    <span className="speak-name">{s.name}</span>
                    <span className="speak-bar">
                      <i data-w={s.pct} style={{ background: s.grad }} />
                    </span>
                    <span
                      className="speak-pct"
                      style={s.warn ? { color: "var(--coral)" } : undefined}
                    >
                      {s.label}
                    </span>
                  </div>
                ))}
                <div
                  className="summary-box"
                  style={{
                    marginTop: 14,
                    background: "var(--coral-soft)",
                    borderColor: "rgba(240,102,79,.4)",
                  }}
                >
                  <i
                    className="ti ti-alert-triangle"
                    style={{ color: "var(--coral)" }}
                  />
                  박지호님의 발언 비중이 10% 미만입니다. 의견을 물어봐 주세요.
                </div>
              </div>
            )}

            {/* 결정 사항 */}
            {tab === "decision" && (
              <div className="tab-panel active">
                <div
                  className="panel-label"
                  style={{ display: "flex", alignItems: "center" }}
                >
                  결정 사항
                  <button
                    className="btn btn-primary btn-sm"
                    style={{ marginLeft: "auto" }}
                    onClick={() => setModalOpen("decision")}
                  >
                    <i className="ti ti-plus" /> 추가
                  </button>
                </div>
                {decisions.map((d, i) => (
                  <div key={i} className="dec-item">
                    <div className="dec-ic">
                      <i className="ti ti-check" />
                    </div>
                    <div className="dec-text">{d}</div>
                  </div>
                ))}
              </div>
            )}

            {/* 회의 요약 */}
            {tab === "summary" && (
              <div className="tab-panel active">
                <div className="summary-box">
                  <i className="ti ti-sparkles" />
                  회의가 종료되면 AI가 자동으로 결정사항·액션아이템·회의록을
                  요약합니다.
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 새 회의 모달 */}
      {modalOpen === "meeting" && (
        <Modal
          title="새 회의 만들기"
          onClose={() => setModalOpen(null)}
          actions={
            <>
              <button className="btn" onClick={() => setModalOpen(null)}>
                취소
              </button>
              <button
                className="btn btn-primary"
                onClick={() => {
                  setModalOpen(null);
                  showToast("새 회의가 생성되었습니다");
                }}
              >
                회의 생성
              </button>
            </>
          }
        >
          <div className="modal-sub">
            아젠다를 미리 작성하면 회의 효율이 올라갑니다.
          </div>
          <div className="field">
            <label className="field-label">회의 이름</label>
            <input className="input" placeholder="예) 중간 점검 회의" />
          </div>
          <div className="field-row">
            <div className="field">
              <label className="field-label">날짜</label>
              <input className="input" type="date" />
            </div>
            <div className="field">
              <label className="field-label">시간</label>
              <input className="input" type="time" defaultValue="15:00" />
            </div>
          </div>
          <div className="field">
            <label className="field-label">
              아젠다 <span className="opt">(줄바꿈으로 구분)</span>
            </label>
            <textarea
              className="input"
              rows={3}
              placeholder={"1. 진행 상황 공유\n2. 역할 재조정"}
            />
          </div>
        </Modal>
      )}

      {/* 결정 사항 모달 */}
      {modalOpen === "decision" && (
        <Modal
          title="결정 사항 추가"
          onClose={() => setModalOpen(null)}
          actions={
            <>
              <button className="btn" onClick={() => setModalOpen(null)}>
                취소
              </button>
              <button className="btn btn-primary" onClick={addDecision}>
                추가
              </button>
            </>
          }
        >
          <div className="field">
            <label className="field-label">결정 내용</label>
            <textarea
              className="input"
              rows={3}
              placeholder="회의에서 결정된 내용을 입력하세요"
              value={decInput}
              onChange={(e) => setDecInput(e.target.value)}
            />
          </div>
        </Modal>
      )}

      {/* 아젠다 모달 */}
      {modalOpen === "agenda" && (
        <Modal
          title="아젠다 추가"
          onClose={() => setModalOpen(null)}
          actions={
            <>
              <button className="btn" onClick={() => setModalOpen(null)}>
                취소
              </button>
              <button
                className="btn btn-primary"
                onClick={() => {
                  setModalOpen(null);
                  showToast("아젠다가 추가되었습니다");
                }}
              >
                추가
              </button>
            </>
          }
        >
          <div className="field">
            <label className="field-label">아젠다 내용</label>
            <input className="input" placeholder="예) 최종 발표 순서 확정" />
          </div>
          <div className="field-row">
            <div className="field">
              <label className="field-label">소요 시간 (분)</label>
              <input
                className="input"
                type="number"
                defaultValue={10}
                min={1}
              />
            </div>
            <div className="field">
              <label className="field-label">담당</label>
              <select className="input">
                <option>김민준</option>
                <option>이서연</option>
                <option>박지호</option>
                <option>최유나</option>
              </select>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
}
