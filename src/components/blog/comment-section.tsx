"use client";

import { useState } from "react";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { formatDate } from "@/lib/utils";
import { MessageCircle, Send } from "lucide-react";

interface Comment {
  id: string;
  content: string;
  createdAt: Date;
  author: {
    name: string;
    image: string;
  };
}

interface CommentSectionProps {
  postId: string;
}

// Mock comments
const mockComments: Comment[] = [
  {
    id: "1",
    content:
      "บทความดีมากครับ อธิบายได้เข้าใจง่าย โดยเฉพาะส่วนของ Server Components กับ Client Components",
    createdAt: new Date("2024-01-16"),
    author: {
      name: "สมชาย ใจดี",
      image:
        "https://wallpapers.com/images/featured/4k-background-fd313fxzl511betu.jpg",
    },
  },
  {
    id: "2",
    content:
      "ขอบคุณสำหรับการแชร์ความรู้ครับ รอบทความใหม่ๆ เกี่ยวกับ Next.js ต่อไป",
    createdAt: new Date("2024-01-17"),
    author: {
      name: "นุชจรีย์ รักเรียน",
      image:
        "https://wallpapers.com/images/featured/4k-background-fd313fxzl511betu.jpg",
    },
  },
];

export function CommentSection({ postId }: CommentSectionProps) {
  const [comments, setComments] = useState<Comment[]>(mockComments);
  const [newComment, setNewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || isSubmitting) return;

    setIsSubmitting(true);

    try {
      // ในการใช้งานจริงจะเรียก API
      // const response = await fetch(`/api/posts/${postId}/comments`, {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ content: newComment })
      // })

      // Mock การเพิ่ม comment
      await new Promise((resolve) => setTimeout(resolve, 500));

      const mockNewComment: Comment = {
        id: Date.now().toString(),
        content: newComment,
        createdAt: new Date(),
        author: {
          name: "คุณ",
          image:
            "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=40&h=40&fit=crop&crop=face",
        },
      };

      setComments((prev) => [mockNewComment, ...prev]);
      setNewComment("");
    } catch (error) {
      console.error("Error submitting comment:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageCircle className="w-5 h-5" />
          ความคิดเห็น ({comments.length})
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Comment Form */}
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

        {/* Comments List */}
        <div className="space-y-4">
          {comments.map((comment) => (
            <div
              key={comment.id}
              className="flex gap-4 p-4 bg-white/30 dark:bg-black/20 rounded-lg backdrop-blur-sm"
            >
              <Image
                src={comment.author.image}
                alt={comment.author.name}
                width={40}
                height={40}
                className="h-10 w-10 rounded-full flex-shrink-0"
              />

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-medium text-sm">
                    {comment.author.name}
                  </span>
                  <span className="text-xs text-slate-500">
                    {formatDate(comment.createdAt)}
                  </span>
                </div>
                <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                  {comment.content}
                </p>
              </div>
            </div>
          ))}
        </div>

        {comments.length === 0 && (
          <div className="text-center py-8 text-slate-500">
            <MessageCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>ยังไม่มีความคิดเห็น เป็นคนแรกที่แสดงความคิดเห็นสิ!</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
