import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { PlusCircle, FileText, Eye, Heart, MessageCircle } from "lucide-react";

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-slate-600 dark:text-slate-400">
            จัดการบล็อกและเนื้อหาของคุณ
          </p>
        </div>
        <Button
          asChild
          className="bg-gradient-to-r from-blue-600 to-purple-600"
        >
          <Link href="/dashboard/posts/new">
            <PlusCircle className="w-4 h-4 mr-2" />
            เขียนบล็อกใหม่
          </Link>
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid md:grid-cols-4 gap-6">
        <Card className="glass-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">โพสต์ทั้งหมด</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">+2 จากเดือนที่แล้ว</p>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">ยอดเข้าชม</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2,350</div>
            <p className="text-xs text-muted-foreground">
              +180.1% จากเดือนที่แล้ว
            </p>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">ไลค์ทั้งหมด</CardTitle>
            <Heart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">145</div>
            <p className="text-xs text-muted-foreground">
              +19% จากเดือนที่แล้ว
            </p>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">ความคิดเห็น</CardTitle>
            <MessageCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">89</div>
            <p className="text-xs text-muted-foreground">
              +201 จากเดือนที่แล้ว
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Posts */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle>โพสต์ล่าสุด</CardTitle>
          <CardDescription>จัดการและแก้ไขโพสต์ของคุณ</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Mock recent posts */}
            {[
              {
                title: "Getting Started with Next.js 14",
                status: "Published",
                date: "2024-01-15",
              },
              {
                title: "Modern CSS Techniques",
                status: "Draft",
                date: "2024-01-12",
              },
              {
                title: "TypeScript Tips & Tricks",
                status: "Published",
                date: "2024-01-10",
              },
            ].map((post, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 border border-slate-200 dark:border-slate-700 rounded-lg"
              >
                <div>
                  <h4 className="font-medium">{post.title}</h4>
                  <p className="text-sm text-slate-500">
                    {post.status} • {post.date}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    แก้ไข
                  </Button>
                  <Button variant="outline" size="sm">
                    ดู
                  </Button>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-6">
            <Button asChild variant="outline" className="w-full">
              <Link href="/dashboard/posts">ดูโพสต์ทั้งหมด</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
