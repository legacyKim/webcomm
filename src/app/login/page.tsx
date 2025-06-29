"use client";

import axios from "axios";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import "@/style/style.common.scss";
import styles from "@/style/Login.module.scss";

import { handleBlur, handleFocus } from "@/func/inputActive";
import Cookies from "js-cookie";
import { useAuth } from "@/AuthContext";

export default function LoginPage() {
  const router = useRouter();
  const { loginStatus, setLoginStatus, setIsUsername, setIsUserId, setIsUserNick, setIsUserProfile, setIsUserEmail } =
    useAuth();

  const [userid, setUserid] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  // id cookie
  const [remember, setRemember] = useState(false);

  useEffect(() => {
    const savedUserid = Cookies.get("savedUserid");
    if (savedUserid) {
      setUserid(savedUserid);
      setRemember(true);
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (remember) {
      Cookies.set("savedUserid", userid, { expires: 7 });
    } else {
      Cookies.remove("savedUserid");
    }

    if (!userid || !password) {
      setError("아이디와 비밀번호를 입력해주세요.");
      return;
    }

    if (!userid || !password) {
      setError("아이디와 비밀번호를 입력해주세요.");
      return;
    }

    try {
      const response = await axios.post("/api/login", {
        userid,
        password,
      });

      if (response.data.success) {
        setIsUsername(response.data.username);
        setIsUserId(response.data.userId);
        setIsUserNick(response.data.userNick);
        setIsUserProfile(response.data.userProfile);
        setIsUserEmail(response.data.userEmail);
        setLoginStatus(response.data.success);
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        setError(error.response?.data?.message);
      }
    }
  };

  useEffect(() => {
    if (loginStatus) {
      router.push("/");
    }
  }, [loginStatus]);

  const boxIdRef = useRef<HTMLDivElement | null>(null);
  const boxPwRef = useRef<HTMLDivElement | null>(null);
  const inputIdRef = useRef<HTMLInputElement | null>(null);
  const inputPwRef = useRef<HTMLInputElement | null>(null);
  const labelIdRef = useRef<HTMLLabelElement>(null);
  const labelPwRef = useRef<HTMLLabelElement>(null);

  // 자동 추가 시 이벤트
  useEffect(() => {
    const inputId = inputIdRef.current;
    const inputPw = inputPwRef.current;

    const handleAutoFill = () => {
      if (inputId?.value) {
        labelIdRef.current?.classList.add("active_label");
        boxIdRef.current?.classList.add("active_box");
      } else {
        labelIdRef.current?.classList.remove("active_label");
        boxIdRef.current?.classList.remove("active_box");
      }

      if (inputPw?.value) {
        labelPwRef.current?.classList.add("active_label");
        boxPwRef.current?.classList.add("active_box");
      } else {
        labelPwRef.current?.classList.remove("active_label");
        boxPwRef.current?.classList.remove("active_box");
      }
    };

    inputId?.addEventListener("input", handleAutoFill);
    inputPw?.addEventListener("input", handleAutoFill);
    setTimeout(handleAutoFill, 100);

    return () => {
      inputId?.removeEventListener("input", handleAutoFill);
      inputPw?.removeEventListener("input", handleAutoFill);
    };
  }, []);

  //caps lock
  const [capsLockOn, setCapsLockOn] = useState(false);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const isCapsLock = e.getModifierState("CapsLock");
    setCapsLockOn(isCapsLock);
  };

  const handleKeyUp = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const isCapsLock = e.getModifierState("CapsLock");
    setCapsLockOn(isCapsLock);
  };

  useEffect(() => {
    if (capsLockOn) {
      setError("Caps Lock이 켜져 있습니다!");
    } else {
      setError(null);
    }
  }, [capsLockOn]);

  return (
    <div className={`${styles.login_page}`}>
      <div className={styles.inside}>
        {/* ad 영역 */}
        {/* <div className={`${styles.login_ad} ${styles.box_inner}`}>

            </div> */}

        {/* 로그인 폼 */}
        <div className={styles.box_inner}>
          <form onSubmit={handleLogin} className={styles.form}>
            <div className={styles.header_login}>
              <h2 className={styles.header_text}>LOGIN</h2>
            </div>
            <div className={styles.input_group}>
              <div className={styles.input_box} ref={boxIdRef}>
                <div className={styles.input_bg}></div>
                <label className={styles.label_common} htmlFor='userid' ref={labelIdRef}>
                  아이디
                </label>
                <input
                  className={styles.input_common}
                  ref={inputIdRef}
                  onFocus={() => handleFocus(labelIdRef, boxIdRef)}
                  onBlur={() => {
                    inputIdRef.current && inputIdRef.current.value === "" && handleBlur(labelIdRef, boxIdRef);
                  }}
                  type='text'
                  id='userid'
                  name='USERID'
                  value={userid}
                  onChange={(e) => setUserid(e.target.value)}
                />
              </div>
            </div>
            <div className={styles.input_group}>
              <div className={styles.input_box} ref={boxPwRef}>
                <div className={styles.input_bg}></div>
                <label className={styles.label_common} htmlFor='password' ref={labelPwRef}>
                  비밀번호
                </label>
                <input
                  className={styles.input_common}
                  ref={inputPwRef}
                  onFocus={() => handleFocus(labelPwRef, boxPwRef)}
                  onBlur={() => {
                    inputPwRef.current && inputPwRef.current.value === "" && handleBlur(labelPwRef, boxPwRef);
                    setCapsLockOn(false);
                  }}
                  onKeyDown={handleKeyDown}
                  onKeyUp={handleKeyUp}
                  type='password'
                  id='password'
                  name='password'
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            {/* checkbox */}
            <div className='checkbox'>
              <input type='checkbox' id='remember' name='remember' className='hidden_checkbox' />
              <label htmlFor='remember' className='custom_checkbox' onChange={() => setRemember(!remember)}>
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  viewBox='0 0 24 24'
                  width='24'
                  height='24'
                  className='svg_checkbox'>
                  <rect
                    className='svg_box'
                    x='2'
                    y='2'
                    width='20'
                    height='20'
                    rx='4'
                    fill='none'
                    stroke='#ccc'
                    strokeWidth='1'
                  />
                  <path className='svg_checkmark' d='M6 12l4 4 8-8' fill='none' stroke='#007bff' strokeWidth='2' />
                </svg>
                <span>아이디 저장</span>
              </label>
            </div>

            {error && <span className={styles.notice}>{error}</span>}

            {/* 버튼 */}
            <div className='btn_wrap'>
              <button type='submit' className='btn'>
                로그인
              </button>
            </div>

            {/* 아이디/비밀번호 찾기 및 회원가입 */}
            <div className={styles.find_info}>
              <Link href='/find'>아이디/비밀번호 찾기</Link>
              <Link href='/agree'>회원가입</Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
