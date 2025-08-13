"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams, notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RichTextEditor } from "@/components/editor/RichTextEditor";
import { MarkdownEditor } from "@/components/editor/MarkdownEditor";
import {
  ArrowLeft,
  Save,
  Eye,
  Upload,
  Trash2,
  AlertTriangle,
} from "lucide-react";
import Link from "next/link";

import Image from "next/image";
import toast from "react-hot-toast";
import { updateBlog, getBlogById, deleteBlog } from "@/api/blog";
import { generateExcerpt, generateSlug } from "@/helpers/blog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { updateBlogSchema } from "@/lib/validations/blogSchema";
import { BLOG_CATEGORIES } from "@/lib/config";
import { IBlog } from "@/types/blog";
import { isValidHttpUrl } from "@/lib/image";
import Loading from "@/components/Loading";
import { uploadImage } from "@/api/upload";
import { useLoading } from "@/stores/useLoadingStore";
import { SmartNavigation } from "@/components/Navbar/SmartNavbar";

const categories = BLOG_CATEGORIES;

export default function EditBlogPage() {
  const params = useParams<{ blogId: string }>();
  const blogId = params.blogId;

  const router = useRouter();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [contentType, setContentType] = useState<"markdown" | "richtext">(
    "markdown"
  );
  const [category, setCategory] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [coverImageFile, setCoverImageFile] = useState<File | null>(null);
  const [isPublished, setIsPublished] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { isLoading, setLoading } = useLoading(`blog-blog-${blogId}`);
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [blog, setBlog] = useState<IBlog | null>(null);

  // Load existing blog data
  useEffect(() => {
    const fetchBlog = async () => {
      try {
        setLoading(true);
        const response = await getBlogById({blogId});
        console.log(response);

        if (response.success) {
          setTitle(response.data.title || "");
          setContent(response.data.content || "");
          setContentType(response.data.contentType || "markdown");
          setCategory(response.data.category || "");
          setCoverImage(response.data.coverImage || "");
          setIsPublished(response.data.published || false);
          setBlog(response.data);
        } else if (response.error) {
          throw new Error(response.error.message);
        }
      } catch (err: unknown) {
        const errorMessage =
          err instanceof Error ? err.message : "Something went wrong";
        console.error("Error fetching blog:", errorMessage);
        setError(errorMessage);
        toast.error(errorMessage);
        router.push("/dashboard/blogs");
      } finally {
        setLoading(false);
      }
    };

    if (blogId) {
      fetchBlog();
    }
  }, [blogId, router]);

  const handleSave = async (publish: boolean = false) => {
    setIsSaving(true);

    try {
      // Update blog data
      const updatedBlog = {
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
      const validation = updateBlogSchema.safeParse(updatedBlog);
      if (!validation.success) {
        const messages = validation.error.issues
          .map((i) => i.message)
          .join(",\n");
        throw new Error(messages);
      }

      // Upload cover image
      if (coverImageFile) {
        const uploadResponse = await uploadImage(coverImageFile, coverImage);
        if (uploadResponse.success) {
          toast.success("อัปโหลดรูปภาพสําเร็จ!");
          updatedBlog.coverImage = uploadResponse.data.publicId;
        } else if (uploadResponse.error) {
          throw new Error(uploadResponse.error.message);
        }
      }

      // Update the blog
      const updateResponse = await updateBlog(blogId, updatedBlog);

      if (updateResponse.success) {
        if (publish) {
          toast.success("อัปเดตและเผยแพร่โพสต์สำเร็จ!");
          router.push(`/blog/${updateResponse.data.id}`);
        } else {
          toast.success("บันทึกการแก้ไขสำเร็จ!");
        }
      } else if (updateResponse.error) {
        setError(updateResponse.error.code);
      }
    } catch (error) {
      console.error("Error updating blog:", error);
      toast.error("เกิดข้อผิดพลาดในการอัปเดตโพสต์");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);

    try {
      await deleteBlog(blogId);
      toast.success("ลบโพสต์สำเร็จ!");
      router.push("/dashboard/blogs");
    } catch (error) {
      console.error("Error deleting blog:", error);
      toast.error("เกิดข้อผิดพลาดในการลบโพสต์");
    } finally {
      setIsDeleting(false);
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

  const handleUploadCoverImage = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // ตรวจสอบประเภทและขนาดไฟล์
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png"];
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (!allowedTypes.includes(file.type)) {
      toast.error("Please select a valid image file (JPEG, PNG, JPG)");
      return;
    }
    if (file.size > maxSize) {
      toast.error("File size must be less than 5MB");
      return;
    }
    setCoverImageFile(file);
  };

  if (isLoading) return <Loading />;
  if (!blog && !error) return <Loading />;
  if (error === "Blog not found" || !blog) return notFound();
  else
    return (
      <>
        <SmartNavigation/>
        <div className="min-h-screen py-12 px-4">
          <div className="space-y-6 max-w-6xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button asChild variant="ghost">
                  <Link href={`/blog/${blog?.id}`}>
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    กลับ
                  </Link>
                </Button>
                <div>
                  <h1 className="text-2xl font-bold">แก้ไขบล็อก</h1>
                  <p className="text-sm text-gray-600 mt-1">
                    แก้ไขล่าสุด:{" "}
                    {blog?.updatedAt
                      ? new Date(blog.updatedAt).toLocaleDateString("th-TH")
                      : "ไม่ระบุ"}
                  </p>
                </div>
              </div>

              <div className="flex gap-2">
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="destructive"
                      size="sm"
                      disabled={isDeleting}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      ลบ
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle className="flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5 text-red-500" />
                        ยืนยันการลบโพสต์
                      </AlertDialogTitle>
                      <AlertDialogDescription>
                        คุณแน่ใจหรือไม่ที่จะลบโพสต์ &ldquo;{title}&rdquo;
                        การดำเนินการนี้ไม่สามารถย้อนกลับได้
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>ยกเลิก</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleDelete}
                        className="bg-red-600 hover:bg-red-700"
                      >
                        ลบโพสต์
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>

                <Button
                  variant="outline"
                  onClick={() => handleSave(false)}
                  disabled={isSaving}
                >
                  <Save className="w-4 h-4 mr-2" />
                  บันทึกการแก้ไข
                </Button>

                <Button
                  onClick={() => handleSave(true)}
                  disabled={isSaving}
                  className="bg-gradient-to-r from-blue-600 to-purple-600"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  อัปเดต
                </Button>
              </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
              {/* Main Content */}
              <div className="lg:col-span-2">
                {/* Title and Editor Selection */}
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
                {/* Status */}
                <Card className="glass-card">
                  <CardHeader>
                    <CardTitle>สถานะโพสต์</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-2 h-2 rounded-full ${
                          isPublished ? "bg-green-500" : "bg-yellow-500"
                        }`}
                      ></div>
                      <span className="text-sm font-medium">
                        {isPublished ? "เผยแพร่แล้ว" : "แบบร่าง"}
                      </span>
                    </div>
                    {blog?.createdAt && (
                      <p className="text-xs text-gray-600 mt-1">
                        เผยแพร่เมื่อ:{" "}
                        {new Date(blog.createdAt).toLocaleDateString("th-TH")}
                      </p>
                    )}
                  </CardContent>
                </Card>

                {/* Category selection */}
                <Card className="glass-card">
                  <CardHeader>
                    <CardTitle>หมวดหมู่</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Select value={category} onValueChange={setCategory}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="เลือกหมวดหมู่" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((cat) => (
                          <SelectItem
                            key={cat.id}
                            value={cat.id}
                            className="capitalize"
                          >
                            <div className="flex items-center gap-2">
                              <div
                                className={`w-6 h-6 rounded-full ${cat.color} flex items-center justify-center`}
                              >
                                <cat.icon className="w-3 h-3 text-white" />
                              </div>
                              <span className="text-gray-800 font-medium">
                                {cat.name}
                              </span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </CardContent>
                </Card>

                {/* Cover Image */}
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
                    <Button variant="outline" className="w-full" asChild>
                      <label htmlFor="upload" className="cursor-pointer">
                        <input
                          type="file"
                          name="image"
                          accept="image/jpeg,image/png,image/jpg"
                          onChange={handleUploadCoverImage}
                          className="hidden"
                          id="upload"
                          disabled={isSaving}
                        />
                        <Upload className="w-4 h-4 mr-2" />
                        อัพโหลดรูป
                      </label>
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
      </>
    );
}
