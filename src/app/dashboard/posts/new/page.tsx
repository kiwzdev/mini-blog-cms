"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RichTextEditor } from "@/components/editor/rich-text-editor";
import { MarkdownEditor } from "@/components/editor/markdown-editor";
import { ArrowLeft, Save, Eye, Upload } from "lucide-react";
import Link from "next/link";

export default function NewPostPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [contentType, setContentType] = useState<"markdown" | "richtext">(
    "markdown"
  );
  const [coverImage, setCoverImage] = useState("");
  const [isPublished, setIsPublished] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async (publish: boolean = false) => {
    if (!title.trim() || !content.trim()) {
      alert("กรุณากรอกชื่อเรื่องและเนื้อหา");
      return;
    }

    setIsSaving(true);

    try {
      // ในการใช้งานจริงจะเรียก API
      // const response = await fetch('/api/posts', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({
      //     title,
      //     content,
      //     contentType,
      //     coverImage,
      //     published: publish || isPublished
      //   })
      // })

      // Mock saving
      await new Promise((resolve) => setTimeout(resolve, 1000));

      if (publish) {
        alert("เผยแพร่โพสต์สำเร็จ!");
        router.push("/dashboard/posts");
      } else {
        alert("บันทึกแบบร่างสำเร็จ!");
      }
    } catch (error) {
      console.error("Error saving post:", error);
      alert("เกิดข้อผิดพลาดในการบันทึก");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button asChild variant="ghost">
            <Link href="/dashboard/posts">
              <ArrowLeft className="w-4 h-4 mr-2" />
              กลับ
            </Link>
          </Button>
          <h1 className="text-2xl font-bold">เขียนบล็อกใหม่</h1>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => handleSave(false)}
            disabled={isSaving}
          >
            <Save className="w-4 h-4 mr-2" />
            บันทึกแบบร่าง
          </Button>
          <Button
            onClick={() => handleSave(true)}
            disabled={isSaving}
            className="bg-gradient-to-r from-blue-600 to-purple-600"
          >
            <Eye className="w-4 h-4 mr-2" />
            เผยแพร่
          </Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Title */}
          <Card className="glass-card">
            <CardContent className="p-6">
              <Label htmlFor="title" className="text-base font-medium">
                ชื่อเรื่อง
              </Label>
              <Input
                id="title"
                placeholder="ใส่ชื่อเรื่องที่น่าสนใจ..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="mt-2 text-lg"
              />
            </CardContent>
          </Card>

          {/* Editor Selection */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>เลือกรูปแบบการเขียน</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4">
                <Button
                  variant={contentType === "markdown" ? "default" : "outline"}
                  onClick={() => setContentType("markdown")}
                >
                  Markdown
                </Button>
                <Button
                  variant={contentType === "richtext" ? "default" : "outline"}
                  onClick={() => setContentType("richtext")}
                >
                  Rich Text
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Content Editor */}
          <Card className="glass-card">
            <CardContent className="p-6">
              {contentType === "markdown" ? (
                <MarkdownEditor value={content} onChange={setContent} />
              ) : (
                <RichTextEditor value={content} onChange={setContent} />
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Cover Image */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>รูปปก</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                placeholder="URL รูปภาพ"
                value={coverImage}
                onChange={(e) => setCoverImage(e.target.value)}
              />
              <Button variant="outline" className="w-full">
                <Upload className="w-4 h-4 mr-2" />
                อัพโหลดรูป
              </Button>
              {coverImage && (
                <div className="aspect-video bg-slate-100 dark:bg-slate-800 rounded-lg overflow-hidden">
                  <img
                    src={coverImage}
                    alt="Cover preview"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Settings */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>การตั้งค่า</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="published">เผยแพร่ทันที</Label>
                <input
                  id="published"
                  type="checkbox"
                  checked={isPublished}
                  onChange={(e) => setIsPublished(e.target.checked)}
                  className="rounded"
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
