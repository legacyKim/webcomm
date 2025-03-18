import pool from "./db";

async function setupTriggers() {
    const client = await pool.connect();
    try {
        await client.query(`
            CREATE OR REPLACE FUNCTION notify_comment_change() RETURNS TRIGGER AS $$
            BEGIN
              PERFORM pg_notify('comment_events', json_build_object(
                'id', NEW.id,
                'post_id', NEW.post_id,
                'user_id', NEW.user_id,
                'parent_id', NEW.parent_id,
                'content', NEW.content,
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
        `);
    } catch (error) {
        console.error("트리거 설정 실패:", error);
    } finally {
        client.release();
    }
}

setupTriggers();