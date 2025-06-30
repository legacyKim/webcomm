"use client";

import Link from "next/link";
import { useState } from "react";

import "@/style/style.common.scss";
import styles from "@/style/Login.module.scss";

export default function Member() {
  const [agree01, setAgree01] = useState(false);
  const [agree02, setAgree02] = useState(false);

  const allChecked = agree01 && agree02;

  return (
    <div className={styles.container}>
      <div className={styles.page}>
        <div className={styles.membership_wrap}>
          <div className={styles.membership}>
            <h4 className={styles.membership_tit}>회원가입약관</h4>
            <div className={styles.membership_box}>
              <p className={styles.membership_contents}>
                이용자는 다음 행위를 하여서는 안됩니다. 신청 또는 변경시 허위 내용의 등록 타인의 정보 도용
                &quot;몰&quot;에 게시된 정보의 변경 &quot;몰&quot;이 정한 정보 이외의 정보(컴퓨터 프로그램 등) 등의 송신
                또는 게시 &quot;몰&quot; 기타 제3자의 저작권 등 지적재산권에 대한 침해 &quot;몰&quot; 기타 제3자의
                명예를 손상시키거나 업무를 방해하는 행위 외설 또는 폭력적인 메시지, 화상, 음성, 기타 공서양속에 반하는
                정보를 몰에 공개 또는 게시하는 행위
              </p>
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
            <h4 className={styles.membership_tit}>개인정보처리방침안내</h4>
            <div className={styles.membership_box}>
              <p className={styles.membership_contents}>
                이용자는 다음 행위를 하여서는 안됩니다. 신청 또는 변경시 허위 내용의 등록 타인의 정보 도용
                &quot;몰&quot;에 게시된 정보의 변경 &quot;몰&quot;이 정한 정보 이외의 정보(컴퓨터 프로그램 등) 등의 송신
                또는 게시 &quot;몰&quot; 기타 제3자의 저작권 등 지적재산권에 대한 침해 &quot;몰&quot; 기타 제3자의
                명예를 손상시키거나 업무를 방해하는 행위 외설 또는 폭력적인 메시지, 화상, 음성, 기타 공서양속에 반하는
                정보를 몰에 공개 또는 게시하는 행위
              </p>
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
    </div>
  );
}
