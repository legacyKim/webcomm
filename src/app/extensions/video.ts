import { Node, CommandProps } from "@tiptap/core";

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    video: {
      setVideo: (options: { src: string; width?: string; type?: string }) => ReturnType;
    };
  }
}

export const Video = Node.create({
  name: "video",
  group: "block",
  selectable: true,
  atom: true,

  addAttributes() {
    return {
      src: { default: null },
      width: { default: "100%" },
      type: { default: "video/mp4" },
    };
  },

  parseHTML() {
    return [{ tag: "video" }];
  },

  renderHTML({ HTMLAttributes }) {
    return ["video", { ...HTMLAttributes, controls: true }];
  },

  addCommands() {
    return {
      setVideo:
        (options: { src: string; width?: string; type?: string }) =>
        ({ commands }: CommandProps) => {
          return commands.insertContent({
            type: this.name,
            attrs: {
              src: options.src,
              width: options.width || "100%",
              type: options.type || "video/mp4",
            },
          });
        },
    };
  },
});
