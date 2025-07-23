
*** sql 트리거 형성

// 댓글

CREATE OR REPLACE FUNCTION notify_comment_change() RETURNS TRIGGER AS $$
DECLARE
  profile_url TEXT;
  record_data JSON;
BEGIN
  -- INSERT, UPDATE의 경우
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    SELECT profile INTO profile_url FROM members WHERE id = NEW.user_id;
    
    record_data := json_build_object(
      'id', NEW.id,
      'post_id', NEW.post_id,
      'user_id', NEW.user_id,
      'user_nickname', NEW.user_nickname,
      'profile', profile_url,
      'parent_id', NEW.parent_id,
      'likes', NEW.likes,
      'content', NEW.content,
      'depth', NEW.depth,
      'created_at', NEW.created_at,
      'updated_at', NEW.updated_at,
      'event', TG_OP
    );
    
    PERFORM pg_notify('comment_events', record_data::text);
    RETURN NEW;
    
  -- DELETE의 경우
  ELSIF TG_OP = 'DELETE' THEN
    SELECT profile INTO profile_url FROM members WHERE id = OLD.user_id;
    
    record_data := json_build_object(
      'id', OLD.id,
      'post_id', OLD.post_id,
      'user_id', OLD.user_id,
      'user_nickname', OLD.user_nickname,
      'profile', profile_url,
      'parent_id', OLD.parent_id,
      'likes', OLD.likes,
      'content', OLD.content,
      'depth', OLD.depth,
      'created_at', OLD.created_at,
      'updated_at', OLD.updated_at,
      'event', TG_OP
    );
    
    PERFORM pg_notify('comment_events', record_data::text);
    RETURN OLD;
  END IF;
  
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- 트리거 재생성
CREATE TRIGGER comment_trigger
AFTER INSERT OR DELETE OR UPDATE ON comments
FOR EACH ROW
EXECUTE FUNCTION notify_comment_change();


// 게시물

CREATE OR REPLACE FUNCTION notify_post_change() RETURNS TRIGGER AS $$
BEGIN
  -- 트리거가 발생한 테이블의 이벤트를 JSON 형식으로 포맷팅하여 notify
  PERFORM pg_notify('post_events', json_build_object(
    'id', NEW.id,
    'board_name', NEW.board_name,
    'title', NEW.title,
    'content', NEW.content,
    'user_id', NEW.user_id,
    'user_nickname', NEW.user_nickname,
    'views', NEW.views,
    'likes', NEW.likes,
    'dislikes', NEW.dislikes,
    'reports', NEW.reports,
    'created_at', NEW.created_at,
    'updated_at', NEW.updated_at,
    'event', TG_OP  -- TG_OP는 트리거의 이벤트 종류(INSERT, UPDATE, DELETE)
  )::text);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER post_trigger
AFTER INSERT OR DELETE OR UPDATE ON posts
FOR EACH ROW
EXECUTE FUNCTION notify_post_change();


// 댓글 달릴 때 알림 저장

CREATE OR REPLACE FUNCTION insert_notification_for_comment()
RETURNS trigger AS $$
BEGIN
  -- 게시글의 작성자에게 댓글 알림 (자기자신은 제외)
  IF NEW.parent_id IS NULL THEN
    INSERT INTO notifications (type, sender_id, receiver_id, post_id, comment_id)
    SELECT 
      'comment',
      NEW.user_id,
      p.user_id,
      NEW.post_id,
      NEW.id
    FROM posts p
    WHERE p.id = NEW.post_id AND p.user_id != NEW.user_id;
  
  -- 대댓글일 경우 원댓글 작성자에게 알림
  ELSE
    INSERT INTO notifications (type, sender_id, receiver_id, post_id, comment_id)
    SELECT
     'reply',
      NEW.user_id,
      c.user_id,
      NEW.post_id,
      NEW.id
    FROM comments c
    WHERE c.id = NEW.parent_id AND c.user_id != NEW.user_id;
    
    -- 대댓글의 경우 게시글 작성자에게도 알림 (댓글 작성자와 다른 경우에만)
    INSERT INTO notifications (type, sender_id, receiver_id, post_id, comment_id)
    SELECT
      'comment',
      NEW.user_id,
      p.user_id,
      NEW.post_id,
      NEW.id
    FROM posts p, comments c
    WHERE p.id = NEW.post_id 
      AND c.id = NEW.parent_id 
      AND p.user_id != NEW.user_id 
      AND p.user_id != c.user_id;
  END IF;

  PERFORM pg_notify('new_notification', 'new_comment');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_insert_notification_for_comment
AFTER INSERT ON comments
FOR EACH ROW
EXECUTE FUNCTION insert_notification_for_comment();


// 댓글 공감 알림

CREATE OR REPLACE FUNCTION insert_notification_for_comment_like()
RETURNS trigger AS $$
BEGIN
  IF NEW.action_type = 'like' THEN
    INSERT INTO notifications (type, sender_id, receiver_id, post_id, comment_id)
    SELECT
      'like_comment',
      NEW.user_id,
      c.user_id,
      c.post_id,
      c.id
    FROM comments c
    WHERE c.id = NEW.comment_id AND c.user_id != NEW.user_id;

    PERFORM pg_notify('new_notification', 'new_comment_like');
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_insert_notification_for_comment_like
AFTER INSERT ON comment_actions
FOR EACH ROW
WHEN (NEW.action_type = 'like')
EXECUTE FUNCTION insert_notification_for_comment_like();


// 게시글에 공감했을 때 알림

CREATE OR REPLACE FUNCTION insert_notification_for_post_like()
RETURNS trigger AS $$
BEGIN
  -- 게시글 작성자에게 알림, 단 자기 자신에게는 알림 생성 안 함
  IF NEW.action_type = 'like' THEN
    INSERT INTO notifications (type, sender_id, receiver_id, post_id)
    SELECT
      'post_like',
      NEW.user_id,
      p.user_id,
      p.id
    FROM posts p
    WHERE p.id = NEW.post_id AND p.user_id != NEW.user_id;

    PERFORM pg_notify('new_notification', 'new_post_like');
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_insert_notification_for_post_like
AFTER INSERT ON post_actions
FOR EACH ROW
WHEN (NEW.action_type = 'like')
EXECUTE FUNCTION insert_notification_for_post_like();


// 쪽지를 받을 때 알림

CREATE OR REPLACE FUNCTION insert_notification_for_message()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO notifications (type, sender_id, receiver_id)
  VALUES ('message', NEW.sender_id, NEW.receiver_id);
  
  PERFORM pg_notify('new_notification', 'new_message');

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_insert_notification_for_message
AFTER INSERT ON messages
FOR EACH ROW
EXECUTE FUNCTION insert_notification_for_message();
