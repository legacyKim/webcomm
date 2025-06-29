import { Extension } from "@tiptap/core";
import Suggestion from "@tiptap/suggestion";

const Mention = Extension.create({
  name: "mention",

  addOptions() {
    return {
      suggestion: {
        char: "@",
        startOfLine: false,
        command: ({ editor, range, props }) => {
          editor
            .chain()
            .focus()
            .insertContentAt(range, [
              {
                type: "mention",
                attrs: props,
              },
              {
                type: "text",
                text: " ",
              },
            ])
            .run();
        },
        allow: ({ state, range }) => {
          // 필요시 @ 가능 여부 커스텀
          return true;
        },
        items: ({ query }) => {
          // 쿼리값으로 사용자 리스트 필터링
          return users.filter((user) => user.name.toLowerCase().startsWith(query.toLowerCase())).slice(0, 5);
        },
      },
    };
  },

  addProseMirrorPlugins() {
    return [
      Suggestion({
        editor: this.editor,
        ...this.options.suggestion,
      }),
    ];
  },

  addNode() {
    return {
      name: "mention",
      inline: true,
      group: "inline",
      selectable: false,
      atom: true,
      attrs: {
        id: {},
        label: {},
      },
      parseHTML() {
        return [
          {
            tag: "span[data-mention]",
          },
        ];
      },
      renderHTML({ node, HTMLAttributes }) {
        return ["span", { "data-mention": "", ...HTMLAttributes, class: "mention" }, `@${node.attrs.label}`];
      },
    };
  },
});
