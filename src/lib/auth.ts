export function isOwner(authorId?: string, userId?: string) {
  return authorId === userId;
}
