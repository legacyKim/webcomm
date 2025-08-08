import { Node } from "@tiptap/core";
import Suggestion from "@tiptap/suggestion";

const Mention = Node.create({
  name: "mention",

  group: "inline",
  inline: true,
  selectable: false,
  atom: true,

  addAttributes() {
    return {
      id: {
        default: null,
        parseHTML: (element) => element.getAttribute("data-id"),
        renderHTML: (attributes) => {
          if (!attributes.id) {
            return {};
          }
          return {
            "data-id": attributes.id,
          };
        },
      },
      label: {
        default: null,
        parseHTML: (element) => element.getAttribute("data-label"),
        renderHTML: (attributes) => {
          if (!attributes.label) {
            return {};
          }
          return {
            "data-label": attributes.label,
          };
        },
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: "span[data-mention]",
      },
    ];
  },

  renderHTML({ node, HTMLAttributes }) {
    return [
      "span",
      { "data-mention": "", ...HTMLAttributes, class: "mention" },
      `@${node.attrs.label}`,
    ];
  },

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
                type: this.name,
                attrs: props,
              },
              {
                type: "text",
                text: " ",
              },
            ])
            .run();
        },
        allow: () => {
          return true;
        },
        items: ({ query }) => {
          return users
            .filter((user) =>
              user.name.toLowerCase().startsWith(query.toLowerCase())
            )
            .slice(0, 5);
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
});

export default Mention;
