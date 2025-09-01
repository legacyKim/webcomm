"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import { StarterKit } from "@tiptap/starter-kit";
import { Highlight } from "@tiptap/extension-highlight";
import { TextAlign } from "@tiptap/extension-text-align";
import { Underline } from "@tiptap/extension-underline";
import { CustomTextStyle } from "@/extensions/CustomTextStyle";

import {
  BoldIcon,
  ItalicIcon,
  UnderlineIcon,
  PaintBrushIcon,
  Bars3BottomLeftIcon,
  Bars3BottomRightIcon,
} from "@heroicons/react/24/outline";
import Bars3BottomCenterIcon from "@/components/icons/Bars3BottomCenterIcon";

interface TiptapEditorProps {
  content: string;
  onChange: (content: string) => void;
}

export default function TiptapEditor({ content, onChange }: TiptapEditorProps) {
  const editor = useEditor({
    extensions: [
      CustomTextStyle,
      Highlight,
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      Underline,
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3, 4, 5, 6],
        },
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: "admin-editor-content",
      },
    },
  });

  if (!editor) {
    return null;
  }

  return (
    <div className="admin-tiptap-editor">
      {/* 툴바 */}
      <div className="editor-toolbar">
        {/* 헤딩 */}
        <select
          onChange={(e) => {
            const level = parseInt(e.target.value);
            if (level === 0) {
              editor.chain().focus().setParagraph().run();
            } else {
              editor
                .chain()
                .focus()
                .toggleHeading({ level: level as 1 | 2 | 3 | 4 | 5 | 6 })
                .run();
            }
          }}
        >
          <option value="0">본문</option>
          <option value="1">제목 1</option>
          <option value="2">제목 2</option>
          <option value="3">제목 3</option>
        </select>

        {/* 굵기 */}
        <button
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={editor.isActive("bold") ? "is-active" : ""}
        >
          <BoldIcon className="icon" />
        </button>

        {/* 이탤릭 */}
        <button
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={editor.isActive("italic") ? "is-active" : ""}
        >
          <ItalicIcon className="icon" />
        </button>

        {/* 밑줄 */}
        <button
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={editor.isActive("underline") ? "is-active" : ""}
        >
          <UnderlineIcon className="icon" />
        </button>

        {/* 하이라이트 */}
        <button
          onClick={() => editor.chain().focus().toggleHighlight().run()}
          className={editor.isActive("highlight") ? "is-active" : ""}
        >
          <PaintBrushIcon className="icon" />
        </button>

        {/* 텍스트 정렬 */}
        <button
          onClick={() => editor.chain().focus().setTextAlign("left").run()}
          className={editor.isActive({ textAlign: "left" }) ? "is-active" : ""}
        >
          <Bars3BottomLeftIcon className="icon" />
        </button>

        <button
          onClick={() => editor.chain().focus().setTextAlign("center").run()}
          className={
            editor.isActive({ textAlign: "center" }) ? "is-active" : ""
          }
        >
          <Bars3BottomCenterIcon className="icon" />
        </button>

        <button
          onClick={() => editor.chain().focus().setTextAlign("right").run()}
          className={editor.isActive({ textAlign: "right" }) ? "is-active" : ""}
        >
          <Bars3BottomRightIcon className="icon" />
        </button>

        {/* 리스트 */}
        <button
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={editor.isActive("bulletList") ? "is-active" : ""}
        >
          • 목록
        </button>

        <button
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={editor.isActive("orderedList") ? "is-active" : ""}
        >
          1. 목록
        </button>
      </div>

      {/* 에디터 콘텐츠 */}
      <EditorContent className="admin_editor_wrap" editor={editor} />
    </div>
  );
}
