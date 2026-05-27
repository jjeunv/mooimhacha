import {
  Routes,
  Route,
  Navigate,
  useNavigate,
  useLocation,
} from "react-router-dom";
import OverviewPage from "./overview/OverviewPage";
import MeetingPage from "./meeting/MeetingPage";
import TasksPage from "./tasks/TasksPage";
import ReportPage from "./report/ReportPage";
import "@/styles/dashboard.css";

const NAV = [
  {
    key: "overview",
    path: "/dashboard/overview",
    icon: "ti-layout-dashboard",
    label: "대시보드",
  },
  {
    key: "meeting",
    path: "/dashboard/meeting",
    icon: "ti-video",
    label: "회의 관리",
    badge: "LIVE",
    badgeLive: true,
  },
  {
    key: "tasks",
    path: "/dashboard/tasks",
    icon: "ti-checklist",
    label: "태스크",
    badge: "7",
  },
  {
    key: "report",
    path: "/dashboard/report",
    icon: "ti-chart-bar",
    label: "기여도 리포트",
  },
];

const TITLE: Record<string, string> = {
  overview: "대시보드",
  meeting: "회의 관리",
  tasks: "태스크",
  report: "기여도 리포트",
};

export default function DashboardPage() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const current = pathname.split("/")[2] || "overview";

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      {/* 사이드바 */}
      <aside className="sidebar">
        <button className="sb-back" onClick={() => navigate("/home")}>
          <i className="ti ti-arrow-left" /> 내 그룹으로
        </button>

        <div className="sb-team">
          <div className="sb-team-badge">A</div>
          <div>
            <div className="sb-team-name">캡스톤 설계 팀 A</div>
            <div className="sb-team-sub">팀원 4명 · 진행 중</div>
          </div>
        </div>

        <div className="sb-sec">메뉴</div>
        {NAV.map((n) => (
          <div
            key={n.key}
            className={`nav-item ${current === n.key ? "active" : ""}`}
            onClick={() => navigate(n.path)}
          >
            <i className={`ti ${n.icon}`} />
            {n.label}
            {n.badge && (
              <span className={`nbadge ${n.badgeLive ? "live" : ""}`}>
                {n.badge}
              </span>
            )}
          </div>
        ))}

        <div className="sb-members">
          <div className="sb-sec">팀원</div>
          {[
            { av: "a1", name: "김민준", me: true },
            { av: "a2", name: "이서연" },
            { av: "a3", name: "박지호" },
            { av: "a4", name: "최유나" },
          ].map((m) => (
            <div key={m.name} className="sb-mrow">
              <div className={`av ${m.av} av-sm`}>{m.name[0]}</div>
              {m.name}
              {m.me && <span className="me-tag">나</span>}
            </div>
          ))}
        </div>

        <div className="sb-spacer" />
        <div className="sb-user">
          <div className="av a1 av-md">김</div>
          <div>
            <div className="sb-user-name">김민준</div>
            <div className="sb-user-role">팀장 · 소프트웨어학과</div>
          </div>
        </div>
      </aside>

      {/* 메인 영역 */}
      <div className="main-area">
        <div className="main-top">
          <div className="main-title">{TITLE[current] ?? "대시보드"}</div>
        </div>
        <div className="main-content scroll">
          <Routes>
            <Route index element={<Navigate to="overview" replace />} />
            <Route path="overview" element={<OverviewPage />} />
            <Route path="meeting" element={<MeetingPage />} />
            <Route path="tasks" element={<TasksPage />} />
            <Route path="report" element={<ReportPage />} />
          </Routes>
        </div>
      </div>
    </div>
  );
}
