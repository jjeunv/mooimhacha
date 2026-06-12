import { useEffect, useState } from "react";
import Modal from "@/components/Modal";
import ConfirmModal from "@/components/ConfirmModal";
import { apiDelete, apiGet, apiPatch } from "@/lib/api";
import { clearSession } from "@/lib/auth";
import { useTeamStore } from "@/stores/teamStore";
import { useToast } from "@/hooks/useToast";
import type { CurrentUser } from "@/lib/types";

interface ProfileEditModalProps {
  onClose: () => void;
  /** 저장 성공 후 호출 — 호출부에서 표시 중인 이름 등을 갱신할 때 사용 */
  onSaved?: () => void;
}

// 프로필(대학교·학과) 수정 + 회원 탈퇴.
export default function ProfileEditModal({
  onClose,
  onSaved,
}: ProfileEditModalProps) {
  const { showToast } = useToast();
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [university, setUniversity] = useState("");
  const [department, setDepartment] = useState("");
  const [saving, setSaving] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    let alive = true;
    apiGet<CurrentUser>("/auth/me")
      .then((u) => {
        if (!alive) return;
        setUser(u);
        setUniversity(u.university ?? "");
        setDepartment(u.department ?? "");
      })
      .catch(() => alive && setUser(null));
    return () => {
      alive = false;
    };
  }, []);

  const save = async () => {
    if (saving) return;
    setSaving(true);
    try {
      await apiPatch("/auth/profile", {
        university: university.trim(),
        department: department.trim(),
      });
      showToast("프로필이 저장되었습니다");
      onSaved?.();
      onClose();
    } catch (e) {
      showToast((e as Error).message, "error");
    } finally {
      setSaving(false);
    }
  };

  const deleteAccount = async () => {
    if (deleting) return;
    setDeleting(true);
    try {
      await apiDelete("/auth/me");
      // 세션·선택 팀 정리 후 전체 리로드로 모든 메모리 상태 초기화
      clearSession();
      useTeamStore.getState().clearTeamId();
      window.location.replace("/");
    } catch (e) {
      // 팀장 위임 필요 등 서버 안내 메시지를 그대로 표시
      showToast((e as Error).message, "error");
      setDeleting(false);
      setConfirmingDelete(false);
    }
  };

  return (
    <>
      <Modal
        title="프로필 편집"
        onClose={onClose}
        actions={
          <>
            <button className="btn" onClick={onClose} disabled={saving}>
              취소
            </button>
            <button
              className="btn btn-primary"
              onClick={save}
              disabled={saving || !user}
            >
              {saving ? "저장 중…" : "저장"}
            </button>
          </>
        }
      >
        <div className="field">
          <div className="field-label">이름</div>
          <input
            className="input"
            value={user?.name ?? ""}
            disabled
            title="이름은 카카오 계정 정보를 따릅니다"
          />
        </div>
        <div className="field">
          <div className="field-label">
            대학교 <span className="opt">선택</span>
          </div>
          <input
            className="input"
            value={university}
            onChange={(e) => setUniversity(e.target.value)}
            placeholder="예) 인하대학교"
            maxLength={100}
          />
        </div>
        <div className="field">
          <div className="field-label">
            학과 <span className="opt">선택</span>
          </div>
          <input
            className="input"
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
            placeholder="예) 컴퓨터공학과"
            maxLength={100}
          />
        </div>
        <div
          style={{
            marginTop: 16,
            paddingTop: 12,
            borderTop: "1px solid var(--border)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 8,
          }}
        >
          <span className="field-hint" style={{ margin: 0 }}>
            탈퇴 시 개인정보는 즉시 익명화됩니다.
          </span>
          <button
            className="btn btn-sm btn-danger"
            onClick={() => setConfirmingDelete(true)}
          >
            회원 탈퇴
          </button>
        </div>
      </Modal>
      {confirmingDelete && (
        <ConfirmModal
          title="회원 탈퇴"
          message={
            <>
              탈퇴하면 이름·이메일 등 개인정보가 <b>즉시 익명화</b>되며 복구할
              수 없습니다.
              <br />
              팀 활동 기록(회의록·기여도)은 익명으로 보존됩니다.
              <br />
              <br />
              팀장으로 있는 팀이 있다면 먼저 팀장을 위임해야 합니다.
            </>
          }
          confirmLabel="탈퇴하기"
          danger
          busy={deleting}
          onConfirm={() => void deleteAccount()}
          onClose={() => setConfirmingDelete(false)}
        />
      )}
    </>
  );
}
