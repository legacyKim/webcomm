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
  placeholder?: string;
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
    <div className='admin-tiptap-editor'>
      {/* 툴바 */}
      <div
        className='editor-toolbar'
        style={{
          display: "flex",
          gap: "8px",
          padding: "12px",
          borderBottom: "1px solid #e0e0e0",
          backgroundColor: "#f9f9f9",
        }}>
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
          style={{ padding: "4px", borderRadius: "4px", border: "1px solid #ccc" }}>
          <option value='0'>본문</option>
          <option value='1'>제목 1</option>
          <option value='2'>제목 2</option>
          <option value='3'>제목 3</option>
        </select>

        {/* 굵기 */}
        <button
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={editor.isActive("bold") ? "is-active" : ""}
          style={{
            padding: "6px",
            border: "1px solid #ccc",
            borderRadius: "4px",
            backgroundColor: editor.isActive("bold") ? "#007bff" : "white",
            color: editor.isActive("bold") ? "white" : "black",
          }}>
          <BoldIcon className='w-4 h-4' />
        </button>

        {/* 이탤릭 */}
        <button
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={editor.isActive("italic") ? "is-active" : ""}
          style={{
            padding: "6px",
            border: "1px solid #ccc",
            borderRadius: "4px",
            backgroundColor: editor.isActive("italic") ? "#007bff" : "white",
            color: editor.isActive("italic") ? "white" : "black",
          }}>
          <ItalicIcon className='w-4 h-4' />
        </button>

        {/* 밑줄 */}
        <button
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={editor.isActive("underline") ? "is-active" : ""}
          style={{
            padding: "6px",
            border: "1px solid #ccc",
            borderRadius: "4px",
            backgroundColor: editor.isActive("underline") ? "#007bff" : "white",
            color: editor.isActive("underline") ? "white" : "black",
          }}>
          <UnderlineIcon className='w-4 h-4' />
        </button>

        {/* 하이라이트 */}
        <button
          onClick={() => editor.chain().focus().toggleHighlight().run()}
          className={editor.isActive("highlight") ? "is-active" : ""}
          style={{
            padding: "6px",
            border: "1px solid #ccc",
            borderRadius: "4px",
            backgroundColor: editor.isActive("highlight") ? "#007bff" : "white",
            color: editor.isActive("highlight") ? "white" : "black",
          }}>
          <PaintBrushIcon className='w-4 h-4' />
        </button>

        {/* 텍스트 정렬 */}
        <button
          onClick={() => editor.chain().focus().setTextAlign("left").run()}
          className={editor.isActive({ textAlign: "left" }) ? "is-active" : ""}
          style={{
            padding: "6px",
            border: "1px solid #ccc",
            borderRadius: "4px",
            backgroundColor: editor.isActive({ textAlign: "left" }) ? "#007bff" : "white",
            color: editor.isActive({ textAlign: "left" }) ? "white" : "black",
          }}>
          <Bars3BottomLeftIcon className='w-4 h-4' />
        </button>

        <button
          onClick={() => editor.chain().focus().setTextAlign("center").run()}
          className={editor.isActive({ textAlign: "center" }) ? "is-active" : ""}
          style={{
            padding: "6px",
            border: "1px solid #ccc",
            borderRadius: "4px",
            backgroundColor: editor.isActive({ textAlign: "center" }) ? "#007bff" : "white",
            color: editor.isActive({ textAlign: "center" }) ? "white" : "black",
          }}>
          <Bars3BottomCenterIcon className='w-4 h-4' />
        </button>

        <button
          onClick={() => editor.chain().focus().setTextAlign("right").run()}
          className={editor.isActive({ textAlign: "right" }) ? "is-active" : ""}
          style={{
            padding: "6px",
            border: "1px solid #ccc",
            borderRadius: "4px",
            backgroundColor: editor.isActive({ textAlign: "right" }) ? "#007bff" : "white",
            color: editor.isActive({ textAlign: "right" }) ? "white" : "black",
          }}>
          <Bars3BottomRightIcon className='w-4 h-4' />
        </button>

        {/* 리스트 */}
        <button
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={editor.isActive("bulletList") ? "is-active" : ""}
          style={{
            padding: "6px",
            border: "1px solid #ccc",
            borderRadius: "4px",
            backgroundColor: editor.isActive("bulletList") ? "#007bff" : "white",
            color: editor.isActive("bulletList") ? "white" : "black",
          }}>
          • 목록
        </button>

        <button
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={editor.isActive("orderedList") ? "is-active" : ""}
          style={{
            padding: "6px",
            border: "1px solid #ccc",
            borderRadius: "4px",
            backgroundColor: editor.isActive("orderedList") ? "#007bff" : "white",
            color: editor.isActive("orderedList") ? "white" : "black",
          }}>
          1. 목록
        </button>
      </div>

      {/* 에디터 콘텐츠 */}
      <EditorContent
        editor={editor}
        style={{
          minHeight: "400px",
          padding: "16px",
          border: "1px solid #e0e0e0",
          borderTop: "none",
          borderRadius: "0 0 8px 8px",
        }}
      />

      <style jsx>{`
        .admin-tiptap-editor .ProseMirror {
          outline: none;
          min-height: 400px;
        }

        .admin-tiptap-editor .ProseMirror h1 {
          font-size: 2rem;
          font-weight: bold;
          margin: 1rem 0;
        }

        .admin-tiptap-editor .ProseMirror h2 {
          font-size: 1.5rem;
          font-weight: bold;
          margin: 0.8rem 0;
        }

        .admin-tiptap-editor .ProseMirror h3 {
          font-size: 1.3rem;
          font-weight: bold;
          margin: 0.6rem 0;
        }

        .admin-tiptap-editor .ProseMirror p {
          margin: 0.5rem 0;
          line-height: 1.6;
        }

        .admin-tiptap-editor .ProseMirror ul,
        ol {
          padding-left: 1.5rem;
          margin: 0.5rem 0;
        }

        .admin-tiptap-editor .ProseMirror li {
          margin: 0.2rem 0;
        }

        .admin-tiptap-editor .ProseMirror mark {
          background-color: #ffeb3b;
          padding: 0.1rem 0.2rem;
          border-radius: 0.2rem;
        }
      `}</style>
    </div>
  );
}
