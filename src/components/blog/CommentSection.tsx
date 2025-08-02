// CommentSection Component ที่ใช้ useComment hook
"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { formatDate } from "@/lib/utils";
import { MessageCircle, Send, Trash2, Edit2, Shield } from "lucide-react";
import { useComment } from "@/hooks/useComment";
import { IComment } from "@/types/blog";
import { useSession } from "next-auth/react";
import { useConfirm } from "@/hooks/useConfirm";

interface CommentSectionProps {
  postId: string;
  postAuthorId: string; // เพิ่มเพื่อเช็คว่าเป็นเจ้าของโพสหรือไม่
  initialComments?: IComment[];
  allowComments?: boolean; // เปิด/ปิดการคอมเม้นต์
  showCommentCount?: boolean;
  maxComments?: number; // จำกัดจำนวนคอมเม้นต์ที่แสดง
  onCommentAdded?: (comment: IComment) => void;
  onCommentDeleted?: (commentId: string) => void;
}

export function CommentSection({
  postId,
  postAuthorId,
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
    comments,
    newComment,
    isSubmitting,
    isLoading,
    commentCount,
    setNewComment,
    submitComment,
    fetchComments,
    deleteComment,
    updateComment,
  } = useComment(postId, {
    initialComments,
    onError: setError,
  });

  useEffect(() => {
    fetchComments();
  }, []);

  // Helper functions for permission checking
  const canEditComment = (comment: IComment): boolean => {
    if (!session?.user?.id) return false;
    // เจ้าของคอมเม้นต์สามารถแก้ไขได้
    return session.user.id === comment.author.id;
  };

  const canDeleteComment = (comment: IComment): boolean => {
    if (!session?.user?.id) return false;
    // เจ้าของคอมเม้นต์ หรือ เจ้าของโพสต์สามารถลบได้
    return (
      session.user.id === comment.author.id || session.user.id === postAuthorId
    );
  };

  const isPostOwner = (comment: IComment): boolean => {
    return (
      session?.user?.id === postAuthorId &&
      session.user.id !== comment.author.id
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
    const isPostOwnerDeleting = session?.user?.id === postAuthorId;

    let confirmMessage = "คุณแน่ใจว่าต้องการลบความคิดเห็นนี้?";

    if (isPostOwnerDeleting && !isOwner) {
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

  const handleUpdateComment = async () => {
    if (editingCommentId && editContent.trim()) {
      const success = await updateComment(editingCommentId, editContent);
      if (success) {
        setEditingCommentId(null);
        setEditContent("");
      }
    }
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
              disabled={!session?.user?.id}
            />
            <div className="flex justify-end">
              <Button
                type="submit"
                disabled={
                  !newComment.trim() || isSubmitting || !session?.user?.id
                }
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
          {displayComments.map((comment) => (
            <div
              key={comment.id}
              className="flex gap-4 p-4 bg-white/30 dark:bg-black/20 rounded-lg backdrop-blur-sm"
            >
              <Image
                src={comment.author.profileImage || "/default-avatar.png"}
                alt={comment.author.name}
                width={40}
                height={40}
                className="h-10 w-10 rounded-full flex-shrink-0"
              />

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm">
                      {comment.author.name}
                    </span>
                    <span className="text-xs text-slate-500">
                      @{comment.author.username}
                    </span>
                    {/* แสดงไอคอนถ้าเป็นเจ้าของโพสต์ */}
                    {comment.author.id === postAuthorId && (
                      <Shield className="w-3 h-3 text-blue-500" />
                    )}
                    <span className="text-xs text-slate-500">
                      {formatDate(new Date(comment.createdAt))}
                    </span>
                  </div>

                  {/* Edit/Delete buttons */}
                  {session?.user?.id &&
                    (canEditComment(comment) || canDeleteComment(comment)) && (
                      <div className="flex items-center gap-1">
                        {/* Edit button - เฉพาะเจ้าของคอมเม้นต์ */}
                        {canEditComment(comment) && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditComment(comment)}
                            className="h-6 w-6 p-0 text-slate-500 hover:text-blue-600"
                            title="แก้ไขความคิดเห็น"
                          >
                            <Edit2 className="w-3 h-3" />
                          </Button>
                        )}

                        {/* Delete button - เจ้าของคอมเม้นต์ หรือ เจ้าของโพสต์ */}
                        {canDeleteComment(comment) && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteComment(comment)}
                            className="h-6 w-6 p-0 text-slate-500 hover:text-red-600"
                            title={
                              isPostOwner(comment)
                                ? "ลบความคิดเห็น (เจ้าของโพสต์)"
                                : "ลบความคิดเห็น"
                            }
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        )}
                      </div>
                    )}
                </div>

                {/* Comment Content or Edit Form */}
                {editingCommentId === comment.id ? (
                  <div className="space-y-2">
                    <Textarea
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      className="text-sm"
                      placeholder="แก้ไขความคิดเห็น..."
                    />
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={handleUpdateComment}
                        disabled={!editContent.trim() || isSubmitting}
                        className="bg-green-600 hover:bg-green-700 text-white"
                      >
                        {isSubmitting ? "กำลังบันทึก..." : "บันทึก"}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={handleCancelEdit}
                        disabled={isSubmitting}
                      >
                        ยกเลิก
                      </Button>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                    {comment.content}
                  </p>
                )}
              </div>
            </div>
          ))}
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
