
*** sql 트리거 형성

// 댓글

CREATE OR REPLACE FUNCTION notify_comment_change() RETURNS TRIGGER AS $$
BEGIN
  PERFORM pg_notify('comment_events', json_build_object(
    'id', COALESCE(NEW.id, OLD.id),  -- id가 NULL일 경우 OLD.id를 사용
    'post_id', NEW.post_id,
    'user_id', NEW.user_id,
    'user_nickname', NEW.user_nickname,
    'parent_id', NEW.parent_id,
    'likes', NEW.likes,
    'content', COALESCE(NEW.content, OLD.content), -- content가 NULL일 경우 OLD.content를 사용
    'created_at', NEW.created_at,
    'updated_at', NEW.updated_at,
    'event', TG_OP
  )::text);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

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