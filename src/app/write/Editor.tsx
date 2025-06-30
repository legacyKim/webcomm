"use client";

import { useEffect } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import { StarterKit } from "@tiptap/starter-kit";
import { Image } from "@tiptap/extension-image";
import { Video } from "@/extensions/video";
import { LinkUrl } from "@/extensions/linkUrl";
import { ImageWithBlob, VideoWithBlob } from "@/type/type";

import { PhotoIcon, PaperClipIcon, VideoCameraIcon } from "@heroicons/react/24/outline";

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
    console.log(rawUrl);
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

  return (
    <div className='write_wrap'>
      <EditorContent className='write_box' editor={editor} />

      <div className='upload'>
        {/* 이미지 업로드 */}
        <label htmlFor='image-upload' style={{ cursor: "pointer", marginRight: "10px" }}>
          <PhotoIcon className='icon' />
        </label>
        <input id='image-upload' type='file' accept='image/*' onChange={uploadImage} style={{ display: "none" }} />

        {/* 비디오 업로드 */}
        <label htmlFor='video-upload' style={{ cursor: "pointer", marginRight: "10px" }}>
          <VideoCameraIcon className='icon' />
        </label>
        <input id='video-upload' type='file' accept='video/*' onChange={uploadVideo} style={{ display: "none" }} />

        {/* URL 링크 추가 */}
        <button type='button' onClick={insertLink} style={{ marginRight: "10px" }}>
          <PaperClipIcon className='icon' />
        </button>
      </div>
    </div>
  );
};

export default Editor;
