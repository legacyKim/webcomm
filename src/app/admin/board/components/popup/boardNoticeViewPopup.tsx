"use client";

import TiptapViewer from "@/components/tiptapViewer";

interface Notice {
  url_slug: string;
  id: number;
  title: string;
  content: string;
  created_at: string;
}

interface BoardNoticeViewPopupProps {
  notice: Notice;
  isOpen: boolean;
  onClose: () => void;
}

export default function BoardNoticeViewPopup({ notice, isOpen, onClose }: BoardNoticeViewPopupProps) {
  if (!isOpen) return null;

  return (
    <div className='popup-overlay' onClick={onClose}>
      <div className='popup-content' onClick={(e) => e.stopPropagation()}>
        <div className='popup-header'>
          <h3>공지사항 보기</h3>
          <button className='close-btn' onClick={onClose}>
            ✕
          </button>
        </div>

        <div className='popup-body'>
          <div className='notice-info'>
            <div className='info-row'>
              <span className='label'>게시판:</span>
              <span className='value'>{notice.url_slug}</span>
            </div>
            <div className='info-row'>
              <span className='label'>제목:</span>
              <span className='value'>{notice.title}</span>
            </div>
            <div className='info-row'>
              <span className='label'>작성일:</span>
              <span className='value'>{new Date(notice.created_at).toLocaleDateString("ko-KR")}</span>
            </div>
          </div>

          <div className='notice-content'>
            <h4>내용</h4>
            <div className='content-viewer'>
              <TiptapViewer content={notice.content} />
            </div>
          </div>
        </div>

        <div className='popup-footer'>
          <button className='btn-secondary' onClick={onClose}>
            닫기
          </button>
        </div>
      </div>

      <style jsx>{`
        .popup-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(0, 0, 0, 0.5);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 1000;
        }

        .popup-content {
          background: white;
          border-radius: 12px;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
          width: 90%;
          max-width: 800px;
          max-height: 90vh;
          overflow: hidden;
          display: flex;
          flex-direction: column;
        }

        .popup-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px 24px;
          border-bottom: 1px solid #e9ecef;
          background: #f8f9fa;
        }

        .popup-header h3 {
          margin: 0;
          color: #333;
          font-size: 18px;
          font-weight: 600;
        }

        .close-btn {
          background: none;
          border: none;
          font-size: 20px;
          cursor: pointer;
          color: #666;
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          transition: all 0.2s;
        }

        .close-btn:hover {
          background: #e9ecef;
          color: #333;
        }

        .popup-body {
          flex: 1;
          overflow-y: auto;
          padding: 24px;
        }

        .notice-info {
          margin-bottom: 24px;
          padding: 16px;
          background: #f8f9fa;
          border-radius: 8px;
        }

        .info-row {
          display: flex;
          align-items: center;
          margin-bottom: 8px;
        }

        .info-row:last-child {
          margin-bottom: 0;
        }

        .label {
          font-weight: 600;
          color: #495057;
          min-width: 80px;
          margin-right: 12px;
        }

        .value {
          color: #333;
        }

        .notice-content h4 {
          margin: 0 0 16px 0;
          color: #333;
          font-size: 16px;
          font-weight: 600;
        }

        .content-viewer {
          border: 1px solid #dee2e6;
          border-radius: 8px;
          padding: 16px;
          background: white;
          min-height: 200px;
          line-height: 1.6;
        }

        .popup-footer {
          padding: 16px 24px;
          border-top: 1px solid #e9ecef;
          background: #f8f9fa;
          display: flex;
          justify-content: flex-end;
        }

        .btn-secondary {
          background: #6c757d;
          color: white;
          border: none;
          padding: 8px 20px;
          border-radius: 6px;
          cursor: pointer;
          font-size: 14px;
          transition: background 0.2s;
        }

        .btn-secondary:hover {
          background: #5a6268;
        }

        @media (max-width: 768px) {
          .popup-content {
            width: 95%;
            margin: 20px;
          }

          .popup-header,
          .popup-body,
          .popup-footer {
            padding: 16px;
          }

          .info-row {
            flex-direction: column;
            align-items: flex-start;
          }

          .label {
            min-width: auto;
            margin-right: 0;
            margin-bottom: 4px;
          }
        }
      `}</style>
    </div>
  );
}
