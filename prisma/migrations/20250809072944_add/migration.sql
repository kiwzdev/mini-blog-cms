-- DropIndex
DROP INDEX "blog_likes_blogId_userId_key";

-- CreateIndex
CREATE INDEX "blog_like_blog_idx" ON "blog_likes"("blogId");

-- CreateIndex
CREATE INDEX "blog_list_idx" ON "blogs"("published", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "blog_author_idx" ON "blogs"("authorId", "published", "createdAt" DESC);
