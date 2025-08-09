import { EditorContent, useEditor } from "@tiptap/react";

import { StarterKit } from "@tiptap/starter-kit";
import { Image } from "@tiptap/extension-image";
import { Video } from "@/extensions/video";
import { LinkUrl } from "@/extensions/linkUrl";
import { CustomTextStyle } from "@/extensions/CustomTextStyle";

import Highlight from "@tiptap/extension-highlight";
import TextAlign from "@tiptap/extension-text-align";
import Underline from "@tiptap/extension-underline";

// tiptap viewer
const TiptapViewer = ({ content }: { content?: string }) => {
  // 콘텐츠 스켈레톤 컴포넌트
  const ContentSkeleton = () => (
    <div className="content_skeleton">
      <div className="skeleton_line content_line"></div>
      <div className="skeleton_line content_line short"></div>
      <div className="skeleton_line content_line"></div>
      <div className="skeleton_line content_line short"></div>
    </div>
  );

  // content가 없으면 스켈레톤 표시
  if (!content) {
    return <ContentSkeleton />;
  }

  const editor = useEditor({
    extensions: [
      CustomTextStyle,
      Highlight,
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      Underline,
      StarterKit,
      Image.configure({
        inline: true,
        allowBase64: true,
      }),
      Video,
      LinkUrl,
    ],
    content: content,
    editable: false,
    immediatelyRender: false,
  });

  if (!editor) return <ContentSkeleton />;

  return <EditorContent editor={editor} />;
};

export default TiptapViewer;
