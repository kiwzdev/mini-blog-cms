import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LikeButton } from "@/components/blog/like-button";
import { CommentSection } from "@/components/blog/comment-section";
import { formatDate } from "@/lib/utils";
import { ArrowLeft, Clock, User, Eye, Share2 } from "lucide-react";

// Mock data
const mockPost = {
  id: "1",
  title: "Getting Started with Next.js 14 และ App Router",
  content: `# Getting Started with Next.js 14

Next.js 14 มาพร้อมกับฟีเจอร์ใหม่ๆ มากมายที่จะช่วยให้การพัฒนาเว็บแอปพลิเคชันเป็นไปอย่างง่ายดายและมีประสิทธิภาพมากขึ้น

## App Router คืออะไร?

App Router เป็นระบบ routing ใหม่ของ Next.js ที่ใช้ React Server Components เป็นหลัก ทำให้สามารถ:

- **Server-side Rendering** ที่เร็วขึ้น
- **Streaming** และ **Suspense** support
- **Layout** และ **Loading States** ที่ยืดหยุ่น

## การติดตั้ง

\`\`\`bash
npx create-next-app@latest my-app --typescript --tailwind --eslint
cd my-app
npm run dev
\`\`\`

## โครงสร้างโฟลเดอร์

\`\`\`
app/
├── layout.tsx      # Root layout
├── page.tsx        # Home page
├── about/
│   └── page.tsx    # About page
└── blog/
    ├── page.tsx    # Blog listing
    └── [slug]/
        └── page.tsx # Blog post
\`\`\`

## Server Components vs Client Components

### Server Components
- รันบนเซิร์ฟเวอร์
- ไม่สามารถใช้ useState, useEffect
- เหมาะสำหรับการดึงข้อมูล

### Client Components
- รันบนเบราว์เซอร์
- ใช้ "use client" directive
- เหมาะสำหรับ Interactive UI

## ตัวอย่างการใช้งาน

\`\`\`tsx
// app/page.tsx (Server Component)
export default function HomePage() {
  return (
    <div>
      <h1>Welcome to Next.js 14</h1>
      <ClientButton />
    </div>
  )
}

// components/client-button.tsx
"use client"
import { useState } from 'react'

export function ClientButton() {
  const [count, setCount] = useState(0)
  
  return (
    <button onClick={() => setCount(count + 1)}>
      Count: {count}
    </button>
  )
}
\`\`\`

## สรุป

Next.js 14 พร้อม App Router เป็นการพัฒนาที่ยอดเยี่ยม ช่วยให้เราสามารถสร้างเว็บแอปพลิเคชันที่มีประสิทธิภาพสูงได้อย่างง่ายดาย`,
  contentType: "markdown",
  coverImage:
    "https://wallpapers.com/images/featured/4k-background-fd313fxzl511betu.jpg",
  published: true,
  createdAt: new Date("2024-01-15"),
  author: {
    name: "John Doe",
    image:
      "https://wallpapers.com/images/featured/4k-background-fd313fxzl511betu.jpg",
  },
  _count: {
    likes: 24,
    comments: 8,
  },
};

interface BlogPostPageProps {
  params: {
    slug: string;
  };
}

export default function BlogPostPage({ params }: BlogPostPageProps) {
  // ในการใช้งานจริง จะดึงข้อมูลจาก API ตาม slug
  // const post = await getPostBySlug(params.slug)
  // if (!post) notFound()

  const post = mockPost; // ใช้ mock data ก่อน

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <div className="mb-8">
          <Button asChild variant="ghost" className="mb-4">
            <Link href="/blog">
              <ArrowLeft className="w-4 h-4 mr-2" />
              กลับไปหน้าบล็อก
            </Link>
          </Button>
        </div>

        {/* Post Header */}
        <div className="mb-8">
          {/* Cover Image */}
          <div className="relative h-64 md:h-96 rounded-2xl overflow-hidden mb-8">
            <Image
              src={post.coverImage}
              alt={post.title}
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          </div>

          {/* Title */}
          <h1 className="text-3xl md:text-5xl font-bold mb-6 leading-tight">
            {post.title}
          </h1>

          {/* Meta Info */}
          <div className="flex flex-wrap items-center gap-6 text-slate-600 dark:text-slate-400 mb-8">
            <div className="flex items-center gap-2">
              <Image
                src={post.author.image}
                alt={post.author.name}
                width={40}
                height={40}
                className="rounded-full"
              />
              <span className="font-medium">{post.author.name}</span>
            </div>

            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {formatDate(post.createdAt)}
            </div>

            <div className="flex items-center gap-1">
              <Eye className="w-4 h-4" />
              1.2k views
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-4 mb-8">
            <LikeButton postId={post.id} initialLikes={post._count.likes} />
            <Button variant="outline" size="sm">
              <Share2 className="w-4 h-4 mr-2" />
              แชร์
            </Button>
          </div>
        </div>

        {/* Post Content */}
        <Card className="glass-card mb-12">
          <CardContent className="p-8">
            <div className="prose prose-lg max-w-none dark:prose-invert">
              {/* ในการใช้งานจริงจะใช้ Markdown parser หรือ Rich Text renderer */}
              <div
                dangerouslySetInnerHTML={{
                  __html: convertMarkdownToHTML(post.content),
                }}
              />
            </div>
          </CardContent>
        </Card>

        {/* Comment Section */}
        <CommentSection postId={post.id} />
      </div>
    </div>
  );
}

// Helper function สำหรับแปลง Markdown เป็น HTML (simplified)
function convertMarkdownToHTML(markdown: string): string {
  return markdown
    .replace(/^# (.*$)/gim, '<h1 class="text-3xl font-bold mb-4">$1</h1>')
    .replace(/^## (.*$)/gim, '<h2 class="text-2xl font-bold mb-3 mt-8">$1</h2>')
    .replace(/^### (.*$)/gim, '<h3 class="text-xl font-bold mb-2 mt-6">$1</h3>')
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.*?)\*/g, "<em>$1</em>")
    .replace(
      /```([\s\S]*?)```/g,
      '<pre class="bg-slate-100 dark:bg-slate-800 p-4 rounded-lg overflow-x-auto"><code>$1</code></pre>'
    )
    .replace(
      /`(.*?)`/g,
      '<code class="bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded text-sm">$1</code>'
    )
    .replace(/^- (.*$)/gim, '<li class="mb-1">$1</li>')
    .replace(/\n\n/g, '</p><p class="mb-4">')
    .replace(/^\s*(.+)/gm, '<p class="mb-4">$1</p>');
}
