"use client";

import { Suspense, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RichTextEditor } from "@/components/editor/RichTextEditor";
import { MarkdownEditor } from "@/components/editor/MarkdownEditor";
import { ArrowLeft, Save, Eye, Upload } from "lucide-react";
import Link from "next/link";
import MainNavbar from "@/components/layout/Navbar";
import Image from "next/image";
import toast from "react-hot-toast";
import { createPost } from "@/api/post";
import { generateExcerpt, generateSlug } from "@/helpers/post";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createPostSchema } from "@/lib/validations/postSchema";
import { isValidHttpUrl } from "@/helpers/next-image";
import Loading from "@/components/layout/Loading";
import { BLOG_CATEGORIES } from "@/lib/config";

export default function NewPostPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [contentType, setContentType] = useState<"markdown" | "richtext">(
    "markdown"
  );
  const [category, setCategory] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [isPublished, setIsPublished] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async (publish: boolean = false) => {
    setIsSaving(true);

    try {
      // Created post data
      const createdPost = {
        title,
        category,
        content,
        contentType,
        coverImage,
        excerpt: generateExcerpt(content),
        slug: generateSlug(title),
        published: publish,
      };

      // Validation with Zod
      const validation = createPostSchema.safeParse(createdPost);
      if (!validation.success) {
        throw new Error(validation.error.message);
      }

      // Create the post
      const newPost = await createPost(createdPost);

      if (publish) {
        toast.success("เผยแพร่โพสต์สำเร็จ!");
        router.push(`/dashboard/posts/${newPost.id}`);
      } else {
        toast.success("บันทึกแบบร่างสำเร็จ!");
      }
    } catch (error) {
      console.error("Error creating post:", error);
      toast.error("เกิดข้อผิดพลาดในการสร้างโพสต์");
    } finally {
      setIsSaving(false);
    }
  };

  const [isValidCoverImage, setIsValidCoverImage] = useState(false);
  const onCoverImageUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log(isValidCoverImage);

    const url = e.target.value;
    setIsValidCoverImage(true);
    setCoverImage(url);
  };
  const onCoverImageUploadError = () => {
    toast("ไม่สามารถอัปโหลดรูปภาพได้");
    setIsValidCoverImage(false);
    setCoverImage("");
  };

  return (
    <Suspense fallback={<Loading />}>
      <MainNavbar />
      <div className="min-h-screen py-12 px-4">
        <div className="space-y-6 max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button asChild variant="ghost">
                <Link href="/blog">
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
            <div className="lg:col-span-2">
              {/* Title and Editor Selection - Combined */}
              <Card className="glass-card">
                <CardContent className="px-6 py-2 space-y-6">
                  {/* Title Section */}
                  <div>
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
                  </div>

                  {/* Editor Selection */}
                  <div>
                    <Label className="text-base">รูปแบบการเขียน</Label>
                    <div className="flex gap-4 mt-2">
                      <Button
                        variant={
                          contentType === "markdown" ? "default" : "outline"
                        }
                        onClick={() => setContentType("markdown")}
                      >
                        Markdown
                      </Button>
                      <Button
                        variant={
                          contentType === "richtext" ? "default" : "outline"
                        }
                        onClick={() => setContentType("richtext")}
                      >
                        Rich Text
                      </Button>
                    </div>
                  </div>
                </CardContent>
                {/* Content Editor */}
                <CardContent>
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
              {/* Category selection */}
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle>หมวดหมู่</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent>
                      {BLOG_CATEGORIES.map((category) => (
                        <SelectItem
                          key={category.id}
                          value={category.id}
                          className="capitalize"
                        >
                          <div
                            className={`w-6 h-6 rounded-full ${category.color} flex items-center justify-center`}
                          >
                            <category.icon className="w-3 h-3 text-white" />
                          </div>
                          <span className="text-gray-800 font-medium">
                            {category.name}
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </CardContent>
                {/* Cover Image */}
              </Card>
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle>รูปปก</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Input
                    placeholder="URL รูปภาพ"
                    value={coverImage}
                    onChange={onCoverImageUrlChange}
                  />
                  <Button variant="outline" className="w-full">
                    <Upload className="w-4 h-4 mr-2" />
                    อัพโหลดรูป
                  </Button>
                  {/* แสดงเฉพาะเมื่อ URL ถูกต้อง */}
                  {isValidHttpUrl(coverImage) && isValidCoverImage && (
                    <Image
                      src={coverImage}
                      alt="Cover preview"
                      width={600}
                      height={300}
                      className="w-full h-full object-cover"
                      onError={onCoverImageUploadError}
                    />
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
                      className="rounded w-4 h-4"
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </Suspense>
  );
}
