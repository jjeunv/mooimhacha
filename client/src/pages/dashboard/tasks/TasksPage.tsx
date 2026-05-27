import { useState, useEffect } from "react";
import { useToast } from "@/hooks/useToast";
import Modal from "@/components/Modal";

type Status = "할 일" | "진행 중" | "완료";
interface Task {
  title: string;
  who: string;
  av: string;
  status: Status;
  danger?: boolean;
  warn?: boolean;
}

const INIT_TASKS: Task[] = [
  {
    title: "UI 와이어프레임 작성",
    who: "박지호",
    av: "a3",
    status: "할 일",
    danger: true,
  },
  {
    title: "발표 슬라이드 초안",
    who: "박지호",
    av: "a3",
    status: "할 일",
    danger: true,
  },
  { title: "기술 스택 문서화", who: "최유나", av: "a4", status: "할 일" },
  {
    title: "발표 스크립트 작성",
    who: "이서연",
    av: "a2",
    status: "할 일",
    warn: true,
  },
  { title: "경쟁사 분석 보고서", who: "이서연", av: "a2", status: "진행 중" },
  {
    title: "예상 Q&A 5개 정리",
    who: "최유나",
    av: "a4",
    status: "진행 중",
    warn: true,
  },
  { title: "최종 슬라이드 디자인", who: "김민준", av: "a1", status: "진행 중" },
  { title: "시장 조사 보고서", who: "김민준", av: "a1", status: "완료" },
  { title: "팀 역할 정의서", who: "김민준", av: "a1", status: "완료" },
  { title: "유사 서비스 벤치마킹", who: "이서연", av: "a2", status: "완료" },
  { title: "킥오프 아젠다 준비", who: "최유나", av: "a4", status: "완료" },
];

const STATUS_COLS: Status[] = ["할 일", "진행 중", "완료"];
const COL_COLOR = {
  "할 일": "var(--text-soft)",
  "진행 중": "var(--blue)",
  완료: "var(--green)",
};
const COL_BADGE = { "할 일": "", "진행 중": "b-blue", 완료: "b-green" };
const STATUS_CLS = { "할 일": "s-todo", "진행 중": "s-inprog", 완료: "s-done" };

export default function TasksPage() {
  const { showToast } = useToast();
  const [view, setView] = useState<"board" | "list">("board");
  const [tasks, setTasks] = useState(INIT_TASKS);
  const [modalOpen, setModalOpen] = useState(false);

  const done = tasks.filter((t) => t.status === "완료").length;
  const total = tasks.length;

  useEffect(() => {
    requestAnimationFrame(() => {
      document
        .querySelectorAll<HTMLElement>(".prog-fill[data-w]")
        .forEach((b) => {
          b.style.width = b.dataset.w + "%";
        });
    });
  }, []);

  function changeStatus(idx: number, status: Status) {
    setTasks((prev) => prev.map((t, i) => (i === idx ? { ...t, status } : t)));
  }

  function toggleList(idx: number) {
    setTasks((prev) =>
      prev.map((t, i) =>
        i === idx
          ? { ...t, status: t.status === "완료" ? "할 일" : "완료" }
          : t,
      ),
    );
  }

  return (
    <div>
      <div className="task-top">
        <div className="view-toggle">
          <button
            className={`vt ${view === "board" ? "active" : ""}`}
            onClick={() => setView("board")}
          >
            <i className="ti ti-layout-columns" /> 보드
          </button>
          <button
            className={`vt ${view === "list" ? "active" : ""}`}
            onClick={() => setView("list")}
          >
            <i className="ti ti-list" /> 목록
          </button>
        </div>
        <button
          className="btn btn-primary btn-sm"
          onClick={() => setModalOpen(true)}
        >
          <i className="ti ti-plus" /> 태스크 추가
        </button>
      </div>

      <div className="prog-strip">
        <span className="lbl">전체 진행률</span>
        <div className="prog-bg">
          <div
            className="prog-fill"
            data-w={Math.round((done / total) * 100)}
          />
        </div>
        <span className="num">
          {done} / {total} 완료
        </span>
      </div>

      {/* 보드 뷰 */}
      {view === "board" && (
        <div className="board">
          {STATUS_COLS.map((col) => {
            const colTasks = tasks
              .map((t, i) => ({ ...t, idx: i }))
              .filter((t) => t.status === col);
            return (
              <div key={col} className="board-col">
                <div className="col-head">
                  <span
                    className="col-dot"
                    style={{ background: COL_COLOR[col] }}
                  />
                  <span className="col-title">{col}</span>
                  <span
                    className="col-cnt"
                    style={
                      col !== "할 일"
                        ? {
                            background: `var(--${col === "진행 중" ? "blue" : "green"}-soft)`,
                            color: COL_COLOR[col],
                          }
                        : undefined
                    }
                  >
                    {colTasks.length}
                  </span>
                </div>
                {colTasks.map(
                  ({ idx, title, who, av, status, danger, warn }) => (
                    <div
                      key={idx}
                      className={`tcard ${danger ? "danger" : ""} ${warn ? "warn" : ""} ${status === "완료" ? "done-card" : ""}`}
                    >
                      <div
                        className={`tc-title ${status === "완료" ? "done" : ""}`}
                      >
                        {title}
                      </div>
                      <div className="tc-foot">
                        <span className="tc-who">
                          <span
                            className={`av ${av} av-sm`}
                            style={{ width: 20, height: 20, fontSize: 9 }}
                          >
                            {who[0]}
                          </span>
                          {who}
                        </span>
                        <select
                          className={`tc-status ${STATUS_CLS[status]}`}
                          value={status}
                          onChange={(e) =>
                            changeStatus(idx, e.target.value as Status)
                          }
                        >
                          <option>할 일</option>
                          <option>진행 중</option>
                          <option>완료</option>
                        </select>
                      </div>
                    </div>
                  ),
                )}
                <button className="add-col" onClick={() => setModalOpen(true)}>
                  <i className="ti ti-plus" /> 추가
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* 목록 뷰 */}
      {view === "list" && (
        <div>
          {tasks.map((t, i) => (
            <div
              key={i}
              className={`lrow ${t.danger ? "danger" : ""} ${t.warn ? "warn" : ""}`}
            >
              <div
                className={`t-check ${t.status === "완료" ? "done" : ""}`}
                onClick={() => toggleList(i)}
              >
                <i className="ti ti-check" />
              </div>
              <div
                className={`lrow-title ${t.status === "완료" ? "done" : ""}`}
              >
                {t.title}
              </div>
              <span className={`badge ${COL_BADGE[t.status] || "b-gray"}`}>
                {t.status}
              </span>
              <div className={`av ${t.av} av-sm`}>{t.who[0]}</div>
              <div
                className={`lrow-due ${t.danger ? "due-red" : t.warn ? "due-amber" : "due-soft"}`}
              >
                {t.status === "완료"
                  ? "완료"
                  : t.danger
                    ? "내일"
                    : t.warn
                      ? "5/11"
                      : "5/13"}
              </div>
            </div>
          ))}
        </div>
      )}

      {modalOpen && (
        <Modal
          title="태스크 추가"
          onClose={() => setModalOpen(false)}
          actions={
            <>
              <button className="btn" onClick={() => setModalOpen(false)}>
                취소
              </button>
              <button
                className="btn btn-primary"
                onClick={() => {
                  setModalOpen(false);
                  showToast("태스크가 추가되었습니다");
                }}
              >
                추가
              </button>
            </>
          }
        >
          <div className="modal-sub">
            담당자와 마감일을 지정하면 기여도에 자동 반영됩니다.
          </div>
          <div className="field">
            <label className="field-label">태스크 이름</label>
            <input className="input" placeholder="예) 발표 자료 수정" />
          </div>
          <div className="field-row">
            <div className="field">
              <label className="field-label">담당자</label>
              <select className="input">
                <option>김민준</option>
                <option>이서연</option>
                <option>박지호</option>
                <option>최유나</option>
                <option>전원</option>
              </select>
            </div>
            <div className="field">
              <label className="field-label">마감일</label>
              <input className="input" type="date" />
            </div>
          </div>
          <div className="field">
            <label className="field-label">상태</label>
            <select className="input">
              <option>할 일</option>
              <option>진행 중</option>
              <option>완료</option>
            </select>
          </div>
        </Modal>
      )}
    </div>
  );
}
