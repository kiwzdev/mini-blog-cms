// hooks/useComment.ts
import { useState, useCallback } from "react";
import toast from "react-hot-toast";
import { IComment } from "@/types/blog";
import {
  createBlogComment,
  deleteBlogComment,
  editBlogComment,
  getBlogComments,
  createUserComment,
  deleteUserComment,
  editUserComment,
  getUserComments,
} from "@/api/comment";

type CommentType = "blog" | "user";

interface CommentApiMap {
  blog: {
    create: typeof createBlogComment;
    delete: typeof deleteBlogComment;
    edit: typeof editBlogComment;
    get: typeof getBlogComments;
  };
  user: {
    create: typeof createUserComment;
    delete: typeof deleteUserComment;
    edit: typeof editUserComment;
    get: typeof getUserComments;
  };
}

const commentApiMap: CommentApiMap = {
  blog: {
    create: createBlogComment,
    delete: deleteBlogComment,
    edit: editBlogComment,
    get: getBlogComments,
  },
  user: {
    create: createUserComment,
    delete: deleteUserComment,
    edit: editUserComment,
    get: getUserComments,
  },
};

export interface UseCommentOptions {
  initialComments?: IComment[];
  onError?: (error: string) => void;
}

export function useComment(
  type: CommentType,
  targetId: string,
  options: UseCommentOptions = {}
) {
  const [comments, setComments] = useState<IComment[]>(
    options.initialComments || []
  );
  const [newComment, setNewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const api = commentApiMap[type];

  // ดึงคอมเม้นต์ทั้งหมด
  const fetchComments = useCallback(async () => {
    if (!targetId) return;

    setIsLoading(true);
    try {
      const response = await api.get(targetId);

      if (response.success) {
        setComments(response.data);
        return true;
      } else {
        throw new Error(response.error?.message || "Failed to fetch comments");
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Error fetching comments";
      console.error(`Error fetching ${type} comments:`, error);
      options.onError?.(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [targetId, api, type, options]);

  // เพิ่มคอมเม้นต์ใหม่
  const submitComment = useCallback(async () => {
    if (!newComment.trim() || isSubmitting || !targetId) return;

    setIsSubmitting(true);
    try {
      const response = await api.create(targetId, newComment);

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
      console.error(`Error submitting ${type} comment:`, error);
      options.onError?.(errorMessage);
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, [newComment, isSubmitting, targetId, api, type, options]);

  // ลบคอมเม้นต์
  const deleteComment = useCallback(
    async (commentId: string) => {
      try {
        const response = await api.delete(targetId, commentId);

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
        console.error(`Error deleting ${type} comment:`, error);
        options.onError?.(errorMessage);
        return false;
      }
    },
    [targetId, api, type, options]
  );

  // อัพเดตคอมเม้นต์
  const updateComment = useCallback(
    async (commentId: string, content: string) => {
      try {
        const response = await api.edit(targetId, commentId, content);

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
        console.error(`Error updating ${type} comment:`, error);
        options.onError?.(errorMessage);
        return false;
      }
    },
    [targetId, api, type, options]
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

// Wrapper hooks
export const useBlogComment = (blogId: string, options?: UseCommentOptions) => useComment("blog", blogId, options);
export const useUserComment = (postId: string, options?: UseCommentOptions) => useComment("user", postId, options);