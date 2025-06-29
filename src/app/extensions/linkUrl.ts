import { Node, mergeAttributes, CommandProps } from "@tiptap/core";

export const LinkUrl = Node.create({
  name: "iframe",
  group: "block",
  atom: true,

  addAttributes() {
    return {
      src: { default: null },
      width: { default: "560" },
      height: { default: "315" },
      frameborder: { default: "0" },
      allow: {
        default: "accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture",
      },
      allowfullscreen: { default: "true" },
    };
  },

  parseHTML() {
    return [{ tag: "iframe" }];
  },

  renderHTML({ HTMLAttributes }) {
    return ["iframe", mergeAttributes(HTMLAttributes)];
  },

  addCommands(): Partial<Record<string, (options: any) => (props: CommandProps) => boolean>> {
    return {
      setIframe:
        (options: {
          src: string;
          width?: string;
          height?: string;
          frameborder?: string;
          allow?: string;
          allowfullscreen?: string;
        }) =>
        ({ commands }: CommandProps) => {
          return commands.insertContent({
            type: this.name,
            attrs: {
              src: options.src,
              width: options.width ?? "560",
              height: options.height ?? "315",
              frameborder: options.frameborder ?? "0",
              allow: options.allow ?? "accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture",
              allowfullscreen: options.allowfullscreen ?? "true",
            },
          });
        },
    };
  },
});
