/*
  Warnings:

  - A unique constraint covering the columns `[blogId,userId]` on the table `blog_likes` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "blog_likes_blogId_userId_key" ON "blog_likes"("blogId", "userId");
