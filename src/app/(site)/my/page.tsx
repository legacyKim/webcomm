"use client";

import axios from "axios";
import "@/style/style.common.scss";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

import { useAuth } from "@/AuthContext";
import MyHeader from "./myHeader";

import { useLoadRecaptcha } from "@/func/hook/useLoadRecaptcha";

function getNicknameCooldownLeft(nicknameUpdatedAt: string | Date | null): number {
  if (!nicknameUpdatedAt) return 0;
  const last = new Date(nicknameUpdatedAt);
  const now = new Date();
  const diffMs = now.getTime() - last.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  const remaining = 14 - diffDays;
  return Math.max(0, remaining); // 음수 방지
}

export default function Mypage() {
  const router = useRouter();

  const {
    isUsername,
    isUserId,
    isUserNick,
    isUserProfile,
    isUserEmail,
    isUserNickUpdatedAt,

    setIsUsername,
    setLoginStatus,
    setIsUserAuthority,
    setIsUserNickUpdatedAt,
  } = useAuth();

  const [newNick, setNewNick] = useState<string>(isUserNick || "");
  const [newBio, setNewBio] = useState<string>("");

  const [newPassword, setNewPassword] = useState<string>("");
  const [, setNewPasswordCon] = useState<string>("");
  const [userPasswordNotice, setUserPasswordNotice] = useState<string>(
    "영문, 숫자, 특수문자 혼합 사용 / 최소 4자 이상 입력하세요.",
  );

  // 이미지 관련
  const inputProfileImgRef = useRef<HTMLInputElement | null>(null);
  const labelProfileImgRef = useRef<HTMLLabelElement>(null);

  const [newProfile, setNewProfile] = useState<string | null>(isUserProfile);
  const [fileName, setFileName] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (file) {
      setFileName(file.name);
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewProfile(reader.result as string);
      };
      reader.readAsDataURL(file);

      setFile(file);
    }
  };

  // 이메일 인증 요청
  const inputEmailRef = useRef<HTMLInputElement>(null);
  const inputCertifyNumRef = useRef<HTMLInputElement>(null);

  const [userEmail, setUserEmail] = useState<string>(isUserEmail || "");
  const [certifyNum, setCertifyNum] = useState<string>("");

  const [certifyNumCheck, setCertifyNumCheck] = useState<string>("");
  const [, setCertifyAgree] = useState<boolean>(false);

  const emailCheck = async () => {
    if (!userEmail) {
      alert("이메일을 입력하세요.");
      inputEmailRef.current?.focus();
      return;
    }

    if (isUserEmail === userEmail) {
      alert("이메일이 이전 이메일과 동일합니다.");
      return;
    }

    if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(userEmail)) {
      alert("이메일 형식이 올바르지 않습니다.");
      inputEmailRef.current?.focus();
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
    if (inputCertifyNumRef.current && inputCertifyNumRef.current.value === certifyNumCheck && certifyNumCheck !== "") {
      setCertifyAgree(true);
    } else {
      setCertifyAgree(false);
    }
  }, [inputCertifyNumRef.current?.value, certifyNum]);

  // 회원가입 요청
  const inputPwRef = useRef<HTMLInputElement>(null);
  const [recaptchaToken, setRecaptchaToken] = useState("");
  const loadRecaptcha = useLoadRecaptcha(setRecaptchaToken);
  useEffect(() => {
    loadRecaptcha();
  }, []);

  // 현재 사용자의 bio 가져오기
  useEffect(() => {
    const fetchUserBio = async () => {
      try {
        const response = await axios.get(`/api/user/profile?user=${isUsername}`);
        if (response.data.success && response.data.user) {
          setNewBio(response.data.user.bio || "");
        }
      } catch (error) {
        console.error("Bio 가져오기 실패:", error);
      }
    };

    if (isUsername) {
      fetchUserBio();
    }
  }, [isUsername]);

  const userChangePost = async (e: React.FormEvent) => {
    e.preventDefault();

    const nickRegex = /^[a-zA-Z0-9가-힣]{2,12}$/;

    if (!newNick) {
      alert("닉네임을 입력해 주세요!");
      return;
    }

    if (!nickRegex.test(newNick || "")) {
      alert("별명은 4~12자 내로, 특수문자는 입력할 수 없습니다.");
      return;
    }

    const passwordRegex = /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[!@#$%^&*])[a-zA-Z\d!@#$%^&*]{4,}$/;

    if (newPassword !== "" && !passwordRegex.test(newPassword)) {
      alert("영문, 숫자, 특수문자 혼합 사용 / 최소 4자 이상 입력하세요.");
      setUserPasswordNotice("영문, 숫자, 특수문자 혼합 사용 / 최소 4자 이상 입력하세요.");
      inputPwRef.current?.focus();
      return;
    }

    if (isUserEmail !== userEmail && !certifyNumCheck) {
      alert("이메일을 인증해 주세요.");
      inputCertifyNumRef.current?.focus();
      return;
    }

    const formData = new FormData();

    formData.append("userid", String(isUserId || ""));
    formData.append("userNickname", newNick);
    formData.append("userBio", newBio);
    formData.append("userPassword", newPassword);
    formData.append("userEmail", userEmail);
    formData.append("recaptchaToken", recaptchaToken || "");

    if (file) {
      formData.append("profileImage", file);
    }

    try {
      const response = await axios.put("/api/user", formData);

      if (response.data.success) {
        // 닉네임이나 비밀번호가 변경된 경우에만 로그아웃
        const isNicknameChanged = newNick !== isUserNick;
        const isPasswordChanged = newPassword !== "";

        if (isNicknameChanged || isPasswordChanged) {
          alert(response.data.message + "\n변경된 정보로 다시 로그인해주세요.");
          await axios.post("/api/logout");
          setIsUsername("");
          setLoginStatus(false);
          setIsUserAuthority(null);
          setIsUserNickUpdatedAt(null);
          router.push("/login");
        } else {
          alert("프로필이 성공적으로 업데이트되었습니다.");
          // bio만 변경된 경우 페이지 새로고침으로 최신 정보 반영
          window.location.reload();
        }
      } else {
        alert(response.data.message);
      }
    } catch (error) {
      console.error(error);
      alert("서버 오류가 발생했습니다.");
    }
  };

  const memberWithdrawal = async () => {
    const reasons = ["서비스 불만족", "개인정보 보호", "사용 빈도 낮음", "다른 서비스 이용", "개인사유", "기타"];

    const reason = prompt(
      `탈퇴 사유를 선택해주세요:\n\n` +
        reasons.map((r, i) => `${i + 1}. ${r}`).join("\n") +
        `\n\n숫자를 입력하세요 (1-${reasons.length}):`,
    );

    if (!reason) return;

    const reasonIndex = parseInt(reason) - 1;
    if (reasonIndex < 0 || reasonIndex >= reasons.length) {
      alert("올바른 번호를 선택해주세요.");
      return;
    }

    const selectedReason = reasons[reasonIndex];

    if (
      !confirm(
        `정말로 탈퇴하시겠습니까?\n\n` +
          `선택한 사유: ${selectedReason}\n\n` +
          `탈퇴 시 다음 사항에 동의하신 것으로 간주됩니다:\n` +
          `• 회원 정보 및 게시물이 숨김 처리됩니다\n` +
          `• 탈퇴 후 동일한 아이디로 재가입이 불가능합니다\n` +
          `• 작성하신 게시물과 댓글은 복구되지 않습니다\n\n` +
          `이에 동의하고 탈퇴하시겠습니까?`,
      )
    ) {
      return;
    }

    try {
      const response = await axios.post("/api/member/withdrawal", {
        reason: selectedReason,
      });

      if (response.data.success) {
        alert(response.data.message);

        // 로그아웃 처리
        setIsUsername("");
        setLoginStatus(false);
        setIsUserAuthority(null);
        setIsUserNickUpdatedAt(null);

        router.push("/");
      } else {
        alert(response.data.message || "회원 탈퇴에 실패했습니다.");
      }
    } catch (error) {
      console.error("회원 탈퇴 중 오류:", error);
      alert("서버 오류로 회원 탈퇴가 실패했습니다.");
    }
  };

  return (
    <sub className='sub'>
      <div className='mypage'>
        <MyHeader />

        {/* 계정 정보 */}
        <div className='mypage_content'>
          <form className='mypage_inner'>
            <div className='mypage_info'>
              <span>아이디</span>
              <div className='input_box'>
                <input type='text' value={isUsername || ""} disabled />
              </div>
            </div>

            <div className='mypage_info'>
              <span>별명</span>
              <div className='input_box'>
                <input
                  type='text'
                  value={newNick}
                  onChange={(e) => {
                    setNewNick(e.target.value);
                  }}
                />
                <p>별명은 최대 한글 6자, 영문 12자까지 입력이 가능합니다.</p>
                <p className='notice blue'>
                  {getNicknameCooldownLeft(isUserNickUpdatedAt) === 0 ? (
                    <>별명은 14일마다 변경이 가능합니다.</>
                  ) : (
                    <>{getNicknameCooldownLeft(isUserNickUpdatedAt)} 일 후에 변경이 가능합니다.</>
                  )}
                </p>
                <p className='notice red'>부적절한 별명은 임의로 변경될 수 있습니다.</p>
              </div>
            </div>

            <div className='mypage_info'>
              <span>자기소개</span>
              <div className='input_box'>
                <textarea
                  value={newBio}
                  onChange={(e) => setNewBio(e.target.value)}
                  rows={3}
                  maxLength={200}
                  placeholder='간단한 자기소개를 입력해주세요 (최대 200자)'
                  style={{
                    width: "100%",
                    padding: "12px 8px",
                    border: "1px solid #ddd",
                    borderRadius: "4px",
                    resize: "vertical",
                    fontSize: "14px",
                    fontFamily: "inherit",
                  }}
                />
                <p>
                  <span style={{ fontSize: "12px", color: "#666" }}>{newBio.length}/200자</span>
                </p>
              </div>
            </div>

            <div className='mypage_info'>
              <span>프로필 사진</span>

              <div>
                <div className='input_group'>
                  <div className='input_box input_img'>
                    <label className='label_img' htmlFor='profileImage' ref={labelProfileImgRef}>
                      {fileName ? (
                        <>
                          <span className={`file_name_label after`}>프로필 이미지</span>
                          <p className='file_name'>{fileName}</p>
                        </>
                      ) : (
                        <span className='file_name_label'>프로필 이미지 변경하기</span>
                      )}
                    </label>

                    {/* 파일 선택 버튼 (커스텀 스타일링) */}
                    <input
                      className='input_common'
                      ref={inputProfileImgRef}
                      type='file'
                      id='profileImage'
                      name='profileImage'
                      accept='image/*'
                      onChange={(e) => {
                        handleImageChange(e);
                      }}
                      style={{ display: "none" }}
                    />
                  </div>
                </div>

                {/* 미리보기 이미지 */}
                {newProfile ? (
                  <div className='img_preview'>
                    <img src={newProfile} alt='Profile Preview' />
                  </div>
                ) : (
                  <div className='img_preview'>
                    <img src='/profile/basic.png' alt='기본 이미지' />
                  </div>
                )}

                <p>
                  최대 &nbsp;<b className='notice'>1MB</b>&nbsp; 이하의 이미지만 업로드 가능합니다.
                </p>
              </div>
            </div>

            <div className='mypage_info mb_4'>
              <span>비밀번호 변경</span>
              <div className='input_box'>
                <input
                  type='password'
                  onChange={(e) => {
                    setNewPassword(e.target.value);
                  }}
                />
              </div>
            </div>

            <div className='mypage_info'>
              <span>비밀번호 확인</span>
              <div className='input_box'>
                <input
                  type='password'
                  onChange={(e) => {
                    setNewPasswordCon(e.target.value);
                  }}
                />
                <p>{userPasswordNotice}</p>
              </div>
            </div>

            <div className='mypage_info mb_4'>
              <span>이메일 변경</span>
              <div className='input_box'>
                <input
                  type='text'
                  ref={inputEmailRef}
                  value={userEmail}
                  onChange={(e) => {
                    setUserEmail(e.target.value);
                  }}
                />
                <button type='button' onClick={() => emailCheck()}>
                  인증번호 요청
                </button>
              </div>
            </div>

            <div className='mypage_info'>
              <span>인증번호</span>
              <div className='input_box'>
                <div className='input_box'>
                  <input type='text' ref={inputCertifyNumRef} onChange={(e) => setCertifyNum(e.target.value)} />
                </div>
                <p>비밀번호 분실 또는 수정 등 사이트 활동에 필요한 사항이 메일로 발송되니 정확히 입력해주세요.</p>
              </div>
            </div>

            <div className='btn_wrap'>
              <button
                type='submit'
                onClick={(e) => {
                  userChangePost(e);
                }}
                className='btn'>
                정보 수정
              </button>

              <button type='button' onClick={memberWithdrawal} className='btn_withdrawal'>
                회원 탈퇴
              </button>
            </div>
          </form>
        </div>
      </div>
    </sub>
  );
}
