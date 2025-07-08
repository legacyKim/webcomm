// extensions/CustomTextStyle.ts

import TextStyle from "@tiptap/extension-text-style";
import { Editor, Mark, mergeAttributes } from "@tiptap/core";

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    customTextStyle: {
      setFontSize: (fontSize: string) => ReturnType;
      setColor: (color: string) => ReturnType;
    };
  }
}

export const CustomTextStyle = TextStyle.extend({
  name: "customTextStyle",

  addAttributes() {
    return {
      fontSize: {
        default: null,
        parseHTML: (element) => {
          const style = element.getAttribute("style");
          const match = style?.match(/font-size:\s*([^;]+)/);
          return match ? match[1] : null;
        },
        renderHTML: (attributes) => {
          if (!attributes.fontSize) return {};
          return { style: `font-size: ${attributes.fontSize}` };
        },
      },
      color: {
        default: null,
        parseHTML: (element) => {
          const style = element.getAttribute("style");
          const match = style?.match(/color:\s*([^;]+)/);
          return match ? match[1] : null;
        },
        renderHTML: (attributes) => {
          if (!attributes.color) return {};
          return { style: `color: ${attributes.color}` };
        },
      },
    };
  },

  renderHTML({ HTMLAttributes }) {
    const style = [];

    if (HTMLAttributes.fontSize) style.push(`font-size: ${HTMLAttributes.fontSize}`);
    if (HTMLAttributes.color) style.push(`color: ${HTMLAttributes.color}`);

    return ["span", mergeAttributes({ style: style.join("; ") }, HTMLAttributes), 0];
  },

  addCommands() {
    return {
      setFontSize:
        (fontSize: string) =>
        ({ chain }) =>
          chain().setMark("customTextStyle", { fontSize }).run(),

      setColor:
        (color: string) =>
        ({ chain }) =>
          chain().setMark("customTextStyle", { color }).run(),
    };
  },
});
