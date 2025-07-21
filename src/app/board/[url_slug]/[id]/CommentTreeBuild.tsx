import { CommentTreeNode } from "@/type/commentType";

export function CommentTreeBuild(comments: CommentTreeNode[]): CommentTreeNode[] {
  const commentMap: { [key: number]: CommentTreeNode } = {};
  const tree: CommentTreeNode[] = [];

  comments.forEach((comment) => {
    commentMap[comment.id] = { ...comment, children: [] };
  });

  comments.forEach((comment) => {
    if (comment.parent_id === null) {
      tree.push(commentMap[comment.id]);
    } else {
      const parent = commentMap[comment.parent_id];
      if (parent) {
        parent.children.push(commentMap[comment.id]);
      }
    }
  });

  return tree;
}
