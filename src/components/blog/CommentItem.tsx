import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { formatDate } from "@/lib/utils";
import { Edit2, Shield, Trash2, Heart } from "lucide-react";
import { IComment } from "@/types/blog";
import { useSession } from "next-auth/react";
import { LikeButton } from "./LikeButton";
import { getImageUrl } from "@/lib/image";
import Link from "next/link";

interface CommentItemProps {
  comment: IComment;
  blogAuthorId: string;
  isSubmitting: boolean;
  canEdit: boolean;
  canDelete: boolean;
  onEdit: (comment: IComment) => void;
  onDelete: (comment: IComment) => void;
  onUpdate: (commentId: string, content: string) => Promise<boolean>;
  onCancelEdit: () => void;
  editingCommentId: string | null;
  editContent: string;
  setEditContent: (content: string) => void;
  // Like props
  isLiked: boolean;
  likeCount: number;
  isLiking: boolean;
  onToggleLike: () => void;
}

export function CommentItem({
  comment,
  blogAuthorId,
  isSubmitting,
  canEdit,
  canDelete,
  onEdit,
  onDelete,
  onUpdate,
  onCancelEdit,
  editingCommentId,
  editContent,
  setEditContent,
  isLiked,
  likeCount,
  isLiking,
  onToggleLike,
}: CommentItemProps) {
  const { data: session } = useSession();

  const isBlogOwner =
    session?.user?.id === blogAuthorId && session.user.id !== comment.author.id;

  const handleUpdate = async () => {
    if (editingCommentId && editContent.trim()) {
      const success = await onUpdate(editingCommentId, editContent);
      if (success) {
        onCancelEdit();
      }
    }
  };

  return (
    <div className="flex gap-4 p-4 bg-white/30 dark:bg-black/20 rounded-lg backdrop-blur-sm">
      <Link href={`/profile/${comment.author.username}`}>
        <Image
          src={getImageUrl(comment.author.profileImage || "")}
          alt={comment.author.name}
          width={40}
          height={40}
          className="h-10 w-10 rounded-full flex-shrink-0"
        />
      </Link>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="font-medium text-sm">{comment.author.name}</span>
            <span className="text-xs text-slate-500">
              @{comment.author.username}
            </span>
            {/* แสดงไอคอนถ้าเป็นเจ้าของโพสต์ */}
            {comment.author.id === blogAuthorId && (
              <Shield className="w-3 h-3 text-blue-500" />
            )}
            <span className="text-xs text-slate-500">
              {formatDate(new Date(comment.createdAt))}
            </span>
          </div>

          {/* Edit/Delete buttons */}
          {session?.user?.id && (canEdit || canDelete) && (
            <div className="flex items-center gap-1">
              {/* Edit button - เฉพาะเจ้าของคอมเม้นต์ */}
              {canEdit && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onEdit(comment)}
                  className="h-6 w-6 p-0 text-slate-500 hover:text-blue-600"
                  title="แก้ไขความคิดเห็น"
                >
                  <Edit2 className="w-3 h-3" />
                </Button>
              )}

              {/* Delete button - เจ้าของคอมเม้นต์ หรือ เจ้าของโพสต์ */}
              {canDelete && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDelete(comment)}
                  className="h-6 w-6 p-0 text-slate-500 hover:text-red-600"
                  title={
                    isBlogOwner
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
                onClick={handleUpdate}
                disabled={!editContent.trim() || isSubmitting}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                {isSubmitting ? "กำลังบันทึก..." : "บันทึก"}
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={onCancelEdit}
                disabled={isSubmitting}
              >
                ยกเลิก
              </Button>
            </div>
          </div>
        ) : (
          <>
            <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap mb-2">
              {comment.content}
            </p>

            {/* Like Button */}
            <div className="flex items-center gap-2">
              <LikeButton
                isLiked={isLiked}
                likeCount={likeCount}
                isLiking={isLiking}
                toggleLike={onToggleLike}
                size="sm"
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
