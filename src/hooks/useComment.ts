// hooks/useComment.ts
import {
  createPostComment,
  deletePostComment,
  editPostComment,
  getPostComments,
} from "@/api/comment";
import { IComment } from "@/types/blog";
import { useState, useCallback } from "react";

export interface UseCommentOptions {
  initialComments?: IComment[];
  onError?: (error: string) => void;
}

export function useComment(postId: string, options: UseCommentOptions = {}) {
  const [comments, setComments] = useState<IComment[]>(
    options.initialComments || []
  );
  const [newComment, setNewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // ดึงคอมเม้นต์ทั้งหมด
  const fetchComments = useCallback(async () => {
    if (!postId) return;

    setIsLoading(true);
    try {
      const response = await getPostComments(postId);

      if (response.success) {
        setComments(response.data);
      } else {
        throw new Error(response.error?.message || "Failed to fetch comments");
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Error fetching comments";
      console.error("Error fetching comments:", error);
      options.onError?.(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [postId, options]);

  // เพิ่มคอมเม้นต์ใหม่
  const submitComment = useCallback(async () => {
    if (!newComment.trim() || isSubmitting || !postId) return;

    setIsSubmitting(true);
    try {
      const response = await createPostComment(postId, newComment);

      if (response.success) {
        // เพิ่มคอมเม้นต์ใหม่ที่ด้านบน
        setComments((prev) => [response.data, ...prev]);
        setNewComment("");
      } else {
        throw new Error(response.error?.message || "Failed to add comment");
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Error adding comment";
      console.error("Error submitting comment:", error);
      options.onError?.(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  }, [newComment, isSubmitting, postId, options]);

  // ลบคอมเม้นต์
  const deleteComment = useCallback(
    async (commentId: string) => {
      try {
        const response = await deletePostComment(postId, commentId);

        if (response.success) {
          setComments((prev) =>
            prev.filter((comment) => comment.id !== commentId)
          );
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
      }
    },
    [postId, options]
  );

  // อัพเดตคอมเม้นต์
  const updateComment = useCallback(
    async (commentId: string, content: string) => {
      try {
        const response = await editPostComment(postId, commentId, content);

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
      }
    },
    [postId, options]
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
