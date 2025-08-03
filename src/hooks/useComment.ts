// hooks/useComment.ts
import {
  createBlogComment,
  deleteBlogComment,
  editBlogComment,
  getBlogComments,
} from "@/api/comment";
import { IComment } from "@/types/blog";
import { useState, useCallback } from "react";
import toast from "react-hot-toast";

export interface UseCommentOptions {
  initialComments?: IComment[];
  onError?: (error: string) => void;
}

export function useComment(blogId: string, options: UseCommentOptions = {}) {
  const [comments, setComments] = useState<IComment[]>(
    options.initialComments || []
  );
  const [newComment, setNewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // ดึงคอมเม้นต์ทั้งหมด
  const fetchComments = useCallback(async () => {
    if (!blogId) return;

    setIsLoading(true);
    try {
      const response = await getBlogComments(blogId);

      if (response.success) {
        setComments(response.data);
        return true;
      } else {
        throw new Error(response.error?.message || "Failed to fetch comments");
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Error fetching comments";
      console.error("Error fetching comments:", error);
      options.onError?.(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [blogId, options]);

  // เพิ่มคอมเม้นต์ใหม่
  const submitComment = useCallback(async () => {
    if (!newComment.trim() || isSubmitting || !blogId) return;

    setIsSubmitting(true);
    try {
      const response = await createBlogComment(blogId, newComment);

      if (response.success) {
        // เพิ่มคอมเม้นต์ใหม่ที่ด้านบน
        setComments((prev) => [response.data, ...prev]);
        setNewComment("");
        toast.success("Add comment successfully!");
        return true;
      } else {
        throw new Error(response.error?.message || "Failed to add comment");
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Error adding comment";
      console.error("Error submitting comment:", error);
      options.onError?.(errorMessage);
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, [newComment, isSubmitting, blogId, options]);

  // ลบคอมเม้นต์
  const deleteComment = useCallback(
    async (commentId: string) => {
      try {
        const response = await deleteBlogComment(blogId, commentId);

        if (response.success) {
          setComments((prev) =>
            prev.filter((comment) => comment.id !== commentId)
          );
          toast.success("Delete comment successfully!");
          return true;
        } else {
          throw new Error(
            response.error?.message || "Failed to delete comment"
          );
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Error deleting comment";
        console.error("Error deleting comment:", error);
        options.onError?.(errorMessage);
        return false;
      }
    },
    [blogId, options]
  );

  // อัพเดตคอมเม้นต์
  const updateComment = useCallback(
    async (commentId: string, content: string) => {
      try {
        const response = await editBlogComment(blogId, commentId, content);

        if (response.success) {
          setComments((prev) =>
            prev.map((comment) =>
              comment.id === commentId
                ? {
                    ...comment,
                    content: response.data.content,
                    updatedAt: response.data.updatedAt,
                  }
                : comment
            )
          );
        toast.success("Update comment successfully!");
          return true;
        } else {
          throw new Error(
            response.error?.message || "Failed to update comment"
          );
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Error updating comment";
        console.error("Error updating comment:", error);
        options.onError?.(errorMessage);
        return false;
      }
    },
    [blogId, options]
  );

  return {
    // State
    comments,
    newComment,
    isSubmitting,
    isLoading,
    commentCount: comments.length,

    // Actions
    setNewComment,
    submitComment,
    fetchComments,
    deleteComment,
    updateComment,
  };
}
