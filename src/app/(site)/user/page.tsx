"use client";

import styles from "@/style/Login.module.scss";

import axios from "axios";

import { useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";

import { handleBlur, handleFocus } from "@/func/inputActive";
import { useLoadRecaptcha } from "@/func/hook/useLoadRecaptcha";

declare global {
  interface Window {
    grecaptcha: {
      ready: (cb: () => void) => void;
      execute: (
        siteKey: string,
        options: { action: string }
      ) => Promise<string>;
    };
  }
}

const idRegex = /^[a-z0-9]{4,16}$/;
const nickRegex = /^[a-zA-Z0-9가-힣]{2,12}$/;

export default function User() {
  const { agreeCheck } = useAuth();
  useEffect(() => {
    if (!agreeCheck) {
      alert("회원가입을 위해서는 약관에 동의해야 합니다.");
      window.location.href = "/agree";
      return;
    }
  }, [agreeCheck]);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);

  const router = useRouter();
  const boxIdRef = useRef<HTMLDivElement | null>(null);
  const boxNickRef = useRef<HTMLDivElement | null>(null);
  const boxBioRef = useRef<HTMLDivElement | null>(null);
  const boxPwRef = useRef<HTMLDivElement | null>(null);
  const boxPwcRef = useRef<HTMLDivElement | null>(null);
  const boxEmailRef = useRef<HTMLDivElement | null>(null);
  const boxCertifyNumRef = useRef<HTMLDivElement | null>(null);

  const inputIdRef = useRef<HTMLInputElement | null>(null);
  const inputNickRef = useRef<HTMLInputElement | null>(null);
  const inputBioRef = useRef<HTMLTextAreaElement | null>(null);
  const inputProfileImgRef = useRef<HTMLInputElement | null>(null);
  const inputPwRef = useRef<HTMLInputElement | null>(null);
  const inputPwcRef = useRef<HTMLInputElement | null>(null);
  const inputEmailRef = useRef<HTMLInputElement | null>(null);
  const inputCertifyNumRef = useRef<HTMLInputElement | null>(null);

  const labelIdRef = useRef<HTMLLabelElement>(null);
  const labelNickRef = useRef<HTMLLabelElement>(null);
  const labelBioRef = useRef<HTMLLabelElement>(null);
  const labelProfileImgRef = useRef<HTMLLabelElement>(null);
  const labelPwRef = useRef<HTMLLabelElement>(null);
  const labelPwcRef = useRef<HTMLLabelElement>(null);
  const labelEmailRef = useRef<HTMLLabelElement>(null);
  const labelCertifyNumRef = useRef<HTMLLabelElement>(null);

  // 아이디 및 별명 중복 체크
  const [userid, setUserid] = useState<string>("");
  const [userNickname, setUserNickname] = useState<string>("");
  const [userBio, setUserBio] = useState<string>("");

  const [idDupliCheck, setIdDupliCheck] = useState<boolean>(false);

  const idCheck = async () => {
    if (userid === "") {
      alert("아이디를 입력해 주세요.");
      return;
    }

    if (userNickname === "") {
      alert("별명을 입력해 주세요.");
      return;
    }

    if (userid.toLowerCase().includes("admin")) {
      alert('"admin"이 포함된 아이디는 사용할 수 없습니다.');
      setUserid("");
      return;
    }

    if (!idRegex.test(userid)) {
      alert("아이디는 4~16자의 영문 소문자 및 숫자로만 입력할 수 있습니다.");
      setUserid("");
      return;
    }

    if (!nickRegex.test(userNickname)) {
      alert("별명은 4~12자 내로, 특수문자는 입력할 수 없습니다.");
      setUserNickname("");
      return;
    }

    try {
      const response = await axios.post("/api/user/duplicate", {
        userid,
        userNickname,
      });
      if (response.data.isUserDupli) {
        alert(response.data.message);
        setUserid("");
        inputIdRef.current?.focus();
        return;
      } else if (response.data.isNickDupli) {
        alert(response.data.message);
        setUserNickname("");
        inputNickRef.current?.focus();
        return;
      } else {
        alert(response.data.message);
        setIdDupliCheck(true);
        inputPwRef.current?.focus();
      }
    } catch (error) {
      console.error(error);
      console.log(error);
      alert("서버 오류가 발생했습니다.");
    }
  };

  // 인증 성공 후 아이디 또는 비밀번호를 변경할 시.
  useEffect(() => {
    setIdDupliCheck(false);
  }, [userid, userNickname]);

  // password
  const [userPassword, setUserPassowrd] = useState<string>("");
  const [userPasswordCheck, setUserPassowrdCheck] = useState<string>("");

  const [userPasswordNotice, setUserPasswordNotice] = useState<string>(
    "영문, 숫자, 특수문자 혼합 사용 / 최소 4자 이상 입력하세요."
  );

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
    const regex =
      /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[!@#$%^&*])[a-zA-Z\d!@#$%^&*]{4,}$/;

    if (capsLockOn) {
      setUserPasswordNotice("Caps Lock이 켜져 있습니다.");
      return;
    }

    if (userPassword !== "" && userPasswordCheck !== "") {
      if (userPassword !== userPasswordCheck) {
        setUserPasswordNotice("비밀번호가 일치하지 않습니다!");
      } else {
        setUserPasswordNotice("비밀번호가 일치합니다.");
      }
    } else if (!regex.test(userPassword)) {
      setUserPasswordNotice(
        "영문, 숫자, 특수문자 혼합 사용 / 최소 4자 이상 입력하세요."
      );
    }
  }, [userPassword, userPasswordCheck, capsLockOn]);

  // email
  const [userEmail, setUserEmail] = useState<string>("");
  const [certifyNum, setCertifyNum] = useState<string>("");
  const [certifyNumCheck, setCertifyNumCheck] = useState<string>("");
  const [certifyAgree, setCertifyAgree] = useState<boolean>(false);

  const emailCheck = async () => {
    const isLocalEnvironment = process.env.NODE_ENV === "development";

    if (!userEmail) {
      alert("이메일을 입력하세요.");
      inputEmailRef.current?.focus();
      return;
    }

    if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(userEmail)) {
      alert("이메일 형식이 올바르지 않습니다.");
      inputEmailRef.current?.focus();
      return;
    }

    // 로컬 환경에서는 자동으로 인증번호 설정
    if (isLocalEnvironment) {
      const localVerifyCode = "123456";
      setCertifyNumCheck(localVerifyCode);
      setCertifyNum(localVerifyCode);
      alert("로컬 환경: 자동으로 인증번호가 설정되었습니다. (123456)");
      return;
    }

    try {
      const response = await axios.post("/api/user/email", { userEmail });
      if (response.data.success) {
        setCertifyNumCheck(response.data.verifyCode);
        alert("인증번호가 이메일로 전송되었습니다.");
      } else {
        alert("이메일 전송 실패.");
      }
    } catch (error) {
      console.error(error);
      alert("서버 오류가 발생했습니다.");
    }
  };

  useEffect(() => {
    if (
      inputCertifyNumRef.current &&
      inputCertifyNumRef.current.value === certifyNumCheck &&
      certifyNumCheck !== ""
    ) {
      setCertifyAgree(true);
    } else {
      setCertifyAgree(false);
    }
  }, [certifyNum, certifyNumCheck]);

  // recaptcha
  const [recaptchaToken, setRecaptchaToken] = useState("");
  const [recaptchaLoaded, setRecaptchaLoaded] = useState(false);
  const loadRecaptcha = useLoadRecaptcha((token) => {
    setRecaptchaToken(token);
    setRecaptchaLoaded(true);
  });
  useEffect(() => {
    loadRecaptcha();
  }, []);

  // 프로필 이미지
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);

  // 마케팅 수신 동의
  const [marketingConsent, setMarketingConsent] = useState<boolean>(false);
  const [notificationConsent, setNotificationConsent] =
    useState<boolean>(false);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (!file) return;

    if (file.size > 1 * 1024 * 1024) {
      alert("최대 1MB 이하의 이미지만 업로드 가능합니다.");
      return;
    }

    setFileName(file.name);
    const reader = new FileReader();
    reader.onloadend = () => {
      setProfileImage(reader.result as string);
    };
    reader.readAsDataURL(file);
    setFile(file);
  };

  // 회원가입 요청
  const userPost = async (e: React.FormEvent) => {
    e.preventDefault();

    const passwordRegex =
      /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[!@#$%^&*])[a-zA-Z\d!@#$%^&*]{4,}$/;

    const isLocalEnvironment = process.env.NODE_ENV === "development";

    if (!idDupliCheck) {
      alert("아이디 및 별명 중복 체크를 해주세요.");
      inputIdRef.current?.focus();
      return;
    }

    if (!passwordRegex.test(userPassword)) {
      alert("영문, 숫자, 특수문자 혼합 사용 / 최소 4자 이상 입력하세요.");
      setUserPasswordNotice(
        "영문, 숫자, 특수문자 혼합 사용 / 최소 4자 이상 입력하세요."
      );
      inputPwRef.current?.focus();
      return;
    }

    // 로컬 환경이 아닐 때만 이메일 인증 체크
    if (!isLocalEnvironment && !certifyNumCheck) {
      alert("이메일을 인증해 주세요.");
      inputCertifyNumRef.current?.focus();
      return;
    }

    // reCAPTCHA 토큰 새로 생성 (로컬 환경에서는 건너뛰기)
    let currentRecaptchaToken = recaptchaToken;

    if (!isLocalEnvironment) {
      if (!currentRecaptchaToken) {
        try {
          const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;
          if (!siteKey) {
            console.error("reCAPTCHA Site Key가 설정되지 않았습니다.");
            alert("reCAPTCHA 설정 오류입니다. 관리자에게 문의하세요.");
            return;
          }

          if (window.grecaptcha) {
            currentRecaptchaToken = await new Promise<string>(
              (resolve, reject) => {
                window.grecaptcha.ready(() => {
                  window.grecaptcha
                    .execute(siteKey, { action: "signup" })
                    .then((token) => {
                      resolve(token);
                    })
                    .catch((error) => {
                      reject(error);
                    });
                });
              }
            );
          } else {
            throw new Error("reCAPTCHA 스크립트가 로드되지 않았습니다.");
          }
        } catch (error) {
          console.error("reCAPTCHA 토큰 생성 실패:", error);
          alert(
            "reCAPTCHA 검증에 실패했습니다. 페이지를 새로고침 후 다시 시도해주세요."
          );
          return;
        }
      }

      if (!currentRecaptchaToken) {
        console.error("reCAPTCHA 토큰이 없습니다:", {
          recaptchaToken,
          currentRecaptchaToken,
          recaptchaLoaded,
          hasGrecaptcha: !!window.grecaptcha,
          hasSiteKey: !!process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY,
        });
        alert("reCAPTCHA 검증이 필요합니다. 페이지를 새로고침해주세요.");
        return;
      }
    } else {
      currentRecaptchaToken = "local-development-bypass";
    }

    const formData = new FormData();

    formData.append("userid", userid);
    formData.append("userNickname", userNickname);
    formData.append("userBio", userBio);
    formData.append("userPassword", userPassword);
    formData.append("userEmail", userEmail);
    formData.append("recaptchaToken", currentRecaptchaToken);
    formData.append("marketingConsent", marketingConsent.toString());
    formData.append("notificationConsent", notificationConsent.toString());

    if (file) {
      formData.append("profileImage", file);
    }

    try {
      const response = await axios.post("/api/user", formData, {
        validateStatus: () => true, // 모든 status 를 err 처리하지 않기.
      });

      if (response.data.success) {
        alert(response.data.message);
        router.push("/login");
      } else {
        alert(response.data.message);
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className={`${styles.container} ${styles.login_page}`}>
      <div className={styles.page}>
        <div className={styles.inside}>
          <div className={styles.box_inner}>
            <form onSubmit={userPost} className={styles.form}>
              <div className={styles.header_login}>
                <h2 className={styles.header_text}>회원가입</h2>
                <p className={styles.header_subtext}>
                  새로운 계정을 생성합니다.
                </p>
              </div>

              {/* id */}
              <div className={styles.input_group}>
                <div className={styles.input_box} ref={boxIdRef}>
                  <div className={styles.input_bg}></div>
                  <label
                    className={styles.label_common}
                    htmlFor="userid"
                    ref={labelIdRef}
                  >
                    아이디
                  </label>
                  <input
                    className={styles.input_common}
                    ref={inputIdRef}
                    onFocus={() => handleFocus(labelIdRef, boxIdRef)}
                    onBlur={() => {
                      if (inputIdRef.current && inputIdRef.current.value === "")
                        handleBlur(labelIdRef, boxIdRef);
                    }}
                    type="text"
                    id="userid"
                    name="userid"
                    value={userid}
                    onChange={(e) => setUserid(e.target.value)}
                  />
                </div>
              </div>

              {/* 별명 */}
              <div className={styles.input_group}>
                <div className={styles.input_box} ref={boxNickRef}>
                  <div className={styles.input_bg}></div>
                  <label
                    className={styles.label_common}
                    htmlFor="userid"
                    ref={labelNickRef}
                  >
                    별명
                  </label>
                  <input
                    className={styles.input_common}
                    ref={inputNickRef}
                    onFocus={() => handleFocus(labelNickRef, boxNickRef)}
                    onBlur={() => {
                      if (
                        inputNickRef.current &&
                        inputNickRef.current.value === ""
                      )
                        handleBlur(labelNickRef, boxNickRef);
                    }}
                    type="text"
                    id="userNickname"
                    name="userNickname"
                    value={userNickname}
                    onChange={(e) => setUserNickname(e.target.value)}
                  />
                </div>
              </div>

              {/* 자기소개 */}
              <div className={styles.input_group}>
                <div
                  className={`${styles.input_box} ${styles.textarea_box}`}
                  ref={boxBioRef}
                >
                  <div className={styles.input_bg}></div>
                  <label
                    className={styles.label_common}
                    htmlFor="userBio"
                    ref={labelBioRef}
                  >
                    자기소개 (선택)
                  </label>
                  <textarea
                    className={`${styles.input_common} ${styles.textarea_bio}`}
                    ref={inputBioRef}
                    onFocus={() => handleFocus(labelBioRef, boxBioRef)}
                    onBlur={() => {
                      if (
                        inputBioRef.current &&
                        inputBioRef.current.value === ""
                      )
                        handleBlur(labelBioRef, boxBioRef);
                    }}
                    id="userBio"
                    name="userBio"
                    value={userBio}
                    onChange={(e) => setUserBio(e.target.value)}
                    rows={3}
                    maxLength={200}
                  />
                </div>
              </div>

              {!idDupliCheck && (
                <div className="btn_wrap">
                  <button
                    onClick={() => {
                      idCheck();
                    }}
                    type="button"
                    className={`btn 
                            ${idRegex.test(userid) && nickRegex.test(userNickname) ? "" : "btn_nonactive"}
                            `}
                  >
                    중복 확인
                  </button>
                </div>
              )}

              {/* 프로필 이미지 */}
              <div className={styles.input_group}>
                <div className={`${styles.input_box} ${styles.input_img}`}>
                  <label
                    className={`${styles.label_img}`}
                    htmlFor="profileImage"
                    ref={labelProfileImgRef}
                  >
                    {fileName ? (
                      <>
                        <span
                          className={`${styles.file_name_label} ${styles.after}`}
                        >
                          프로필 이미지
                        </span>
                        <p className={styles.file_name}>{fileName}</p>
                      </>
                    ) : (
                      <span className={styles.file_name_label}>
                        프로필 이미지 (선택)
                      </span>
                    )}
                  </label>

                  {/* 파일 선택 버튼 (커스텀 스타일링) */}
                  <input
                    className={styles.input_common}
                    ref={inputProfileImgRef}
                    type="file"
                    id="profileImage"
                    name="profileImage"
                    accept="image/*"
                    onChange={(e) => {
                      handleImageChange(e);
                    }}
                    style={{ display: "none" }}
                  />
                </div>
              </div>

              <span className={`${styles.notice}`}>
                용량이 <b className={`${styles.red}`}>1MB</b> 이하인 이미지만
                업로드가 가능합니다.
              </span>

              {/* 미리보기 이미지 */}
              {profileImage && (
                <div className={styles.img_preview}>
                  <img src={profileImage} alt="Profile Preview" />
                </div>
              )}

              {/* 비밀번호 */}
              <div className={styles.input_group}>
                <div className={styles.input_box} ref={boxPwRef}>
                  <div className={styles.input_bg}></div>
                  <label
                    className={styles.label_common}
                    htmlFor="user_password"
                    ref={labelPwRef}
                  >
                    비밀번호
                  </label>
                  <input
                    className={styles.input_common}
                    ref={inputPwRef}
                    onFocus={() => handleFocus(labelPwRef, boxPwRef)}
                    onBlur={() => {
                      if (inputPwRef.current && inputPwRef.current.value === "")
                        handleBlur(labelPwRef, boxPwRef);
                    }}
                    onKeyDown={handleKeyDown}
                    onKeyUp={handleKeyUp}
                    type="password"
                    id="user_password"
                    name="user_password"
                    value={userPassword}
                    onChange={(e) => setUserPassowrd(e.target.value)}
                  />
                </div>
              </div>

              <div className={styles.input_group}>
                <div className={styles.input_box} ref={boxPwcRef}>
                  <div className={styles.input_bg}></div>
                  <label
                    className={styles.label_common}
                    htmlFor="user_password_check"
                    ref={labelPwcRef}
                  >
                    비밀번호 확인
                  </label>
                  <input
                    className={styles.input_common}
                    ref={inputPwcRef}
                    onFocus={() => handleFocus(labelPwcRef, boxPwcRef)}
                    onBlur={() => {
                      if (
                        inputPwcRef.current &&
                        inputPwcRef.current.value === ""
                      )
                        handleBlur(labelPwcRef, boxPwcRef);
                    }}
                    onKeyDown={handleKeyDown}
                    onKeyUp={handleKeyUp}
                    type="password"
                    id="user_password_check"
                    name="user_password_check"
                    value={userPasswordCheck}
                    onChange={(e) => setUserPassowrdCheck(e.target.value)}
                  />
                </div>
              </div>

              <span
                className={`${styles.notice} ${
                  userPasswordNotice === "비밀번호가 일치하지 않습니다!"
                    ? styles.notice_false
                    : userPasswordNotice === "비밀번호가 일치합니다."
                      ? styles.notice_true
                      : ""
                }`}
              >
                {userPasswordNotice}
              </span>

              {/* email */}
              <div className={styles.input_group}>
                <div className={styles.input_box} ref={boxEmailRef}>
                  <div className={styles.input_bg}></div>
                  <label
                    className={styles.label_common}
                    htmlFor="user_email"
                    ref={labelEmailRef}
                  >
                    이메일
                  </label>
                  <input
                    className={styles.input_common}
                    ref={inputEmailRef}
                    onFocus={() => handleFocus(labelEmailRef, boxEmailRef)}
                    onBlur={() => {
                      if (
                        inputEmailRef.current &&
                        inputEmailRef.current.value === ""
                      )
                        handleBlur(labelEmailRef, boxEmailRef);
                    }}
                    type="text"
                    id="user_email"
                    name="user_email"
                    value={userEmail}
                    onChange={(e) => setUserEmail(e.target.value)}
                  />
                </div>
                <button
                  type="button"
                  onClick={() => {
                    emailCheck();
                  }}
                  className="btn_line_grey"
                >
                  인증번호
                  <br />
                  요청
                </button>
              </div>

              {/* certify num */}
              <div className={styles.input_group}>
                <div className={styles.input_box} ref={boxCertifyNumRef}>
                  <div className={styles.input_bg}></div>
                  <label
                    className={styles.label_common}
                    htmlFor="certify_num"
                    ref={labelCertifyNumRef}
                  >
                    인증번호
                  </label>
                  <input
                    className={styles.input_common}
                    ref={inputCertifyNumRef}
                    onFocus={() =>
                      handleFocus(labelCertifyNumRef, boxCertifyNumRef)
                    }
                    onBlur={() => {
                      if (
                        inputCertifyNumRef.current &&
                        inputCertifyNumRef.current.value === ""
                      )
                        handleBlur(labelCertifyNumRef, boxCertifyNumRef);
                    }}
                    type="text"
                    id="certify_num"
                    name="certify_num"
                    value={certifyNum}
                    onChange={(e) => setCertifyNum(e.target.value)}
                  />
                </div>
              </div>

              {/* 마케팅 수신 동의 및 알림 동의 */}

              <div className="checkbox_wrap">
                <div className="checkbox">
                  <input
                    type="checkbox"
                    id="marketingConsent"
                    checked={marketingConsent}
                    onChange={(e) => setMarketingConsent(e.target.checked)}
                    className={styles.checkbox}
                  />
                  <label
                    htmlFor="marketingConsent"
                    className={styles.consent_label}
                  >
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
                    <b>마케팅 정보 수신에 동의합니다 (선택)</b>
                  </label>
                </div>
                <p className="notice">
                  마케팅 정보: 새로운 기능, 이벤트, 프로모션 소식을 이메일로
                  받아보실 수 있습니다.
                </p>
              </div>

              <div className="checkbox_wrap">
                <div className="checkbox">
                  <input
                    type="checkbox"
                    id="notificationConsent"
                    checked={notificationConsent}
                    onChange={(e) => setNotificationConsent(e.target.checked)}
                    className={styles.checkbox}
                  />
                  <label
                    htmlFor="notificationConsent"
                    className={styles.consent_label}
                  >
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
                    <b>알림 수신에 동의합니다 (선택)</b>
                  </label>
                </div>
                <p className="notice">
                  알림 수신: 댓글, 좋아요, 멘션 등의 알림을 받아보실 수
                  있습니다.
                </p>
              </div>

              {/* 버튼 */}
              <div className="btn_wrap">
                <button
                  onClick={(e) => {
                    const isLocalEnvironment =
                      process.env.NODE_ENV === "development";

                    if (!idDupliCheck) {
                      e.preventDefault();
                      alert("아이디 중복을 확인해 주세요.");
                      return;
                    }
                    if (userPassword === "" || userPasswordCheck === "") {
                      e.preventDefault();
                      alert("비밀번호가 올바르지 않습니다.");
                      return;
                    }
                    // 로컬 환경이 아닐 때만 인증번호 확인
                    if (!isLocalEnvironment && !certifyAgree) {
                      e.preventDefault();
                      alert("인증번호를 확인해 주세요.");
                      return;
                    }
                    return;
                  }}
                  type="submit"
                  className={`btn ${(() => {
                    const isLocalEnvironment =
                      process.env.NODE_ENV === "development";
                    const emailVerified = isLocalEnvironment
                      ? true
                      : certifyAgree;

                    return emailVerified &&
                      idDupliCheck &&
                      userPassword === userPasswordCheck &&
                      userPassword !== ""
                      ? ""
                      : "btn_nonactive";
                  })()}`}
                >
                  회원가입
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
