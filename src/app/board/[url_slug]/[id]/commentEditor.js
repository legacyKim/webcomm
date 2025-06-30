import { useEffect } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
// import Mention from "@tiptap/extension-mention";
import Mention from "./mention";

import tippy from "tippy.js";
import "tippy.js/dist/tippy.css";

export default function CommentEditor({ initialContent = "", onChange, onMentionUsersChange, users, reset }) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Mention.configure({
        HTMLAttributes: {
          class: "mention",
        },
        suggestion: {
          items: ({ query }) =>
            users.filter((item) => item.name.toLowerCase().startsWith(query.toLowerCase())).slice(0, 5),

          render: () => {
            let component;
            let popup;

            return {
              onStart: (props) => {
                component = document.createElement("div");
                component.classList.add("mention-dropdown");

                props.items.forEach((item) => {
                  const option = document.createElement("div");
                  option.className = "mention-option";
                  option.textContent = item.name;
                  option.addEventListener("click", () => {
                    props.command({ id: item.id, label: item.name });
                  });
                  component.appendChild(option);
                });

                popup = tippy("body", {
                  getReferenceClientRect: props.clientRect,
                  appendTo: () => document.body,
                  content: component,
                  showOnCreate: true,
                  interactive: true,
                  trigger: "manual",
                  placement: "bottom-start",
                })[0];
              },

              onUpdate(props) {
                while (component.firstChild) {
                  component.removeChild(component.firstChild);
                }

                props.items.forEach((item) => {
                  const option = document.createElement("div");
                  option.className = "mention-option";
                  option.textContent = item.name;
                  option.addEventListener("click", () => {
                    props.command({ id: item.id, label: item.name });
                  });
                  component.appendChild(option);
                });

                popup.setProps({
                  getReferenceClientRect: props.clientRect,
                });
              },

              onExit() {
                popup.destroy();
              },
            };
          },
        },
      }),
    ],
    content: initialContent,

    onUpdate({ editor }) {
      if (onChange) {
        onChange(editor.getHTML());

        // 여기에서 mention 유저 추출
        const json = editor.getJSON();
        const mentionedUserIds = new Set();

        const extractMentions = (node) => {
          if (node.type === "mention" && node.attrs?.id) {
            mentionedUserIds.add(node.attrs.id);
          }
          if (node.content) {
            node.content.forEach(extractMentions);
          }
        };

        extractMentions(json);

        // 상위에서 넘겨받은 setMentionUsers로 전달
        if (onMentionUsersChange) {
          onMentionUsersChange(Array.from(mentionedUserIds));
        }
      }
    },

    editorProps: {},
  });

  useEffect(() => {
    if (editor && reset) {
      editor.commands.setContent("");
    }
  }, [reset, editor]);

  return <EditorContent editor={editor} />;
}
