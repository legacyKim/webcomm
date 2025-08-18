"use client";

import { useState, useEffect } from "react";
import styles from "./LockedAccounts.module.scss";

interface LockedAccount {
  id: number;
  username: string;
  user_nickname: string | null;
  email: string;
  account_locked_until: string | null;
  failed_login_attempts: number;
  last_failed_login: string | null;
  lock_count: number;
  permanent_lock: boolean;
  createdAt: string;
}

export default function LockedAccounts() {
  const [accounts, setAccounts] = useState<LockedAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  useEffect(() => {
    fetchLockedAccounts();
  }, []);

  const fetchLockedAccounts = async () => {
    try {
      const response = await fetch("/api/admin/account-lock", {
        credentials: "include",
      });
      const data = await response.json();

      if (data.success) {
        setAccounts(data.accounts);
      }
    } catch (error) {
      console.error("잠긴 계정 조회 실패:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (userId: number, action: string) => {
    if (!confirm(`정말로 이 작업을 수행하시겠습니까?`)) {
      return;
    }

    setActionLoading(userId);

    try {
      const response = await fetch("/api/admin/account-lock", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ userId, action }),
      });

      const data = await response.json();

      if (data.success) {
        alert("작업이 완료되었습니다.");
        fetchLockedAccounts(); // 목록 새로고침
      } else {
        alert(data.message || "작업 실패");
      }
    } catch (error) {
      console.error("작업 실패:", error);
      alert("서버 오류가 발생했습니다.");
    } finally {
      setActionLoading(null);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleString("ko-KR");
  };

  const getAccountStatus = (account: LockedAccount) => {
    if (account.permanent_lock) {
      return { text: "영구 잠금", className: styles.permanent };
    }

    if (account.account_locked_until) {
      const unlockTime = new Date(account.account_locked_until);
      if (unlockTime > new Date()) {
        return { text: "임시 잠금", className: styles.temporary };
      }
    }

    if (account.failed_login_attempts >= 5) {
      return { text: "실패 위험", className: styles.warning };
    }

    return { text: "정상", className: styles.normal };
  };

  if (loading) {
    return <div className={styles.loading}>로딩 중...</div>;
  }

  return (
    <div className={styles.container}>
      <h1>계정 잠금 관리</h1>

      <div className={styles.summary}>
        <p>총 {accounts.length}개의 계정이 관리 대상입니다.</p>
        <button onClick={fetchLockedAccounts} className={styles.refreshBtn}>
          새로고침
        </button>
      </div>

      {accounts.length === 0 ? (
        <div className={styles.empty}>잠긴 계정이 없습니다.</div>
      ) : (
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>사용자 ID</th>
                <th>닉네임</th>
                <th>이메일</th>
                <th>상태</th>
                <th>실패 횟수</th>
                <th>잠금 횟수</th>
                <th>잠금 해제 시간</th>
                <th>마지막 실패</th>
                <th>작업</th>
              </tr>
            </thead>
            <tbody>
              {accounts.map((account) => {
                const status = getAccountStatus(account);
                return (
                  <tr key={account.id}>
                    <td>{account.username}</td>
                    <td>{account.user_nickname || "-"}</td>
                    <td>{account.email}</td>
                    <td>
                      <span className={`${styles.status} ${status.className}`}>
                        {status.text}
                      </span>
                    </td>
                    <td>{account.failed_login_attempts}</td>
                    <td>{account.lock_count}</td>
                    <td>{formatDate(account.account_locked_until)}</td>
                    <td>{formatDate(account.last_failed_login)}</td>
                    <td>
                      <div className={styles.actions}>
                        <button
                          onClick={() => handleAction(account.id, "unlock")}
                          disabled={actionLoading === account.id}
                          className={styles.unlockBtn}
                        >
                          {actionLoading === account.id
                            ? "처리 중..."
                            : "잠금 해제"}
                        </button>
                        <button
                          onClick={() =>
                            handleAction(account.id, "reset_attempts")
                          }
                          disabled={actionLoading === account.id}
                          className={styles.resetBtn}
                        >
                          실패 초기화
                        </button>
                        <button
                          onClick={() =>
                            handleAction(account.id, "reset_lock_count")
                          }
                          disabled={actionLoading === account.id}
                          className={styles.resetAllBtn}
                        >
                          전체 초기화
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
