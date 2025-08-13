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
    content: content || "",
    editable: false,
    immediatelyRender: false,
  });

  // content가 없으면 로딩 표시
  if (!content) {
    return <div className="loading-message">콘텐츠 로딩 중...</div>;
  }

  if (!editor) return <div className="loading-message">에디터 로딩 중...</div>;

  return <EditorContent editor={editor} />;
};

export default TiptapViewer;
