/**
 * @typedef {Object} AppComment
 * @property {number} id
 * @property {number|null} parent_id
 * @property {number} user_id
 * @property {string} user_nickname
 * @property {string} content
 * @property {string} [profile]
 * @property {number} likes
 */

/**
 * @typedef {AppComment & { children: CommentTreeNode[] }} CommentTreeNode
 */

export default function CommentTreeBuild(comments) {
  const commentMap = {};
  const tree = [];

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
