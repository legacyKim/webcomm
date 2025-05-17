"use client";

import { useEffect, useState } from 'react';
import { EditorContent, useEditor } from '@tiptap/react';
import { StarterKit } from '@tiptap/starter-kit';
import { Image } from '@tiptap/extension-image';
import { ImageWithBlob } from '../type/type';

const Editor = ({ editorContent, setEditorContent, imageFiles, setImageFiles }: {
    editorContent: string;
    setEditorContent: React.Dispatch<React.SetStateAction<string>>
    imageFiles: ImageWithBlob[];
    setImageFiles: React.Dispatch<React.SetStateAction<ImageWithBlob[]>>; 
}) => {

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
        if (!file || !editor) return;

        const blobUrl = URL.createObjectURL(file);
        editor.commands.insertContent(`<img src="${blobUrl}" />`);
        setImageFiles(prev => [...prev, { file, blobUrl }]);

    };

    const insertVideo = () => {
        const videoUrl = prompt('동영상 URL을 입력하세요 (예: YouTube, Vimeo 링크)');
        if (videoUrl) {
            const iframe = `<iframe src="${videoUrl}" width="560" height="315" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`;
            editor?.commands.insertContent(iframe);
        }
    };

    useEffect(() => {
        if (!editor) return;

        editor.on('update', () => {
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
        <div>
            <input type="file" onChange={uploadImage} />
            <button onClick={insertVideo}>동영상 삽입</button>
            <EditorContent editor={editor} />
        </div>
    );
};

export default Editor;
