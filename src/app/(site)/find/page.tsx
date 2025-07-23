"use client";

import axios from "axios";

import { useState, useRef, FormEvent } from "react";
import { useRouter } from "next/navigation";

import "@/style/style.common.scss";
import styles from "@/style/Login.module.scss";

import { handleBlur, handleFocus } from "@/func/inputActive";

export default function Info() {
  const router = useRouter();

  const [userEmail, setUserEmail] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  const boxEmailRef = useRef<HTMLDivElement | null>(null);
  const inputEmailRef = useRef<HTMLInputElement | null>(null);
  const labelEmailRef = useRef<HTMLLabelElement>(null);

  const findInfo = async (e: FormEvent) => {
    e.preventDefault();
    setError(null); // 초기화

    if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(userEmail)) {
      setError("이메일 형식이 올바르지 않습니다.");
      inputEmailRef.current?.focus();
      return;
    }

    try {
      const response = await axios.post("/api/find", { userEmail });

      alert(response.data.message);
      router.push("/login");
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("알 수 없는 오류가 발생했습니다.");
      }
    }
  };

  return (
    <div className={`${styles.container} ${styles.login_page}`}>
      <div className={styles.page}>
        <div className={styles.inside}>
          <div className={styles.box_inner}>
            <form onSubmit={findInfo} className={styles.form}>
              <div className={styles.header_login}>
                <h2 className={styles.header_text}>ID/PW 찾기</h2>
                <p className={styles.header_subtext}>
                  회원가입 시 입력한 이메일로 새로운 비밀번호를 <br /> 보내 드립니다.
                </p>
              </div>

              {/* email */}
              <div className={styles.input_group}>
                <div className={styles.input_box} ref={boxEmailRef}>
                  <div className={styles.input_bg}></div>
                  <label className={styles.label_common} htmlFor='user_email' ref={labelEmailRef}>
                    이메일
                  </label>
                  <input
                    className={styles.input_common}
                    ref={inputEmailRef}
                    onFocus={() => handleFocus(labelEmailRef, boxEmailRef)}
                    onBlur={() => {
                      if (inputEmailRef.current && inputEmailRef.current.value === "") {
                        handleBlur(labelEmailRef, boxEmailRef);
                      }
                    }}
                    type='text'
                    id='user_email'
                    name='user_email'
                    value={userEmail}
                    onChange={(e) => setUserEmail(e.target.value)}
                  />
                </div>
              </div>

              {error && <span className='notice'>{error}</span>}

              {/* 버튼 */}
              <div className='btn_wrap'>
                <button type='submit' className={`btn`}>
                  확인
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
