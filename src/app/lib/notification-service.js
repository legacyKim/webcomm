/**
 * 알림 시스템 통합 서비스
 * 모든 알림 생성 로직을 중앙화하여 관리
 */
export class NotificationService {
  constructor(client) {
    this.client = client;
  }

  /**
   * 기본 알림 생성 메소드
   * @param {Object} params - 알림 생성 파라미터
   * @param {string} params.type - 알림 타입 (post_like, comment_like, comment, message 등)
   * @param {number} params.senderId - 발신자 ID
   * @param {number} params.receiverId - 수신자 ID
   * @param {number|null} params.postId - 게시글 ID (선택사항)
   * @param {number|null} params.commentId - 댓글 ID (선택사항)
   * @param {string|null} params.urlSlug - URL 슬러그 (선택사항)
   * @returns {Promise<Object|null>} 생성된 알림 객체 또는 null
   */
  async createNotification({
    type,
    senderId,
    receiverId,
    postId = null,
    commentId = null,
    urlSlug = null,
  }) {
    // 자기 자신에게는 알림 보내지 않기
    if (senderId === receiverId) {
      return null;
    }

    try {
      const result = await this.client.query(
        `INSERT INTO notifications (type, sender_id, receiver_id, post_id, comment_id, url_slug, is_read)
         VALUES ($1, $2, $3, $4, $5, $6, false) RETURNING *`,
        [type, senderId, receiverId, postId, commentId, urlSlug]
      );

      return result.rows[0];
    } catch (error) {
      console.error("알림 생성 실패:", error);
      throw error;
    }
  }

  /**
   * 게시글 좋아요 알림 생성
   * @param {number} senderId - 좋아요를 누른 사용자 ID
   * @param {number} receiverId - 게시글 작성자 ID
   * @param {number} postId - 게시글 ID
   * @param {string} urlSlug - 게시판 URL 슬러그
   * @returns {Promise<Object|null>} 생성된 알림 객체
   */
  async createPostLikeNotification(senderId, receiverId, postId, urlSlug) {
    return this.createNotification({
      type: "post_like",
      senderId,
      receiverId,
      postId,
      urlSlug,
    });
  }

  /**
   * 댓글 좋아요 알림 생성
   * @param {number} senderId - 좋아요를 누른 사용자 ID
   * @param {number} receiverId - 댓글 작성자 ID
   * @param {number} postId - 게시글 ID
   * @param {number} commentId - 댓글 ID
   * @param {string} urlSlug - 게시판 URL 슬러그
   * @returns {Promise<Object|null>} 생성된 알림 객체
   */
  async createCommentLikeNotification(
    senderId,
    receiverId,
    postId,
    commentId,
    urlSlug
  ) {
    return this.createNotification({
      type: "comment_like",
      senderId,
      receiverId,
      postId,
      commentId,
      urlSlug,
    });
  }

  /**
   * 댓글 작성 알림 생성
   * @param {number} senderId - 댓글 작성자 ID
   * @param {number} receiverId - 게시글 작성자 ID
   * @param {number} postId - 게시글 ID
   * @param {number} commentId - 댓글 ID
   * @param {string} urlSlug - 게시판 URL 슬러그
   * @returns {Promise<Object|null>} 생성된 알림 객체
   */
  async createCommentNotification(
    senderId,
    receiverId,
    postId,
    commentId,
    urlSlug
  ) {
    return this.createNotification({
      type: "comment",
      senderId,
      receiverId,
      postId,
      commentId,
      urlSlug,
    });
  }

  /**
   * 메시지 알림 생성
   * @param {number} senderId - 메시지 발신자 ID
   * @param {number} receiverId - 메시지 수신자 ID
   * @returns {Promise<Object|null>} 생성된 알림 객체
   */
  async createMessageNotification(senderId, receiverId) {
    return this.createNotification({
      type: "message",
      senderId,
      receiverId,
    });
  }

  /**
   * 댓글 좋아요 알림을 위한 게시글 정보 조회 및 알림 생성
   * @param {number} senderId - 좋아요를 누른 사용자 ID
   * @param {number} receiverId - 댓글 작성자 ID
   * @param {number} commentId - 댓글 ID
   * @returns {Promise<Object|null>} 생성된 알림 객체
   */
  async createCommentLikeNotificationWithPostInfo(
    senderId,
    receiverId,
    commentId
  ) {
    try {
      // 댓글이 속한 게시글 정보 조회
      const postQuery = await this.client.query(
        "SELECT post_id, (SELECT url_slug FROM posts WHERE id = comments.post_id) as url_slug FROM comments WHERE id = $1",
        [commentId]
      );

      const postId = postQuery.rows[0]?.post_id;
      const urlSlug = postQuery.rows[0]?.url_slug;

      if (!postId || !urlSlug) {
        console.warn(
          `댓글 ${commentId}에 대한 게시글 정보를 찾을 수 없습니다.`
        );
        return null;
      }

      // 중복 알림 방지 (10분 내 같은 댓글에 대한 좋아요 알림 방지)
      const isDuplicateAllowed = await this.preventDuplicateNotification(
        "comment_like",
        senderId,
        receiverId,
        postId,
        commentId,
        0.167 // 10분 = 1/6 시간
      );

      if (!isDuplicateAllowed) {
        console.log(`중복 알림 방지: 댓글 ${commentId} 좋아요 알림 생략`);
        return null;
      }

      return this.createCommentLikeNotification(
        senderId,
        receiverId,
        postId,
        commentId,
        urlSlug
      );
    } catch (error) {
      console.error("댓글 좋아요 알림 생성 중 오류:", error);
      throw error;
    }
  }

  /**
   * 중복 알림 방지 검사
   * @param {string} type - 알림 타입
   * @param {number} senderId - 발신자 ID
   * @param {number} receiverId - 수신자 ID
   * @param {number|null} postId - 게시글 ID
   * @param {number|null} commentId - 댓글 ID
   * @param {number} hours - 중복 체크 시간 (기본 1시간)
   * @returns {Promise<boolean>} 중복이 아니면 true, 중복이면 false
   */
  async preventDuplicateNotification(
    type,
    senderId,
    receiverId,
    postId = null,
    commentId = null,
    hours = 1
  ) {
    try {
      const existing = await this.client.query(
        `
        SELECT id FROM notifications 
        WHERE type = $1 AND sender_id = $2 AND receiver_id = $3 
          AND COALESCE(post_id, 0) = COALESCE($4, 0)
          AND COALESCE(comment_id, 0) = COALESCE($5, 0)
          AND created_at > NOW() - INTERVAL '${hours} hours'
      `,
        [type, senderId, receiverId, postId, commentId]
      );

      return existing.rowCount === 0;
    } catch (error) {
      console.error("중복 알림 검사 중 오류:", error);
      return true; // 오류 시 알림 생성 허용
    }
  }

  /**
   * 댓글 작성 시 모든 관련 알림을 생성하는 통합 메소드
   * @param {Object} params - 댓글 알림 생성 파라미터
   * @param {number} params.senderId - 댓글 작성자 ID
   * @param {number} params.postId - 게시글 ID
   * @param {number} params.commentId - 댓글 ID
   * @param {number|null} params.parentId - 부모 댓글 ID (대댓글인 경우)
   * @param {number[]} params.mentionedUserIds - 멘션된 사용자 ID 배열
   * @param {string} params.urlSlug - 게시판 URL 슬러그
   * @returns {Promise<number>} 생성된 알림 수
   */
  async createCommentNotifications({
    senderId,
    postId,
    commentId,
    parentId = null,
    mentionedUserIds = [],
    urlSlug,
  }) {
    const notificationsToCreate = [];
    const alreadyNotified = new Set(); // 중복 방지용

    try {
      // 1. 멘션된 유저에게 알림
      for (const mentionedUserId of mentionedUserIds) {
        if (mentionedUserId !== senderId) {
          notificationsToCreate.push({
            type: "mention",
            senderId,
            receiverId: mentionedUserId,
            postId,
            commentId,
            urlSlug,
          });
          alreadyNotified.add(mentionedUserId);
        }
      }

      // 2. 게시글 작성자에게 댓글 알림 (최상위 댓글인 경우)
      if (!parentId) {
        const postAuthorResult = await this.client.query(
          "SELECT user_id FROM posts WHERE id = $1",
          [postId]
        );

        if (postAuthorResult.rows.length > 0) {
          const postAuthorId = postAuthorResult.rows[0].user_id;
          if (postAuthorId !== senderId && !alreadyNotified.has(postAuthorId)) {
            notificationsToCreate.push({
              type: "comment",
              senderId,
              receiverId: postAuthorId,
              postId,
              commentId,
              urlSlug,
            });
            alreadyNotified.add(postAuthorId);
          }
        }
      }

      // 3. 부모 댓글 작성자에게 대댓글 알림 (대댓글인 경우)
      if (parentId) {
        const parentCommentResult = await this.client.query(
          "SELECT user_id FROM comments WHERE id = $1",
          [parentId]
        );

        if (parentCommentResult.rows.length > 0) {
          const parentCommentAuthorId = parentCommentResult.rows[0].user_id;
          if (
            parentCommentAuthorId !== senderId &&
            !alreadyNotified.has(parentCommentAuthorId)
          ) {
            notificationsToCreate.push({
              type: "reply",
              senderId,
              receiverId: parentCommentAuthorId,
              postId,
              commentId,
              urlSlug,
            });
            alreadyNotified.add(parentCommentAuthorId);
          }
        }

        // 4. 게시글 작성자에게도 대댓글 알림 (게시글 작성자가 부모 댓글 작성자와 다른 경우)
        const postAuthorResult = await this.client.query(
          "SELECT user_id FROM posts WHERE id = $1",
          [postId]
        );

        if (postAuthorResult.rows.length > 0) {
          const postAuthorId = postAuthorResult.rows[0].user_id;

          if (postAuthorId !== senderId && !alreadyNotified.has(postAuthorId)) {
            notificationsToCreate.push({
              type: "comment",
              senderId,
              receiverId: postAuthorId,
              postId,
              commentId,
              urlSlug,
            });
            alreadyNotified.add(postAuthorId);
          }
        }
      }

      // 5. 게시글에 좋아요를 누른 유저들에게 알림
      const postLikersResult = await this.client.query(
        "SELECT user_id FROM post_actions WHERE post_id = $1 AND action_type = $2",
        [postId, "like"]
      );

      for (const liker of postLikersResult.rows) {
        const likerId = liker.user_id;
        if (likerId !== senderId && !alreadyNotified.has(likerId)) {
          notificationsToCreate.push({
            type: "liked_post_comment",
            senderId,
            receiverId: likerId,
            postId,
            commentId,
            urlSlug,
          });
          alreadyNotified.add(likerId);
        }
      }

      // 6. 부모 댓글에 좋아요를 누른 유저들에게 알림 (대댓글인 경우)
      if (parentId) {
        const commentLikersResult = await this.client.query(
          "SELECT user_id FROM comment_actions WHERE comment_id = $1 AND action_type = $2",
          [parentId, "like"]
        );

        for (const liker of commentLikersResult.rows) {
          const likerId = liker.user_id;
          if (likerId !== senderId && !alreadyNotified.has(likerId)) {
            notificationsToCreate.push({
              type: "liked_comment_reply",
              senderId,
              receiverId: likerId,
              postId,
              commentId,
              urlSlug,
            });
            alreadyNotified.add(likerId);
          }
        }
      }

      // 알림 일괄 생성
      for (const notification of notificationsToCreate) {
        await this.createNotification({
          type: notification.type,
          senderId: notification.senderId,
          receiverId: notification.receiverId,
          postId: notification.postId,
          commentId: notification.commentId,
          urlSlug: notification.urlSlug,
        });
      }

      return notificationsToCreate.length;
    } catch (error) {
      console.error("댓글 알림 생성 중 오류:", error);
      throw error;
    }
  }
}

/**
 * NotificationService 인스턴스 생성 헬퍼 함수
 * @param {Object} client - 데이터베이스 클라이언트
 * @returns {NotificationService} NotificationService 인스턴스
 */
export function createNotificationService(client) {
  return new NotificationService(client);
}
