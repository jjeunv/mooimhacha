import "@/styles/login.css";
import { useNavigate } from "react-router-dom";

export default function LoginPage() {
  const navigate = useNavigate();

  return (
    <div className="screen active" style={{ display: "flex", height: "100vh" }}>
      {/* 왼쪽 패널 */}
      <div className="login-left">
        <div
          className="ll-blob"
          style={{ width: 300, height: 300, top: -110, right: -90 }}
        />
        <div
          className="ll-blob"
          style={{ width: 180, height: 180, bottom: 40, left: -70 }}
        />

        <div className="reveal" style={{ animationDelay: ".05s" }}>
          <div className="ll-logo">
            무임<em>하차</em>
          </div>
          <div className="ll-tag">팀플 기여도 관리 서비스</div>
        </div>

        <div className="ll-mid">
          <div
            className="ll-headline reveal"
            style={{ animationDelay: ".12s" }}
          >
            "내가 제일
            <br />
            열심히 했다"
            <br />
            <span>이제 증명하세요.</span>
          </div>
          <div className="ll-sub reveal" style={{ animationDelay: ".18s" }}>
            발언 시간, 태스크 완료율, 회의 참석률까지
            <br />
            데이터로 기여도를 투명하게 관리합니다.
          </div>
          <div className="ll-feat reveal" style={{ animationDelay: ".24s" }}>
            <div className="ll-feat-ic">
              <i className="ti ti-chart-bar" />
            </div>
            <div>
              <div className="ll-feat-t">실시간 기여도 현황</div>
              <div className="ll-feat-s">발언 · 태스크 · 참석 종합 집계</div>
            </div>
          </div>
          <div className="ll-feat reveal" style={{ animationDelay: ".3s" }}>
            <div className="ll-feat-ic">
              <i className="ti ti-file-export" />
            </div>
            <div>
              <div className="ll-feat-t">교수 제출용 리포트</div>
              <div className="ll-feat-s">PDF 1클릭 출력</div>
            </div>
          </div>
          <div className="ll-feat reveal" style={{ animationDelay: ".36s" }}>
            <div className="ll-feat-ic">
              <i className="ti ti-alert-triangle" />
            </div>
            <div>
              <div className="ll-feat-t">무임승차 자동 감지</div>
              <div className="ll-feat-s">기여도 10% 미만 시 경보 발송</div>
            </div>
          </div>
        </div>

        <div className="ll-foot reveal" style={{ animationDelay: ".42s" }}>
          팀원 초대 후 바로 사용 · 별도 설치 없음
        </div>
      </div>

      {/* 오른쪽 패널 */}
      <div className="login-right">
        <div className="lr-logo reveal" style={{ animationDelay: ".1s" }}>
          무임<em>하차</em>
        </div>
        <div className="lr-greet reveal" style={{ animationDelay: ".16s" }}>
          카카오 계정으로 간편하게 시작하세요.
        </div>
        <button
          className="kakao-btn reveal"
          style={{ animationDelay: ".22s" }}
          onClick={() => navigate("/home")}
        >
          <svg width="19" height="19" viewBox="0 0 24 24" fill="#191919">
            <path d="M12 3C6.477 3 2 6.477 2 10.5c0 2.578 1.523 4.84 3.836 6.258-.168.594-.607 2.152-.695 2.484-.109.406.148.4.313.293.129-.086 2.047-1.395 2.875-1.957.527.074 1.07.113 1.621.113C16.523 17.691 22 14.214 22 10.5S17.523 3 12 3z" />
          </svg>
          카카오로 시작하기
        </button>
        <div className="lr-terms reveal" style={{ animationDelay: ".28s" }}>
          로그인 시 <u>이용약관</u> 및 <u>개인정보처리방침</u>에 동의합니다.
        </div>
        <div className="lr-alt reveal" style={{ animationDelay: ".34s" }}>
          처음이신가요?{" "}
          <b onClick={() => navigate("/home")} style={{ cursor: "pointer" }}>
            둘러보기
          </b>
        </div>
      </div>
    </div>
  );
}
