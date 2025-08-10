"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { CheckCircleIcon } from "@heroicons/react/24/outline";
import { useAuth } from "@/contexts/AuthContext";

import styles from "@/style/Login.module.scss";

interface AgreeClientProps {
  privacyContent?: string;
  signupTermsContent?: string;
}

export default function AgreeClient({
  privacyContent,
  signupTermsContent,
}: AgreeClientProps) {
  const { setAgreeCheck } = useAuth();

  const [agree01, setAgree01] = useState(false);
  const [agree02, setAgree02] = useState(false);

  const setAgreeAll: (value: boolean) => void = (value: boolean) => {
    setAgree01(value);
    setAgree02(value);
  };

  // 전체 동의 체크
  const allChecked = agree01 && agree02;
  useEffect(() => {
    if (allChecked) {
      setAgreeCheck(true);
    }
  }, [allChecked, setAgreeCheck]);

  return (
    <div className={styles.page}>
      <div className={styles.membership_wrap}>
        <div className={styles.membership}>
          <h4 className={styles.membership_tit}>
            <CheckCircleIcon className="icon" />
            회원가입약관
          </h4>
          <div className={styles.membership_box}>
            <div className={styles.membership_contents}>
              <div
                dangerouslySetInnerHTML={{
                  __html: signupTermsContent || "회원가입약관을 불러오는 중...",
                }}
              />
            </div>
          </div>

          {/* 체크박스 */}
          <div className="checkbox">
            <input
              type="checkbox"
              id="member_agree_01"
              name="member_agree_01"
              className="hidden_checkbox"
              checked={agree01}
              onChange={() => setAgree01((prev) => !prev)}
            />
            <label htmlFor="member_agree_01" className="custom_checkbox">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                width="24"
                height="24"
                className="svg_checkbox"
              >
                <rect
                  className="svg_box"
                  x="2"
                  y="2"
                  width="20"
                  height="20"
                  rx="4"
                  fill="none"
                  stroke="#ccc"
                  strokeWidth="1"
                />
                <path
                  className="svg_checkmark"
                  d="M6 12l4 4 8-8"
                  fill="none"
                  stroke="#007bff"
                  strokeWidth="2"
                />
              </svg>
              <span>회원가입약관의 내용에 동의합니다.</span>
            </label>
          </div>

          <h4 className={styles.membership_tit}>
            <CheckCircleIcon className="icon" />
            개인정보처리방침
          </h4>
          <div className={styles.membership_box}>
            <div className={styles.membership_contents}>
              <div
                dangerouslySetInnerHTML={{
                  __html: privacyContent || "개인정보처리방침을 불러오는 중...",
                }}
              />
            </div>
          </div>

          {/* 체크박스 */}
          <div className="checkbox">
            <input
              type="checkbox"
              id="member_agree_02"
              name="member_agree_02"
              className="hidden_checkbox"
              checked={agree02}
              onChange={() => setAgree02((prev) => !prev)}
            />
            <label htmlFor="member_agree_02" className="custom_checkbox">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                width="24"
                height="24"
                className="svg_checkbox"
              >
                <rect
                  className="svg_box"
                  x="2"
                  y="2"
                  width="20"
                  height="20"
                  rx="4"
                  fill="none"
                  stroke="#ccc"
                  strokeWidth="1"
                />
                <path
                  className="svg_checkmark"
                  d="M6 12l4 4 8-8"
                  fill="none"
                  stroke="#007bff"
                  strokeWidth="2"
                />
              </svg>
              <span>개인정보처리방침안내의 내용에 동의합니다.</span>
            </label>
          </div>

          {/* 전체 동의 */}
          <div className="checkbox checkbox_all">
            <input
              type="checkbox"
              id="member_agree_all"
              name="member_agree_all"
              className="hidden_checkbox"
              checked={allChecked}
              onChange={() => setAgreeAll(!allChecked)}
            />
            <label htmlFor="member_agree_all" className="custom_checkbox">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                width="24"
                height="24"
                className="svg_checkbox"
              >
                <rect
                  className="svg_box"
                  x="2"
                  y="2"
                  width="20"
                  height="20"
                  rx="4"
                  fill="none"
                  stroke="#ccc"
                  strokeWidth="1"
                />
                <path
                  className="svg_checkmark"
                  d="M6 12l4 4 8-8"
                  fill="none"
                  stroke="#007bff"
                  strokeWidth="2"
                />
              </svg>
              <b>모두 동의합니다.</b>
            </label>
          </div>

          <div className="btn_wrap">
            <Link
              href="/user"
              className={`btn btn_width ${!allChecked ? styles.disabled : ""}`}
              tabIndex={allChecked ? 0 : -1}
              aria-disabled={!allChecked}
              onClick={(e) => {
                if (!allChecked) {
                  e.preventDefault();
                }
              }}
            >
              회원가입
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
