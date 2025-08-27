"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { MessageCircle, Send } from "lucide-react";
import { useBlogComment } from "@/hooks/useComment";
import { IComment } from "@/types/blog";
import { useSession } from "next-auth/react";
import { useConfirm } from "@/hooks/useConfirm";
import { CommentItem } from "@/components/blog/CommentItem";

interface CommentSectionProps {
  blogId: string;
  blogAuthorId: string;
  initialComments?: IComment[];
  allowComments?: boolean;
  showCommentCount?: boolean;
  maxComments?: number;
  onCommentAdded?: (comment: IComment) => void;
  onCommentDeleted?: (commentId: string) => void;
}

export function CommentSection({
  blogId,
  blogAuthorId,
  initialComments = [],
  allowComments = true,
  showCommentCount = true,
  maxComments,
  onCommentAdded,
  onCommentDeleted,
}: CommentSectionProps) {
  const { data: session } = useSession();

  const [error, setError] = useState<string | null>(null);
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");

  const { confirmDelete } = useConfirm();

  const {
    // State
    comments,
    newComment,
    isSubmitting,
    isLoading,
    commentCount,

    // Functions
    setNewComment,
    submitComment,
    fetchComments,
    deleteComment,
    updateComment,
  } = useBlogComment(blogId, {
    initialComments,
    onError: setError,
  });

  useEffect(() => {
    fetchComments();
  }, []);

  // Helper functions for permission checking
  const canEditComment = (comment: IComment): boolean => {
    if (!session?.user?.id) return false;
    return session.user.id === comment.author.id;
  };

  const canDeleteComment = (comment: IComment): boolean => {
    if (!session?.user?.id) return false;
    return (
      session.user.id === comment.author.id || session.user.id === blogAuthorId
    );
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();

    const success = await submitComment();
    if (success && comments.length > 0) {
      onCommentAdded?.(comments[0]);
    }
  };

  const handleDeleteComment = async (comment: IComment) => {
    const isOwner = session?.user?.id === comment.author.id;
    const isBlogOwnerDeleting = session?.user?.id === blogAuthorId;

    let confirmMessage = "คุณแน่ใจว่าต้องการลบความคิดเห็นนี้?";

    if (isBlogOwnerDeleting && !isOwner) {
      confirmMessage =
        "คุณกำลังลบความคิดเห็นของผู้อื่นในฐานะเจ้าของโพสต์ คุณแน่ใจหรือไม่?";
    }

    const isConfirmed = await confirmDelete({
      title: "ลบความคิดเห็น",
      text: confirmMessage,
    });
    if (isConfirmed) {
      const success = await deleteComment(comment.id);
      if (success) {
        onCommentDeleted?.(comment.id);
      }
    }
  };

  const handleEditComment = (comment: IComment) => {
    setEditingCommentId(comment.id);
    setEditContent(comment.content);
  };

  const handleUpdateComment = async (commentId: string, content: string) => {
    const success = await updateComment(commentId, content);
    if (success) {
      setEditingCommentId(null);
      setEditContent("");
    }
    return success;
  };

  const handleCancelEdit = () => {
    setEditingCommentId(null);
    setEditContent("");
  };

  const displayComments = maxComments
    ? comments.slice(0, maxComments)
    : comments;

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageCircle className="w-5 h-5" />
          ความคิดเห็น {showCommentCount && `(${commentCount})`}
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setError(null)}
              className="ml-2 h-auto p-0 text-red-700 hover:text-red-900"
            >
              ×
            </Button>
          </div>
        )}

        {/* Comment Form */}
        {allowComments && (
          <form onSubmit={handleSubmitComment} className="space-y-4">
            <Textarea
              placeholder={
                session?.user?.id
                  ? "แสดงความคิดเห็น..."
                  : "เข้าสู่ระบบเพื่อแสดงความคิดเห็น"
              }
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="min-h-[100px] resize-none"
            />
            <div className="flex justify-end">
              <Button
                type="submit"
                disabled={!newComment.trim() || isSubmitting}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                <Send className="w-4 h-4 mr-2" />
                {isSubmitting ? "กำลังส่ง..." : "ส่งความคิดเห็น"}
              </Button>
            </div>
          </form>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="text-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
          </div>
        )}

        {/* Comments List */}
        <div className="space-y-4">
          {displayComments.map((comment) => {
            return (
              <CommentItem
                key={comment.id}
                comment={comment}
                blogAuthorId={blogAuthorId}
                isSubmitting={isSubmitting}
                canEdit={canEditComment(comment)}
                canDelete={canDeleteComment(comment)}
                onEdit={handleEditComment}
                onDelete={handleDeleteComment}
                onUpdate={handleUpdateComment}
                onCancelEdit={handleCancelEdit}
                editingCommentId={editingCommentId}
                editContent={editContent}
                setEditContent={setEditContent}
              />
            );
          })}
        </div>

        {/* Show More Button */}
        {maxComments && comments.length > maxComments && (
          <div className="text-center">
            <Button
              variant="outline"
              onClick={() => {
                // Handle show more - ลบ maxComments หรือเพิ่มค่า
                /* Handle show more */
              }}
            >
              ดูความคิดเห็นทั้งหมด ({comments.length - maxComments} รายการ)
            </Button>
          </div>
        )}

        {/* Empty State */}
        {comments.length === 0 && !isLoading && (
          <div className="text-center py-8 text-slate-500">
            <MessageCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>
              {session?.user?.id
                ? "ยังไม่มีความคิดเห็น เป็นคนแรกที่แสดงความคิดเห็นสิ!"
                : "ยังไม่มีความคิดเห็น เข้าสู่ระบบเพื่อแสดงความคิดเห็น"}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
