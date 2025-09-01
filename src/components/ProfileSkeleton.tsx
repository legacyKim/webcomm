import React from "react";

const ProfileSkeleton: React.FC = () => {
  return (
    <div className="profile-skeleton">
      {/* 프로필 헤더 스켈레톤 */}
      <div className="profile-header-skeleton">
        <div className="avatar-skeleton" />
        <div className="user-info-skeleton">
          <div className="username-skeleton" />
          <div className="bio-skeleton" />
          <div className="stats-skeleton">
            <div className="stat-item-skeleton" />
            <div className="stat-item-skeleton" />
            <div className="stat-item-skeleton" />
          </div>
        </div>
      </div>

      {/* 탭 네비게이션 스켈레톤 */}
      <div className="tabs-skeleton">
        {[...Array(5)].map((_, index) => (
          <div key={index} className="tab-skeleton" />
        ))}
      </div>

      {/* 콘텐츠 영역 스켈레톤 */}
      <div className="content-skeleton">
        {[...Array(3)].map((_, index) => (
          <div key={index} className="content-item-skeleton">
            <div className="item-header-skeleton" />
            <div className="item-body-skeleton" />
            <div className="item-footer-skeleton" />
          </div>
        ))}
      </div>

      <style jsx>{`
        .profile-skeleton {
          padding: 20px;
          max-width: 800px;
          margin: 0 auto;
        }

        .profile-header-skeleton {
          display: flex;
          gap: 20px;
          margin-bottom: 30px;
          padding: 20px;
          background: #f8f9fa;
          border-radius: 12px;
        }

        .avatar-skeleton {
          width: 100px;
          height: 100px;
          background: linear-gradient(
            90deg,
            #e2e8f0 25%,
            #f1f5f9 50%,
            #e2e8f0 75%
          );
          background-size: 200% 100%;
          animation: shimmer 1.5s infinite;
          border-radius: 50%;
          flex-shrink: 0;
        }

        .user-info-skeleton {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .username-skeleton {
          width: 200px;
          height: 24px;
          background: linear-gradient(
            90deg,
            #e2e8f0 25%,
            #f1f5f9 50%,
            #e2e8f0 75%
          );
          background-size: 200% 100%;
          animation: shimmer 1.5s infinite;
          border-radius: 6px;
        }

        .bio-skeleton {
          width: 300px;
          height: 16px;
          background: linear-gradient(
            90deg,
            #e2e8f0 25%,
            #f1f5f9 50%,
            #e2e8f0 75%
          );
          background-size: 200% 100%;
          animation: shimmer 1.5s infinite;
          border-radius: 4px;
        }

        .stats-skeleton {
          display: flex;
          gap: 20px;
          margin-top: 8px;
        }

        .stat-item-skeleton {
          width: 60px;
          height: 20px;
          background: linear-gradient(
            90deg,
            #e2e8f0 25%,
            #f1f5f9 50%,
            #e2e8f0 75%
          );
          background-size: 200% 100%;
          animation: shimmer 1.5s infinite;
          border-radius: 4px;
        }

        .tabs-skeleton {
          display: flex;
          gap: 10px;
          margin-bottom: 20px;
          border-bottom: 1px solid #e2e8f0;
          padding-bottom: 10px;
        }

        .tab-skeleton {
          width: 80px;
          height: 32px;
          background: linear-gradient(
            90deg,
            #e2e8f0 25%,
            #f1f5f9 50%,
            #e2e8f0 75%
          );
          background-size: 200% 100%;
          animation: shimmer 1.5s infinite;
          border-radius: 6px;
        }

        .content-skeleton {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .content-item-skeleton {
          padding: 16px;
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
        }

        .item-header-skeleton {
          width: 100%;
          height: 20px;
          background: linear-gradient(
            90deg,
            #e2e8f0 25%,
            #f1f5f9 50%,
            #e2e8f0 75%
          );
          background-size: 200% 100%;
          animation: shimmer 1.5s infinite;
          border-radius: 4px;
          margin-bottom: 12px;
        }

        .item-body-skeleton {
          width: 100%;
          height: 60px;
          background: linear-gradient(
            90deg,
            #e2e8f0 25%,
            #f1f5f9 50%,
            #e2e8f0 75%
          );
          background-size: 200% 100%;
          animation: shimmer 1.5s infinite;
          border-radius: 4px;
          margin-bottom: 12px;
        }

        .item-footer-skeleton {
          width: 150px;
          height: 16px;
          background: linear-gradient(
            90deg,
            #e2e8f0 25%,
            #f1f5f9 50%,
            #e2e8f0 75%
          );
          background-size: 200% 100%;
          animation: shimmer 1.5s infinite;
          border-radius: 4px;
        }

        @keyframes shimmer {
          0% {
            background-position: -200% 0;
          }
          100% {
            background-position: 200% 0;
          }
        }

        @media (max-width: 768px) {
          .profile-header-skeleton {
            flex-direction: column;
            text-align: center;
            gap: 16px;
          }

          .avatar-skeleton {
            align-self: center;
          }

          .stats-skeleton {
            justify-content: center;
          }

          .tabs-skeleton {
            flex-wrap: wrap;
            gap: 8px;
          }

          .tab-skeleton {
            width: 70px;
            height: 28px;
          }
        }
      `}</style>
    </div>
  );
};

export default ProfileSkeleton;
