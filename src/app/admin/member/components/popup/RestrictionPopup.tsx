"use client";

import { useState } from "react";

interface RestrictionPopupProps {
  member: {
    id: number;
    user_nickname: string;
    authority: number;
  };
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (memberId: number, restrictionUntil: string | null) => void;
}

export default function RestrictionPopup({ member, isOpen, onClose, onSuccess }: RestrictionPopupProps) {
  const [restrictionDays, setRestrictionDays] = useState<number>(7);
  const [customDate, setCustomDate] = useState<string>("");
  const [restrictionType, setRestrictionType] = useState<"days" | "custom" | "remove">("days");

  if (!isOpen) return null;

  const handleSubmit = async () => {
    let restrictionUntil: string | null = null;

    if (restrictionType === "days") {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + restrictionDays);
      restrictionUntil = futureDate.toISOString();
    } else if (restrictionType === "custom" && customDate) {
      restrictionUntil = new Date(customDate).toISOString();
    }

    try {
      const response = await fetch("/api/admin/members/restriction", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          memberId: member.id,
          restrictionUntil,
          authority: restrictionType === "remove" ? 1 : 2, // 제한 해제시 일반회원으로
        }),
      });

      const result = await response.json();

      if (response.ok) {
        alert(result.message || "제한 설정이 완료되었습니다.");
        onSuccess(member.id, restrictionUntil);
        onClose();
      } else {
        throw new Error(result.error || "설정 실패");
      }
    } catch (error) {
      console.error("제한 설정 오류:", error);
      alert(`제한 설정 중 오류가 발생했습니다: ${error instanceof Error ? error.message : "알 수 없는 오류"}`);
    }
  };

  return (
    <div className='admin_popup_bg'>
      <div className='admin_popup admin_popup_mo'>
        <div className='admin_popup_header'>
          <h6>{member.user_nickname} 회원 제한 설정</h6>
        </div>

        <div className='admin_popup_content'>
          <div className='restriction-options'>
            <label>
              <input
                type='radio'
                name='restrictionType'
                value='days'
                checked={restrictionType === "days"}
                onChange={(e) => setRestrictionType(e.target.value as "days")}
              />
              일정 기간 제한
            </label>

            {restrictionType === "days" && (
              <div className='days-input'>
                <input
                  type='number'
                  min='1'
                  max='365'
                  value={restrictionDays}
                  onChange={(e) => setRestrictionDays(parseInt(e.target.value))}
                />
                <span>일간</span>
              </div>
            )}

            <label>
              <input
                type='radio'
                name='restrictionType'
                value='custom'
                checked={restrictionType === "custom"}
                onChange={(e) => setRestrictionType(e.target.value as "custom")}
              />
              특정 날짜까지
            </label>

            {restrictionType === "custom" && (
              <input type='datetime-local' value={customDate} onChange={(e) => setCustomDate(e.target.value)} />
            )}

            <label>
              <input
                type='radio'
                name='restrictionType'
                value='remove'
                checked={restrictionType === "remove"}
                onChange={(e) => setRestrictionType(e.target.value as "remove")}
              />
              제한 해제
            </label>
          </div>
        </div>

        <div className='admin_popup_footer'>
          <button onClick={handleSubmit}>적용</button>
          <button onClick={onClose}>취소</button>
        </div>
      </div>
    </div>
  );
}
