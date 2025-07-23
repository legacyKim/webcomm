"use client";

import Link from "next/link";
import { useState, useEffect } from "react";

import "@/style/style.common.scss";
import styles from "@/style/Login.module.scss";

import { CheckCircleIcon } from "@heroicons/react/24/outline";
import { useAuth } from "@/AuthContext";

export default function Member() {
  const { setAgreeCheck } = useAuth();

  const [agree01, setAgree01] = useState(false);
  const [agree02, setAgree02] = useState(false);
  const [termsContent, setTermsContent] = useState<string>("");
  const [privacyContent, setPrivacyContent] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);

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
  }, [allChecked]);

  // 약관 및 개인정보처리방침 불러오기
  useEffect(() => {
    const fetchPolicies = async () => {
      try {
        const [termsResponse, privacyResponse] = await Promise.all([
          fetch("/api/admin/community/terms"),
          fetch("/api/admin/community/privacy"),
        ]);

        if (termsResponse.ok) {
          const termsData = await termsResponse.json();
          setTermsContent(termsData.content || getDefaultTerms());
        } else {
          setTermsContent(getDefaultTerms());
        }

        if (privacyResponse.ok) {
          const privacyData = await privacyResponse.json();
          setPrivacyContent(privacyData.content || getDefaultPrivacy());
        } else {
          setPrivacyContent(getDefaultPrivacy());
        }
      } catch (error) {
        console.error("약관 불러오기 실패:", error);
        setTermsContent(getDefaultTerms());
        setPrivacyContent(getDefaultPrivacy());
      } finally {
        setIsLoading(false);
      }
    };

    fetchPolicies();
  }, []);

  // 기본 이용약관
  const getDefaultTerms = () => {
    return `<p>본 약관은 tokti.site(이하 "사이트")가 제공하는 서비스의 이용과 관련하여, 회원과 사이트 간의 권리, 의무 및 책임사항 등을 규정함을 목적으로 합니다.</p>

<h2>제1조. 목적</h2>
<p>이 약관은 사이트에 회원으로 가입하고 서비스를 이용하는 데 필요한 조건, 절차 및 회원과 사이트 간의 권리·의무 관계를 명확히 정하는 것을 목적으로 합니다.</p>

<h2>제2조. 용어의 정의</h2>
<ul>
  <li><strong>서비스</strong>: 사이트가 제공하는 모든 서비스를 의미합니다.</li>
  <li><strong>회원</strong>: 사이트에 개인정보를 제공하여 회원가입을 한 자로서, 사이트의 정보를 지속적으로 제공받으며, 사이트가 제공하는 서비스를 계속적으로 이용할 수 있는 자를 말합니다.</li>
</ul>

<h2>제3조. 약관의 게시와 개정</h2>
<ul>
  <li>사이트는 이 약관의 내용을 회원이 쉽게 알 수 있도록 서비스 초기 화면에 게시합니다.</li>
  <li>사이트는 관련 법령을 위배하지 않는 범위에서 이 약관을 개정할 수 있습니다.</li>
</ul>

<h2>제4조. 서비스의 제공 및 변경</h2>
<ul>
  <li>사이트는 다음과 같은 업무를 수행합니다:
    <ul>
      <li>온라인 커뮤니티 서비스</li>
      <li>정보 제공 서비스</li>
      <li>기타 사이트가 정하는 업무</li>
    </ul>
  </li>
  <li>사이트는 서비스의 내용 및 제공일정을 변경할 수 있습니다.</li>
</ul>

<h2>제5조. 서비스의 중단</h2>
<p>사이트는 컴퓨터 등 정보통신설비의 보수점검, 교체 및 고장, 통신의 두절 등의 사유가 발생한 경우에는 서비스의 제공을 일시적으로 중단할 수 있습니다.</p>

<h2>제6조. 회원가입</h2>
<ul>
  <li>회원가입은 신청자가 약관의 내용에 대하여 동의를 하고 회원가입신청을 한 후 사이트가 이러한 신청에 대하여 승낙함으로써 체결됩니다.</li>
  <li>사이트는 다음 각 호에 해당하는 신청에 대하여는 승낙하지 않을 수 있습니다:
    <ul>
      <li>실명이 아니거나 타인의 명의를 이용한 경우</li>
      <li>허위의 정보를 기재하거나, 사이트가 제시하는 내용을 기재하지 않은 경우</li>
    </ul>
  </li>
</ul>

<h2>제7조. 회원정보의 변경</h2>
<p>회원은 개인정보관리화면을 통하여 언제든지 본인의 개인정보를 열람하고 수정할 수 있습니다.</p>

<h2>제8조. 개인정보보호 의무</h2>
<p>사이트는 관련 법령이 정하는 바에 따라서 회원등록정보를 포함한 회원의 개인정보를 보호하기 위하여 노력합니다.</p>

<h2>제9조. 회원의 의무</h2>
<p>회원은 다음 행위를 하여서는 안 됩니다:</p>
<ul>
  <li>신청 또는 변경시 허위내용의 등록</li>
  <li>타인의 정보 도용</li>
  <li>사이트에 게시된 정보의 변경</li>
  <li>사이트가 정한 정보 이외의 정보(컴퓨터 프로그램 등)의 송신 또는 게시</li>
  <li>사이트 기타 제3자의 저작권 등 지적재산권에 대한 침해</li>
  <li>사이트 기타 제3자의 명예를 손상시키거나 업무를 방해하는 행위</li>
  <li>외설 또는 폭력적인 메시지, 화상, 음성, 기타 공서양속에 반하는 정보를 사이트에 공개 또는 게시하는 행위</li>
</ul>

<h2>제10조. 저작권의 귀속 및 이용제한</h2>
<ul>
  <li>사이트가 작성한 저작물에 대한 저작권 기타 지적재산권은 사이트에 귀속합니다.</li>
  <li>회원은 사이트를 이용함으로써 얻은 정보 중 사이트에게 지적재산권이 귀속된 정보를 사이트의 사전 승낙 없이 복제, 송신, 출판, 배포, 방송 기타 방법에 의하여 영리목적으로 이용하거나 제3자에게 이용하게 하여서는 안됩니다.</li>
</ul>

<h2>제11조. 계약해지 및 이용제한</h2>
<ul>
  <li>회원이 이용계약을 해지하고자 하는 때에는 회원 본인이 온라인을 통하여 사이트에 해지신청을 하여야 합니다.</li>
  <li>사이트는 회원이 다음 각호에 해당하는 행위를 하였을 경우 사전통지 없이 이용계약을 해지하거나 또는 기간을 정하여 서비스 이용을 중단할 수 있습니다:
    <ul>
      <li>가입 신청 시에 허위 내용을 등록한 경우</li>
      <li>다른 사람의 사이트 이용을 방해하거나 그 정보를 도용하는 등 전자상거래 질서를 위협하는 경우</li>
      <li>사이트를 이용하여 법령 또는 이 약관이 금지하거나 공서양속에 반하는 행위를 하는 경우</li>
    </ul>
  </li>
</ul>

<h2>제12조. 손해배상 및 기타사항</h2>
<ul>
  <li>사이트는 무료로 제공되는 서비스와 관련하여 회원에게 어떠한 손해가 발생하더라도 동 손해가 사이트의 고의 또는 중과실에 의한 경우를 제외하고는 이에 대하여 책임을 부담하지 아니합니다.</li>
  <li>이 약관에서 정하지 아니한 사항에 대해서는 법령 또는 사이트가 정한 서비스의 개별약관, 운영정책 및 규칙 등(이하 세부지침)의 규정에 따릅니다.</li>
</ul>

<h2>제13조. 재판권 및 준거법</h2>
<p>이 약관에 관하여 분쟁이 있을 때에는 대한민국 법을 적용하며, 분쟁으로 인한 소송은 민사소송법상의 관할법원에 제기합니다.</p>

<h2>부칙</h2>
<p>이 약관은 2025년 1월 1일부터 적용됩니다.</p>`;
  };

  // 기본 개인정보처리방침
  const getDefaultPrivacy = () => {
    return `<h2>개인정보처리방침</h2>

<h2>제1조. 개인정보의 처리 목적</h2>
<p>'tokti.site'는 다음의 목적을 위하여 개인정보를 처리하고 있으며, 다음의 목적 이외의 용도로는 이용하지 않습니다.</p>
<ul>
  <li>회원 가입의사 확인, 회원제 서비스 제공에 따른 본인 식별·인증, 회원자격 유지·관리</li>
  <li>서비스 제공, 콘텐츠 제공, 맞춤서비스 제공</li>
  <li>마케팅 및 광고에의 활용</li>
</ul>

<h2>제2조. 개인정보의 처리 및 보유 기간</h2>
<p>'tokti.site'는 정보주체로부터 개인정보를 수집할 때 동의 받은 개인정보 보유·이용기간 또는 법령에 따른 개인정보 보유·이용기간 내에서 개인정보를 처리·보유합니다.</p>
<p>구체적인 개인정보 처리 및 보유 기간은 다음과 같습니다:</p>
<ul>
  <li>회원 가입 및 관리: 서비스 이용계약 또는 회원가입 해지시까지</li>
  <li>재화 또는 서비스 제공: 재화·서비스 공급완료 및 요금결제·정산 완료시까지</li>
</ul>

<h2>제3조. 개인정보의 제3자 제공에 관한 사항</h2>
<p>'tokti.site'는 정보주체의 개인정보를 제1조(개인정보의 처리 목적)에서 명시한 범위 내에서만 처리하며, 정보주체의 동의, 법률의 특별한 규정 등 개인정보 보호법 제17조 및 제18조에 해당하는 경우에만 개인정보를 제3자에게 제공합니다.</p>

<h2>제4조. 개인정보처리 위탁</h2>
<p>'tokti.site'는 원활한 개인정보 업무처리를 위하여 다음과 같이 개인정보 처리업무를 위탁하고 있습니다.</p>
<ul>
  <li>위탁받는 자 (수탁자): 별도 공지</li>
  <li>위탁하는 업무의 내용: 회원제 서비스 이용에 따른 본인확인, 인증업무</li>
</ul>

<h2>제5조. 정보주체의 권리·의무 및 그 행사방법</h2>
<p>이용자는 개인정보주체로서 다음과 같은 권리를 행사할 수 있습니다:</p>
<ul>
  <li>개인정보 처리정지 요구권</li>
  <li>개인정보 열람요구권</li>
  <li>개인정보 정정·삭제요구권</li>
  <li>개인정보 처리정지 요구권</li>
</ul>

<h2>제6조. 처리하는 개인정보의 항목</h2>
<p>'tokti.site'는 다음의 개인정보 항목을 처리하고 있습니다:</p>
<ul>
  <li>필수항목: 이메일, 비밀번호, 닉네임</li>
  <li>선택항목: 프로필 이미지</li>
</ul>

<h2>제7조. 개인정보의 파기</h2>
<p>'tokti.site'는 원칙적으로 개인정보 처리목적이 달성된 경우에는 지체없이 해당 개인정보를 파기합니다. 파기의 절차, 기한 및 방법은 다음과 같습니다:</p>
<ul>
  <li><strong>파기절차</strong>: 이용자가 입력한 정보는 목적 달성 후 별도의 DB에 옮겨져 내부 방침 및 기타 관련 법령에 따라 일정기간 저장된 후 혹은 즉시 파기됩니다.</li>
  <li><strong>파기기한</strong>: 이용자의 개인정보는 개인정보의 보유기간이 경과된 경우에는 보유기간의 종료일로부터 5일 이내에, 개인정보의 처리 목적 달성, 해당 서비스의 폐지, 사업의 종료 등 그 개인정보가 불필요하게 되었을 때에는 개인정보의 처리가 불필요한 것으로 인정되는 날로부터 5일 이내에 그 개인정보를 파기합니다.</li>
</ul>

<h2>제8조. 개인정보 보호책임자</h2>
<p>'tokti.site'는 개인정보 처리에 관한 업무를 총괄해서 책임지고, 개인정보 처리와 관련한 정보주체의 불만처리 및 피해구제 등을 위하여 아래와 같이 개인정보 보호책임자를 지정하고 있습니다:</p>
<ul>
  <li>개인정보 보호책임자: 사이트 관리자</li>
  <li>연락처: admin@tokti.site</li>
</ul>

<h2>제9조. 개인정보 처리방침 변경</h2>
<p>이 개인정보처리방침은 시행일로부터 적용되며, 법령 및 방침에 따른 변경내용의 추가, 삭제 및 정정이 있는 경우에는 변경사항의 시행 7일 전부터 공지사항을 통하여 고지할 것입니다.</p>

<h2>부칙</h2>
<p>시행일자: 2025년 1월 1일</p>`;
  };

  if (isLoading) {
    return (
      <div className={styles.page}>
        <div className={styles.membership_wrap}>
          <div className={styles.membership}>
            <h4 className={styles.membership_tit}>
              <CheckCircleIcon className='icon' />
              약관 불러오는 중...
            </h4>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.membership_wrap}>
        <div className={styles.membership}>
          <h4 className={styles.membership_tit}>
            <CheckCircleIcon className='icon' />
            회원가입약관
          </h4>
          <div className={styles.membership_box}>
            <div className={styles.membership_contents} dangerouslySetInnerHTML={{ __html: termsContent }} />
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
            <div className={styles.membership_contents} dangerouslySetInnerHTML={{ __html: privacyContent }} />
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

        {/* 체크박스 */}
        <div className='checkbox'>
          <input
            type='checkbox'
            id='member_agree_all'
            name='member_agree_all'
            className='hidden_checkbox'
            checked={allChecked}
            onChange={() => setAgreeAll(!allChecked)}
          />
          <label htmlFor='member_agree_all' className='custom_checkbox'>
            <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' width='24' height='24' className='svg_checkbox'>
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
            <b>모두 동의합니다.</b>
          </label>
        </div>
      </div>
      <div className='btn_wrap'>
        <Link
          href='/user'
          className={`btn btn_width ${!allChecked ? styles.disabled : ""}`}
          tabIndex={allChecked ? 0 : -1}
          aria-disabled={!allChecked}
          onClick={(e) => {
            if (!allChecked) {
              e.preventDefault();
            }
          }}>
          회원가입
        </Link>
      </div>
    </div>
  );
}
