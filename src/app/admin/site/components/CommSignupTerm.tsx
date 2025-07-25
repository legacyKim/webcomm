"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";

// Dynamic import to avoid SSR issues
const TiptapEditor = dynamic(() => import("../adminEditor"), {
  ssr: false,
  loading: () => <p>에디터 로딩 중...</p>,
});

const CommSignupTerm: React.FC = () => {
  const [content, setContent] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  useEffect(() => {
    const fetchSignupTerm = async () => {
      try {
        const response = await fetch("/api/admin/signup-term");
        if (response.ok) {
          const result = await response.json();
          if (result.success && result.data) {
            setContent(result.data.content || "");
          }
        }
      } catch (error) {
        console.error("회원가입약관 로드 실패:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSignupTerm();
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const response = await fetch("/api/admin/signup-term", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content }),
      });

      if (response.ok) {
        alert("회원가입약관이 저장되었습니다.");
      } else {
        alert("저장에 실패했습니다.");
      }
    } catch (error) {
      console.error("저장 실패:", error);
      alert("저장 중 오류가 발생했습니다.");
    } finally {
      setIsSaving(false);
    }
  };

  const handlePreview = () => {
    const previewWindow = window.open("", "_blank");
    if (previewWindow) {
      previewWindow.document.write(`
        <html>
          <head>
            <title>회원가입약관 미리보기</title>
            <style>
              body { font-family: Arial, sans-serif; padding: 20px; }
            </style>
          </head>
          <body>
            <h1>회원가입약관 미리보기</h1>
            <div>${content}</div>
          </body>
        </html>
      `);
      previewWindow.document.close();
    }
  };

  // 기본 회원가입약관 템플릿 설정
  const setDefaultTemplate = () => {
    const defaultContent = `
<h1>회원가입약관</h1>

<h2>제1조 (목적)</h2>
<p>이 약관은 [사이트명] (이하 "회사"라 한다)이 제공하는 온라인 서비스(이하 "서비스"라 한다)의 이용과 관련하여 회사와 회원의 권리, 의무 및 책임사항을 규정함을 목적으로 합니다.</p>

<h2>제2조 (정의)</h2>
<p>1. "서비스"라 함은 회사가 제공하는 모든 온라인 서비스를 의미합니다.</p>
<p>2. "회원"이라 함은 이 약관에 따라 회사와 이용계약을 체결하고 회사가 제공하는 서비스를 이용하는 자를 의미합니다.</p>
<p>3. "아이디(ID)"라 함은 회원의 식별과 서비스 이용을 위하여 회원이 정하고 회사가 승인하는 문자와 숫자의 조합을 의미합니다.</p>

<h2>제3조 (약관의 효력 및 변경)</h2>
<p>1. 이 약관은 서비스를 통해 공지함으로써 효력이 발생합니다.</p>
<p>2. 회사는 합리적인 사유가 발생할 경우에는 관련 법령에 위배되지 않는 범위에서 이 약관을 개정할 수 있습니다.</p>

<h2>제4조 (회원가입)</h2>
<p>1. 회원가입은 신청자가 온라인으로 약관에 동의하고 회원가입신청을 하면 회사가 이를 승낙함으로써 체결됩니다.</p>
<p>2. 회원가입신청자는 반드시 실명으로만 신청할 수 있습니다.</p>
<p>3. 회사는 다음 각 호에 해당하는 신청에 대하여는 승낙을 하지 않거나 사후에 이용계약을 해지할 수 있습니다:</p>
<ul>
<li>가입신청자가 이 약관에 의하여 이전에 회원자격을 상실한 적이 있는 경우</li>
<li>실명이 아니거나 타인의 명의를 이용한 경우</li>
<li>허위의 정보를 기재하거나, 회사가 제시하는 내용을 기재하지 않은 경우</li>
<li>14세 미만 아동으로부터 개인정보를 수집하는 경우</li>
</ul>

<h2>제5조 (회원정보의 변경)</h2>
<p>1. 회원은 개인정보관리화면을 통하여 언제든지 본인의 개인정보를 열람하고 수정할 수 있습니다.</p>
<p>2. 회원은 회원가입 시 기재한 사항이 변경되었을 경우 온라인으로 수정을 하거나 전자우편 기타 방법으로 회사에 그 변경사항을 알려야 합니다.</p>

<h2>제6조 (회원의 의무)</h2>
<p>1. 회원은 다음 행위를 하여서는 안 됩니다:</p>
<ul>
<li>신청 또는 변경시 허위 내용의 등록</li>
<li>타인의 정보 도용</li>
<li>회사가 게시한 정보의 변경</li>
<li>회사가 정한 정보 이외의 정보(컴퓨터 프로그램 등) 등의 송신 또는 게시</li>
<li>회사 기타 제3자의 저작권 등 지적재산권에 대한 침해</li>
<li>회사 기타 제3자의 명예를 손상시키거나 업무를 방해하는 행위</li>
<li>외설 또는 폭력적인 메시지, 화상, 음성, 기타 공서양속에 반하는 정보를 회사에 공개 또는 게시하는 행위</li>
</ul>

<h2>제7조 (서비스의 제공 및 변경)</h2>
<p>1. 회사는 회원에게 아래와 같은 서비스를 제공합니다:</p>
<ul>
<li>커뮤니티 서비스</li>
<li>게시판 서비스</li>
<li>기타 회사가 추가 개발하거나 다른 회사와의 제휴계약 등을 통해 회원에게 제공하는 일체의 서비스</li>
</ul>

<h2>제8조 (서비스의 중단)</h2>
<p>1. 회사는 컴퓨터 등 정보통신설비의 보수점검, 교체 및 고장, 통신의 두절 등의 사유가 발생한 경우에는 서비스의 제공을 일시적으로 중단할 수 있습니다.</p>

<h2>제9조 (계약해지 및 이용제한)</h2>
<p>1. 회원이 이용계약을 해지하고자 하는 때에는 회원 본인이 온라인을 통하여 회사에 해지신청을 하여야 합니다.</p>
<p>2. 회사는 회원이 이 약관의 의무를 위반하거나 서비스의 정상적인 운영을 방해한 경우, 경고, 일시정지, 영구이용정지 등으로 서비스 이용을 단계적으로 제한할 수 있습니다.</p>

<h2>제10조 (손해배상)</h2>
<p>회사는 무료로 제공되는 서비스와 관련하여 회원에게 어떠한 손해가 발생하더라도 동 손해가 회사의 고의 또는 중과실에 의한 경우를 제외하고는 이에 대하여 책임을 부담하지 아니합니다.</p>

<h2>제11조 (면책조항)</h2>
<p>1. 회사는 천재지변 또는 이에 준하는 불가항력으로 인하여 서비스를 제공할 수 없는 경우에는 서비스 제공에 관한 책임이 면제됩니다.</p>
<p>2. 회사는 회원의 귀책사유로 인한 서비스 이용의 장애에 대하여는 책임을 지지 않습니다.</p>

<h2>제12조 (준거법 및 관할법원)</h2>
<p>1. 이 약관에 명시되지 않은 사항은 관계법령 및 상관례에 따릅니다.</p>
<p>2. 서비스 이용으로 발생한 분쟁에 대해 소송이 제기되는 경우 회사의 본사 소재지를 관할하는 법원을 전속관할로 합니다.</p>

<p><strong>부칙</strong></p>
<p>이 약관은 ${new Date().toLocaleDateString("ko-KR")}부터 시행됩니다.</p>
    `;
    setContent(defaultContent);
  };

  if (isLoading) {
    return <div>로딩 중...</div>;
  }

  return (
    <div className='admin_content_wrap'>
      <div className='admin_title'>
        <h4 className=''>회원가입약관 관리</h4>

        <div className='admin_btn_wrap'>
          <button
            onClick={setDefaultTemplate}
            className='px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 mr-2'>
            기본 템플릿 적용
          </button>

          <button
            onClick={handleSave}
            disabled={isSaving}
            className='px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 mr-2'>
            {isSaving ? "저장 중..." : "저장"}
          </button>

          <button onClick={handlePreview} className='px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600'>
            미리보기
          </button>
        </div>
      </div>

      <TiptapEditor content={content} onChange={setContent} />
    </div>
  );
};

export default CommSignupTerm;
