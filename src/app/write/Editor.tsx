"use client";

import { useState, useEffect } from "react";
import { EditorContent, useEditor } from "@tiptap/react";

import { StarterKit } from "@tiptap/starter-kit";
import { Image } from "@tiptap/extension-image";
import { Video } from "@/extensions/video";
import { LinkUrl } from "@/extensions/linkUrl";
import { CustomTextStyle } from "@/extensions/CustomTextStyle";

import Highlight from "@tiptap/extension-highlight";
import TextAlign from "@tiptap/extension-text-align";
import Underline from "@tiptap/extension-underline";

import { ImageWithBlob, VideoWithBlob } from "@/type/type";

import {
  PhotoIcon,
  PaperClipIcon,
  VideoCameraIcon,
  BoldIcon,
  ItalicIcon,
  UnderlineIcon,
  PaintBrushIcon,
  Bars3BottomLeftIcon,
  Bars3BottomRightIcon,
} from "@heroicons/react/24/outline";
import Bars3BottomCenterIcon from "@/components/icons/Bars3BottomCenterIcon";

const Editor = ({
  editorContent,
  setEditorContent,
  setImageFiles,
  setVideoFiles,
}: {
  editorContent: string;
  setEditorContent: React.Dispatch<React.SetStateAction<string>>;
  setImageFiles: React.Dispatch<React.SetStateAction<ImageWithBlob[]>>;
  setVideoFiles: React.Dispatch<React.SetStateAction<VideoWithBlob[]>>;
}) => {
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
    content: "",
  });

  // upload image
  const uploadImage = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !editor) return;

    if (file.size > 5 * 1024 * 1024) {
      alert("최대 5MB 이하의 이미지만 업로드 가능합니다.");
      return;
    }

    const blobUrl = URL.createObjectURL(file);
    editor.commands.insertContent(`<img src="${blobUrl}" />`);
    setImageFiles((prev) => [...prev, { file, blobUrl }]);
  };

  // upload video
  const uploadVideo = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !editor) return;

    const blobUrl = URL.createObjectURL(file);

    editor.commands.setVideo({
      src: blobUrl,
      width: "100%",
      type: file.type,
    });

    setVideoFiles((prev) => [...prev, { file, blobUrl }]);
  };

  // link url 연결
  const convertToEmbedUrl = (url: string): string => {
    const match = url.match(/(?:https?:\/\/)?(?:www\.)?youtube\.com\/watch\?v=([^&]+)/);
    if (match && match[1]) {
      return `https://www.youtube.com/embed/${match[1]}`;
    }

    const shortMatch = url.match(/(?:https?:\/\/)?youtu\.be\/([^?&]+)/);
    if (shortMatch && shortMatch[1]) {
      return `https://www.youtube.com/embed/${shortMatch[1]}`;
    }

    alert("유효한 유튜브 링크가 아닙니다.");
    return "";
  };

  const insertLink = () => {
    const rawUrl = prompt("유튜브 링크를 입력하세요");
    if (!rawUrl) {
      alert("URL을 입력해야 합니다.");
      return;
    }
    const embedUrl = convertToEmbedUrl(rawUrl);

    if (embedUrl) {
      const iframe = `<iframe src="${embedUrl}" width="560" height="315" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`;
      editor?.commands.insertContent(iframe);
    }
  };

  useEffect(() => {
    if (!editor) return;

    editor.on("update", () => {
      setEditorContent(editor.getHTML());
    });

    return () => {
      editor.destroy();
    };
  }, [editor]);

  // 글 수정일 경우
  useEffect(() => {
    if (editor && editorContent !== editor.getHTML()) {
      editor.commands.setContent(editorContent);
    }
  }, [editorContent, editor]);

  const [colorPick, setColorPick] = useState<string>("#000000");
  const [colorBoxOpen, setColorBoxOpen] = useState<boolean>(false);
  const colorOptions = ["#000000", "#ff0000", "#007bff", "#28a745", "#fd7e14", "#6f42c1", "#6c757d", "#e83e8c"];

  const [fontsizePick, setFontSizePick] = useState<string>("14px");
  const [fontsizeBoxOpen, setFontsizeBoxOpen] = useState<boolean>(false);
  const fontsizeOptions = ["12px", "14px", "16px", "18px", "24px"];

  return (
    <div className='write_wrap'>
      <EditorContent className='write_box' editor={editor} />

      <div className='toolbar'>
        <div className='editor_pick'>
          <div
            className='editor_fontsize_pick'
            onClick={() => {
              setFontsizeBoxOpen(!fontsizeBoxOpen);
              setColorBoxOpen(false);
            }}>
            {fontsizePick}
          </div>
          <div
            className={`editor_pick_box editor_pick_box_fs ${fontsizeBoxOpen ? "open" : ""}`}
            onClick={() => {
              setFontsizeBoxOpen(!fontsizeBoxOpen);
              setColorBoxOpen(false);
            }}>
            {fontsizeOptions.map((fontSize) => (
              <button
                key={fontSize}
                type='button'
                onClick={() => {
                  if (editor) editor.chain().focus().setFontSize(fontSize).run();
                  setFontSizePick(fontSize);
                }}
                style={{ fontSize: fontSize }}>
                {fontSize}
              </button>
            ))}
          </div>
        </div>

        <div className='editor_pick'>
          <div
            className='editor_color_pick'
            onClick={() => {
              setColorBoxOpen(!colorBoxOpen);
              setFontsizeBoxOpen(false);
            }}
            style={{ backgroundColor: colorPick }}></div>
          <div
            className={`editor_pick_box editor_pick_box_color ${colorBoxOpen ? "open" : ""}`}
            onClick={() => {
              setColorBoxOpen(!colorBoxOpen);
              setFontsizeBoxOpen(false);
            }}>
            {colorOptions.map((color) => (
              <button
                key={color}
                type='button'
                onClick={() => {
                  if (editor) editor.chain().focus().setColor(color).run();
                  setColorPick(color);
                }}>
                <div className='editor_color_pick' style={{ backgroundColor: color }} />
              </button>
            ))}
          </div>
        </div>

        <button
          type='button'
          onClick={() => {
            if (editor) {
              editor.chain().focus().toggleBold().run();
            }
          }}
          title='굵게'>
          <BoldIcon className='icon' />
        </button>
        <button
          type='button'
          onClick={() => {
            if (editor) editor.chain().focus().toggleItalic().run();
          }}
          title='기울임'>
          <ItalicIcon className='icon' />
        </button>
        <button
          type='button'
          onClick={() => {
            if (editor) editor.chain().focus().toggleUnderline().run();
          }}
          title='밑줄'>
          <UnderlineIcon className='icon' />
        </button>
        <button
          type='button'
          onClick={() => {
            if (editor) editor.chain().focus().toggleHighlight().run();
          }}
          title='글자 배경'>
          <PaintBrushIcon className='icon' />
        </button>

        <button
          type='button'
          onClick={() => {
            if (editor) editor.chain().focus().setTextAlign("center").run();
          }}
          title='중앙 정렬'>
          <Bars3BottomCenterIcon className='icon' />
        </button>
        <button
          type='button'
          onClick={() => {
            if (editor) editor.chain().focus().setTextAlign("left").run();
          }}
          title='왼쪽 정렬'>
          <Bars3BottomLeftIcon className='icon' />
        </button>
        <button
          type='button'
          onClick={() => {
            if (editor) editor.chain().focus().setTextAlign("right").run();
          }}
          title='오른쪽 정렬'>
          <Bars3BottomRightIcon className='icon' />
        </button>

        <div className='editor_bar'></div>

        {/* 이미지 업로드 */}
        <label htmlFor='image-upload' style={{ cursor: "pointer" }} title='이미지 업로드'>
          <PhotoIcon className='icon' />
        </label>
        <input id='image-upload' type='file' accept='image/*' onChange={uploadImage} style={{ display: "none" }} />

        {/* 비디오 업로드 */}
        <label htmlFor='video-upload' style={{ cursor: "pointer" }} title='비디오 업로드'>
          <VideoCameraIcon className='icon' />
        </label>
        <input id='video-upload' type='file' accept='video/*' onChange={uploadVideo} style={{ display: "none" }} />

        {/* URL 링크 추가 */}
        <button type='button' onClick={insertLink} title='URL 링크 추가'>
          <PaperClipIcon className='icon' />
        </button>
      </div>
    </div>
  );
};

export default Editor;
