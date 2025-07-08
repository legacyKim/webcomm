import { useEffect } from "react";

import { EditorContent, useEditor } from "@tiptap/react";

import { StarterKit } from "@tiptap/starter-kit";
import { Image } from "@tiptap/extension-image";
import { Video } from "@/extensions/video";
import { LinkUrl } from "@/extensions/linkUrl";
import { CustomTextStyle } from "@/extensions/CustomTextStyle";

import TextStyle from "@tiptap/extension-text-style";
import Color from "@tiptap/extension-color";
import Highlight from "@tiptap/extension-highlight";
import TextAlign from "@tiptap/extension-text-align";
import Underline from "@tiptap/extension-underline";

// tiptap viewer
const TiptapViewer = ({ content }: { content: string }) => {
  console.log(content, "content in TiptapViewer");
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
  });

  if (!editor) return <p>로딩 중...</p>;

  return <EditorContent editor={editor} />;
};

export default TiptapViewer;
