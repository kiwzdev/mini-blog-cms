// CommentSection Component ที่ใช้ useComment hook
"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { formatDate } from "@/lib/utils";
import { MessageCircle, Send, Trash2, Edit2 } from "lucide-react";
import { useComment } from "@/hooks/useComment";
import { IComment } from "@/types/blog";

interface CommentSectionProps {
  postId: string;
  initialComments?: IComment[];
  currentUserId?: string; // เพื่อแสดงปุ่ม edit/delete
  allowComments?: boolean; // เปิด/ปิดการคอมเม้นต์
  showCommentCount?: boolean;
  maxComments?: number; // จำกัดจำนวนคอมเม้นต์ที่แสดง
  onCommentAdded?: (comment: IComment) => void;
  onCommentDeleted?: (commentId: string) => void;
}

export function CommentSection({
  postId,
  initialComments = [],
  currentUserId,
  allowComments = true,
  showCommentCount = true,
  maxComments,
  onCommentAdded,
  onCommentDeleted,
}: CommentSectionProps) {
  const [error, setError] = useState<string | null>(null);
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");

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

  // ดึงคอมเม้นต์เมื่อ component mount (ถ้าไม่มี initialComments)
  useEffect(() => {
    if (initialComments.length === 0) {
      fetchComments();
    }
  }, [fetchComments, initialComments.length]);

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    await submitComment();
    if (comments.length > 0) {
      onCommentAdded?.(comments[0]);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (confirm("คุณแน่ใจว่าต้องการลบความคิดเห็นนี้?")) {
      await deleteComment(commentId);
      onCommentDeleted?.(commentId);
    }
  };

  const handleEditComment = (comment: IComment) => {
    setEditingCommentId(comment.id);
    setEditContent(comment.content);
  };

  const handleUpdateComment = async () => {
    if (editingCommentId && editContent.trim()) {
      await updateComment(editingCommentId, editContent);
      setEditingCommentId(null);
      setEditContent("");
    }
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
          </div>
        )}

        {/* IComment Form */}
        {allowComments && (
          <form onSubmit={handleSubmitComment} className="space-y-4">
            <Textarea
              placeholder="แสดงความคิดเห็น..."
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
                    <span className="text-xs text-slate-500">
                      {formatDate(new Date(comment.createdAt))}
                    </span>
                  </div>

                  {/* Edit/Delete buttons for comment owner */}
                  {currentUserId === comment.author.id && (
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditComment(comment)}
                        className="h-6 w-6 p-0"
                      >
                        <Edit2 className="w-3 h-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteComment(comment.id)}
                        className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  )}
                </div>

                {/* IComment Content or Edit Form */}
                {editingCommentId === comment.id ? (
                  <div className="space-y-2">
                    <Textarea
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      className="text-sm"
                    />
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={handleUpdateComment}
                        disabled={!editContent.trim()}
                      >
                        บันทึก
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setEditingCommentId(null);
                          setEditContent("");
                        }}
                      >
                        ยกเลิก
                      </Button>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
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
            <p>ยังไม่มีความคิดเห็น เป็นคนแรกที่แสดงความคิดเห็นสิ!</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
