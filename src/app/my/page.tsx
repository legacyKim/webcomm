"use client";

import axios from "axios";
import "../style/style.common.scss"

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

import { useAuth } from '../AuthContext'

export default function Mypage() {

    const router = useRouter();
    const { isUsername, setIsUsername, isUserId, setIsUserId, isUserNick, setIsUserNick, isUserProfile, setIsUserProfile, isUserEmail, setIsUserEmail } = useAuth();

    const [newNick, setNewNick] = useState<string>(isUserNick || '');

    const [newPassword, setNewPassword] = useState<string>("");
    const [newPasswordCon, setNewPasswordCon] = useState<string>("");
    const [userPasswordNotice, setUserPasswordNotice] = useState<string>("영문, 숫자, 특수문자 혼합 사용 / 최소 4자 이상 입력하세요.");

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
    }

    // 이메일 인증 요청
    const inputEmailRef = useRef<HTMLInputElement>(null);
    const inputCertifyNumRef = useRef<HTMLInputElement>(null);

    const [userEmail, setUserEmail] = useState<string>(isUserEmail || '');
    const [certifyNum, setCertifyNum] = useState<string>("");

    const [certifyNumCheck, setCertifyNumCheck] = useState<string>('');
    const [certifyAgree, setCertifyAgree] = useState<boolean>(false);

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

    const userChangePost = async (e: React.FormEvent) => {

        e.preventDefault();

        const nickRegex = /^[a-zA-Z0-9가-힣]{2,12}$/;

        if (!newNick) {
            alert("닉네임을 입력해 주세요!")
            return;
        }

        if (!nickRegex.test(newNick || '')) {
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

        formData.append("userid", String(isUserId || ''));
        formData.append("userNickname", newNick);
        formData.append("userPassword", newPassword);
        formData.append("userEmail", userEmail);

        if (file) {
            formData.append("profileImage", file);
        }

        try {
            const response = await axios.put("/api/user", formData);

            if (response.data.success) {
                alert(response.data.message);
                await axios.post('/api/logout');
                router.push('/login');

            } else {
                alert(response.data.message);
            }

        } catch (error) {
            console.error(error);
            alert("서버 오류가 발생했습니다.");
        }
    }

    return (
        <sub className="sub">

            <div className='mypage'>

                <div className='section_top'>
                    <h4 className='title'>{isUserNick}님의 계정</h4>
                    <p className="notice">회원님의 정보를 확인하실 수 있습니다.</p>
                </div>

                <div className='mypage_list'>
                    <button type="button">계정 정보</button>
                    <button type="button">활동 내역</button>
                </div>

                <div className="mypage_content">
                    <form className='mypage_info_list'>

                        <div className="mypage_info">
                            <span>아이디</span>
                            <div className="input_box">
                                <input type="text" value={isUsername} disabled />
                            </div>
                        </div>

                        <div className="mypage_info">
                            <span>별명</span>
                            <div className="input_box">
                                <input type="text" value={newNick} onChange={(e) => { setNewNick(e.target.value); }} />
                                <p>별명은 최대 한글 6자, 영문 12자까지 입력이 가능합니다.</p>
                                <p className="notice">부적절한 별명은 임의로 변경될 수 있습니다.</p>
                            </div>
                        </div>

                        <div className="mypage_info">
                            <span>프로필 사진</span>

                            <div>
                                <div className="input_group">
                                    <div className="input_box input_img">
                                        <label
                                            className="label_img"
                                            htmlFor="profileImage"
                                            ref={labelProfileImgRef}>

                                            {fileName ? (
                                                <>
                                                    <span className={`file_name_label after`}>프로필 이미지</span>
                                                    <p className="file_name">{fileName}</p>
                                                </>
                                            ) : (
                                                <span className="file_name_label">프로필 이미지 변경하기</span>
                                            )}

                                        </label>

                                        {/* 파일 선택 버튼 (커스텀 스타일링) */}
                                        <input
                                            className="input_common"
                                            ref={inputProfileImgRef}
                                            type="file"
                                            id="profileImage"
                                            name="profileImage"
                                            accept="image/*"
                                            onChange={(e) => { handleImageChange(e); }}
                                            style={{ display: "none" }}
                                        />
                                    </div>
                                </div>

                                {/* 미리보기 이미지 */}
                                {newProfile && (
                                    <div className="img_preview">
                                        <img src={newProfile} alt="Profile Preview" />
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="mypage_info mb_4">
                            <span>비밀번호</span>
                            <div className="input_box">
                                <input type="password" onChange={(e) => { setNewPassword(e.target.value) }} />
                            </div>
                        </div>

                        <div className="mypage_info">
                            <span>비밀번호 확인</span>
                            <div className="input_box">
                                <input type="password" onChange={(e) => { setNewPasswordCon(e.target.value) }} />
                                <p>{userPasswordNotice}</p>
                            </div>
                        </div>

                        <div className="mypage_info mb_4">
                            <span>이메일</span>
                            <div className="input_box">
                                <input type="text" ref={inputEmailRef} value={userEmail} onChange={(e) => { setUserEmail(e.target.value) }} />
                                <button type="button" onClick={() => emailCheck()}>인증번호 요청</button>
                            </div>
                        </div>

                        <div className="mypage_info">
                            <span>인증번호</span>
                            <div className="input_box">
                                <div className="input_box">
                                    <input type="text" ref={inputCertifyNumRef} onChange={(e) => setCertifyNum(e.target.value)} />
                                </div>
                                <p>비밀번호 분실 또는 수정 등의 사이트 활동에 필수적인 메일이 발송되오니 정확히 입력해주세요.</p>
                            </div>

                        </div>

                        <div className="btn_wrap">
                            <button type="submit" onClick={(e) => { userChangePost(e); }} className="btn">저장</button>
                        </div>

                    </form>
                </div>
            </div>
        </sub>
    )

}