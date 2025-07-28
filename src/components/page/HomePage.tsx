"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowRight, Edit3, Globe, Zap } from "lucide-react";
import { useSession } from "next-auth/react";
import MainNavbar from "../layout/Navbar";

export default function HomePageContent() {
  const { data: session } = useSession();

  return (
    <div className="min-h-screen">
      <MainNavbar />
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <div className="animate-float">
            <h1 className="text-5xl md:text-7xl font-bold mb-6">
              <span className="gradient-text">Blog CMS</span>
              <br />
              <span className="text-slate-800 dark:text-slate-200">
                ที่ทันสมัย
              </span>
            </h1>
          </div>

          <p className="text-xl md:text-2xl text-slate-600 dark:text-slate-400 mb-8 max-w-3xl mx-auto">
            เขียนบล็อกด้วย Markdown หรือ Rich Text Editor
            พร้อมระบบจัดการที่ใช้งานง่าย
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              asChild
              size="lg"
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              <Link href="/blog">
                เริ่มอ่านบล็อก <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="glass-card">
              <Link href={session ? "/blog/new" : "/auth/sign-in"}>
                เขียนบล็อก <Edit3 className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute top-20 left-10 w-20 h-20 bg-gradient-to-br from-blue-400 to-purple-600 rounded-full opacity-20 animate-pulse" />
        <div className="absolute bottom-20 right-10 w-32 h-32 bg-gradient-to-br from-purple-400 to-pink-600 rounded-full opacity-20 animate-pulse delay-75" />
      </section>

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            <span className="gradient-text">ฟีเจอร์เด่น</span>
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="glass-card p-8 hover:scale-105 transition-transform duration-300">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center mb-4">
                <Edit3 className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-4">Dual Editor</h3>
              <p className="text-slate-600 dark:text-slate-400">
                เขียนด้วย Markdown หรือ Rich Text Editor ตามความถนัด
              </p>
            </Card>

            <Card className="glass-card p-8 hover:scale-105 transition-transform duration-300">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center mb-4">
                <Globe className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-4">SEO Friendly</h3>
              <p className="text-slate-600 dark:text-slate-400">
                URL สวย, Meta tags ครบ, และ Performance ที่เร็ว
              </p>
            </Card>

            <Card className="glass-card p-8 hover:scale-105 transition-transform duration-300">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center mb-4">
                <Zap className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-4">Real-time</h3>
              <p className="text-slate-600 dark:text-slate-400">
                Comment และ Like แบบ Real-time ด้วย WebSocket
              </p>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}
