"use client";

import { useEffect, useState } from 'react';
import { EditorContent, useEditor } from '@tiptap/react';
import { StarterKit } from '@tiptap/starter-kit';
import { Image } from '@tiptap/extension-image';

const Editor = ({ editorContent, setEditorContent }: { editorContent: string; setEditorContent: React.Dispatch<React.SetStateAction<string>> }) => {

    const editor = useEditor({
        extensions: [
            StarterKit,
            Image.configure({
                inline: true,
                allowBase64: true,
            }),
        ],
        content: '',
    });

    const uploadImage = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = () => {
                const base64Image = reader.result as string;
                editor?.commands.insertContent(`<img src="${base64Image}" />`);
            };
            reader.readAsDataURL(file);
        }
    };

    const insertVideo = () => {
        const videoUrl = prompt('동영상 URL을 입력하세요 (예: YouTube, Vimeo 링크)');
        if (videoUrl) {
            const iframe = `<iframe src="${videoUrl}" width="560" height="315" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`;
            editor?.commands.insertContent(iframe);
        }
    };

    useEffect(() => {
        if (editor) {
            editor.on('update', () => {
                setEditorContent(editor.getHTML());
            });
        }

        if (editor && editorContent) {
            editor.commands.setContent(editorContent); // editorContent가 변경될 때 에디터 내용 업데이트
        }

        return () => {
            if (editor) {
                editor.off('update');
            }
        };
    }, [editor, setEditorContent]);

    return (
        <div>
            <input type="file" onChange={uploadImage} />
            <button onClick={insertVideo}>동영상 삽입</button>
            <EditorContent editor={editor} />
        </div>
    );
};

export default Editor;
