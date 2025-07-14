"use client";

import Link from "next/link";
import { useState } from "react";

import "@/style/style.common.scss";
import styles from "@/style/Login.module.scss";

import { CheckCircleIcon } from "@heroicons/react/24/outline";

export default function Member() {
  const [agree01, setAgree01] = useState(false);
  const [agree02, setAgree02] = useState(false);

  const allChecked = agree01 && agree02;

  return (
    <div className={styles.page}>
      <div className={styles.membership_wrap}>
        <div className={styles.membership}>
          <h4 className={styles.membership_tit}>
            <CheckCircleIcon className='icon' />
            회원가입약관
          </h4>
          <div className={styles.membership_box}>
            <div className={styles.membership_contents}>
              <p>
                본 약관은 tokti.site(이하 &quot;사이트&quot;)가 제공하는 서비스의 이용과 관련하여, 회원과 사이트 간의
                권리, 의무 및 책임사항 등을 규정함을 목적으로 합니다.
              </p>

              <h2>제1조. 목적</h2>
              <p>
                이 약관은 사이트에 회원으로 가입하고 서비스를 이용하는 데 필요한 조건, 절차 및 회원과 사이트 간의
                권리·의무 관계를 명확히 정하는 것을 목적으로 합니다.
              </p>

              <h2>제2조. 정의</h2>
              <ul>
                <li>
                  <strong>회원</strong>: 본 약관에 동의하고 사이트에 가입하여 서비스를 이용하는 자
                </li>
                <li>
                  <strong>아이디(ID)</strong>: 회원 식별 및 서비스 이용을 위하여 설정한 문자 또는 숫자의 조합
                </li>
                <li>
                  <strong>비밀번호</strong>: 본인 확인 및 정보 보호를 위해 설정한 문자 또는 숫자의 조합
                </li>
                <li>
                  <strong>게시물</strong>: 회원이 서비스 내에 작성하거나 업로드한 글, 댓글, 이미지 등 일체의 콘텐츠
                </li>
              </ul>

              <h2>제3조. 회원가입</h2>
              <ul>
                <li>
                  회원가입은 이용자가 사이트가 정한 가입 양식에 따라 정보를 입력하고 본 약관에 동의한 후, 사이트가 이를
                  승인함으로써 완료됩니다.
                </li>
                <li>
                  사이트는 다음 각 호에 해당하는 경우 회원가입을 거부하거나 사후에 자격을 박탈할 수 있습니다.
                  <ul>
                    <li>타인의 정보를 도용하거나 허위 사실을 기재한 경우</li>
                    <li>사회질서 및 공공질서에 위배되는 목적을 가진 가입</li>
                    <li>사이트 운영에 중대한 지장을 줄 수 있다고 판단되는 경우</li>
                  </ul>
                </li>
              </ul>

              <h2>제4조. 회원의 의무</h2>
              <ul>
                <li>
                  회원은 다음과 같은 행위를 해서는 안 됩니다.
                  <ul>
                    <li>타인의 개인정보 도용</li>
                    <li>서비스 운영 방해 행위</li>
                    <li>불법 정보의 유포, 명예훼손, 욕설 등 부적절한 게시</li>
                    <li>본 약관 및 관계 법령 위반 행위</li>
                  </ul>
                </li>
                <li>
                  회원은 본인의 ID 및 비밀번호를 철저히 관리하여야 하며, 제3자에게 이를 이용하게 해서는 안 됩니다.
                </li>
              </ul>

              <h2>제5조. 서비스의 제공 및 변경</h2>
              <ul>
                <li>사이트는 게시판, 커뮤니티, 정보 열람 등 다양한 서비스를 제공합니다.</li>
                <li>서비스 내용은 운영상 필요에 따라 변경될 수 있으며, 변경 시 사전 공지합니다.</li>
              </ul>

              <h2>제6조. 회원 탈퇴 및 자격 상실</h2>
              <ul>
                <li>탈퇴 기능은 현재 준비 중입니다.</li>
                {/* <li>회원은 언제든지 사이트 내 설정 또는 고객센터를 통해 탈퇴할 수 있습니다.</li>
                  <li>
                    다음 각 호에 해당하는 경우, 사이트는 회원의 자격을 제한하거나 박탈할 수 있습니다.
                    <ul>
                      <li>본 약관을 위반한 경우</li>
                      <li>타인에게 피해를 주거나 불쾌감을 유발한 경우</li>
                      <li>사이트 운영에 중대한 방해가 된 경우</li>
                    </ul>
                  </li> */}
              </ul>

              <h2>제7조. 게시물 관리</h2>
              <ul>
                <li>회원이 작성한 게시물의 저작권은 해당 회원에게 귀속됩니다.</li>
                <li>사이트는 서비스 운영 및 홍보 목적의 범위 내에서 해당 게시물을 사용할 수 있습니다.</li>
                <li>
                  다음과 같은 게시물은 사전 통보 없이 삭제될 수 있습니다.
                  <ul>
                    <li>불법적이거나 음란한 내용</li>
                    <li>타인의 권리를 침해하거나 명예를 훼손하는 내용</li>
                    <li>광고성 또는 스팸성 게시물</li>
                    <li>기타 사이트 운영에 부적절하다고 판단되는 내용</li>
                  </ul>
                </li>
              </ul>

              <h2>제8조. 면책 조항</h2>
              <ul>
                <li>
                  사이트는 천재지변, 기술적 장애 등 불가항력으로 인해 서비스를 제공하지 못하는 경우 책임을 지지
                  않습니다.
                </li>
                <li>회원의 개인정보 관리 소홀로 발생한 손해에 대하여 책임을 지지 않습니다.</li>
              </ul>

              <h2>제9조. 준거법 및 재판관할</h2>
              <ul>
                <li>
                  이 약관은 대한민국 법률에 따라 해석되며, 서비스 이용 중 발생하는 분쟁은 민사소송법에 따른 관할 법원에
                  제소됩니다.
                </li>
              </ul>

              <h2>부칙</h2>
              <p>본 약관은 2025년 7월 13일부터 적용됩니다.</p>
            </div>
          </div>

          {/* 체크박스 */}
          <div className='checkbox'>
            <input
              type='checkbox'
              id='member_agree_01'
              name='member_agree_01'
              className='hidden_checkbox'
              checked={agree01}
              onChange={() => setAgree01((prev) => !prev)}
            />
            <label htmlFor='member_agree_01' className='custom_checkbox'>
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
              <span>회원가입약관의 내용에 동의합니다.</span>
            </label>
          </div>
        </div>

        <div className={styles.membership}>
          <h4 className={styles.membership_tit}>
            <CheckCircleIcon className='icon' />
            개인정보처리방침안내
          </h4>
          <div className={styles.membership_box}>
            <div className={styles.membership_contents}>
              <h2>제1조 (목적)</h2>
              <p>
                이 약관은 tokti(이하 &quot;사이트&quot;)가 제공하는 커뮤니티 서비스의 이용조건 및 운영자의 권리·의무
                등을 규정함을 목적으로 합니다.
              </p>
              <h2>제2조 (정의)</h2>
              <ol>
                <li>&quot;회원&quot;이란 사이트에 가입하여 서비스를 이용하는 자를 말합니다.</li>
                <li>&quot;비회원&quot;이란 회원에 가입하지 않고 서비스를 이용하는 자를 말합니다.</li>
              </ol>
              <h2>제3조 (약관의 게시 및 설명 의무)</h2>
              <ol>
                <li>운영자는 약관, 운영자명(김태훈), 연락처(이메일) 등을 사이트 첫 화면에 게재합니다.</li>
                <li>중대한 변경 시 팝업/공지/이메일을 통해 회원의 동의를 받습니다.</li>
              </ol>
              <h2>제4조 (서비스 제공 및 변경)</h2>
              <ol>
                <li>사이트는 게시판, 댓글, 검색 기능 등 커뮤니티 서비스를 제공합니다.</li>
                <li>서버 점검 또는 긴급 상황 시 사전 또는 사후 공지로 서비스 일시 중단이 가능합니다.</li>
              </ol>
              <h2>제5조 (회원가입 및 탈퇴)</h2>
              <ol>
                <li>회원가입은 이메일, 닉네임 입력 후 본 약관 동의로 진행합니다.</li>
                <li>회원은 언제든지 탈퇴할 수 있으며, 운영자는 즉시 탈퇴 처리합니다.</li>
              </ol>
              <h2>제6조 (회원의 의무)</h2>
              <ol>
                <li>허위정보 등록, 타인 정보 도용, 불법 게시물 등록, 저작권 침해 등을 해서는 안 됩니다.</li>
                <li>ID/비밀번호 관리는 회원 책임입니다.</li>
              </ol>
              <h2>제7조 (운영자의 의무)</h2>
              <ol>
                <li>운영자는 법령과 약관을 준수하며, 안정적 서비스 제공에 노력합니다.</li>
                <li>운영자는 이용자의 개인정보 보호를 위한 보안 시스템을 갖춥니다.</li>
              </ol>
              <h2>제8조 (개인정보 보호)</h2>
              [이전 개인정보처리방침 HTML 그대로 삽입]
              <h2>제9조 (저작권 등)</h2>
              <ol>
                <li>게시물 등 저작권은 회원에게 귀속되며, 운영자는 비영리 홍보 목적으로 사용할 수 있습니다.</li>
                <li>회원은 타인의 저작권을 침해해선 안 됩니다.</li>
              </ol>
              <h2>제10조 (분쟁해결 및 준거법)</h2>
              <ol>
                <li>약관 및 서비스와 관련된 분쟁은 대한민국 법에 따르며, 관할 법원은 운영자 주소지 관할을 따릅니다.</li>
              </ol>
              <p>부칙: 본 약관은 2025년 7월 13일부터 시행합니다.</p>
            </div>
          </div>

          {/* 체크박스 */}
          <div className='checkbox'>
            <input
              type='checkbox'
              id='member_agree_02'
              name='member_agree_02'
              className='hidden_checkbox'
              checked={agree02}
              onChange={() => setAgree02((prev) => !prev)}
            />
            <label htmlFor='member_agree_02' className='custom_checkbox'>
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
              <span>개인정보처리방침안내의 내용에 동의합니다.</span>
            </label>
          </div>
        </div>
      </div>
      <div className='btn_wrap'>
        <Link
          href='/user'
          className={`btn btn_width ${!allChecked ? styles.disabled : ""}`}
          tabIndex={allChecked ? 0 : -1}
          aria-disabled={!allChecked}
          onClick={(e) => {
            if (!allChecked) e.preventDefault();
          }}>
          회원가입
        </Link>
      </div>
    </div>
  );
}
