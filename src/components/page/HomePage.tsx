"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowRight, Edit3, Globe, Zap, ChevronLeft, ChevronRight } from "lucide-react";
import { useSession } from "next-auth/react";
import { SmartNavigation } from "../Navbar/SmartNavbar";
import { useState, useRef } from "react";

// Sample categories - ปรับตามข้อมูลจริงของคุณ
const categories = [
  { id: 'all', name: 'ทั้งหมด', icon: '🎯', color: 'from-blue-500 to-blue-600', count: 42 },
  { id: 'technology', name: 'เทคโนโลยี', icon: '💻', color: 'from-purple-500 to-purple-600', count: 15 },
  { id: 'design', name: 'ดีไซน์', icon: '🎨', color: 'from-pink-500 to-pink-600', count: 12 },
  { id: 'lifestyle', name: 'ไลฟ์สไตล์', icon: '✨', color: 'from-green-500 to-green-600', count: 8 },
  { id: 'travel', name: 'ท่องเที่ยว', icon: '🌍', color: 'from-orange-500 to-orange-600', count: 6 },
  { id: 'food', name: 'อาหาร', icon: '🍕', color: 'from-red-500 to-red-600', count: 9 },
  { id: 'business', name: 'ธุรกิจ', icon: '💼', color: 'from-indigo-500 to-indigo-600', count: 11 },
  { id: 'education', name: 'การศึกษา', icon: '📚', color: 'from-yellow-500 to-yellow-600', count: 7 },
];

export default function HomePageContent() {
  const { data: session } = useSession();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -300, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 300, behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/20 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800">
      <SmartNavigation />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <div className="animate-float">
            <h1 className="text-5xl md:text-7xl font-bold mb-6">
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                Blog CMS
              </span>
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
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
            >
              <Link href="/blog">
                เริ่มอ่านบล็อก <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button 
              asChild 
              variant="outline" 
              size="lg" 
              className="backdrop-blur-sm bg-white/10 dark:bg-slate-800/50 border-white/20 hover:bg-white/20 dark:hover:bg-slate-700/50 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
            >
              <Link href={session ? "/blog/new" : "/auth/sign-in"}>
                เขียนบล็อก <Edit3 className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute top-20 left-10 w-20 h-20 bg-gradient-to-br from-blue-400 to-purple-600 rounded-full opacity-20 animate-pulse" />
        <div className="absolute bottom-20 right-10 w-32 h-32 bg-gradient-to-br from-purple-400 to-pink-600 rounded-full opacity-20 animate-pulse delay-75" />
        <div className="absolute top-1/2 left-1/4 w-2 h-2 bg-blue-400 rounded-full opacity-40 animate-ping" />
        <div className="absolute bottom-1/3 right-1/4 w-1 h-1 bg-purple-400 rounded-full opacity-60 animate-ping delay-100" />
      </section>

      {/* Category Selector Section */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                เลือกหมวดหมู่
              </span>
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-400">
              ค้นหาเนื้อหาที่คุณสนใจ
            </p>
          </div>

          {/* Category Scroll Container */}
          <div className="relative group">
            {/* Left Scroll Button */}
            <button
              onClick={scrollLeft}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-full shadow-lg hover:shadow-xl border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 opacity-0 group-hover:opacity-100 transition-all duration-300 transform -translate-x-2 hover:scale-110"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            {/* Right Scroll Button */}
            <button
              onClick={scrollRight}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-full shadow-lg hover:shadow-xl border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 hover:scale-110"
            >
              <ChevronRight className="w-5 h-5" />
            </button>

            {/* Categories Container */}
            <div
              ref={scrollContainerRef}
              className="flex gap-4 overflow-x-auto scrollbar-hide pb-4 px-8 scroll-smooth"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {categories.map((category) => (
                <div
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`
                    relative flex-shrink-0 cursor-pointer group/card transition-all duration-300
                    ${selectedCategory === category.id ? 'scale-105' : 'hover:scale-102'}
                  `}
                >
                  <Card className={`
                    w-48 h-32 p-6 backdrop-blur-sm border transition-all duration-300
                    ${selectedCategory === category.id 
                      ? 'bg-gradient-to-br ' + category.color + ' text-white border-white/20 shadow-xl' 
                      : 'bg-white/50 dark:bg-slate-800/50 hover:bg-white/70 dark:hover:bg-slate-700/70 border-slate-200 dark:border-slate-700 hover:shadow-lg'
                    }
                  `}>
                    <div className="flex flex-col items-center text-center h-full justify-center">
                      <div className={`
                        text-3xl mb-2 transition-transform duration-300 group-hover/card:scale-110
                        ${selectedCategory === category.id ? 'drop-shadow-sm' : ''}
                      `}>
                        {category.icon}
                      </div>
                      <h3 className={`
                        font-semibold mb-1 text-sm
                        ${selectedCategory === category.id 
                          ? 'text-white' 
                          : 'text-slate-800 dark:text-slate-200'
                        }
                      `}>
                        {category.name}
                      </h3>
                      <span className={`
                        text-xs px-2 py-1 rounded-full
                        ${selectedCategory === category.id 
                          ? 'bg-white/20 text-white' 
                          : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
                        }
                      `}>
                        {category.count} บทความ
                      </span>
                    </div>

                    {/* Selection Indicator */}
                    {selectedCategory === category.id && (
                      <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-2 h-2 bg-white rounded-full shadow-lg animate-pulse" />
                    )}
                  </Card>
                </div>
              ))}
            </div>
          </div>

          {/* Selected Category Action */}
          <div className="text-center mt-8">
            <Button
              asChild
              size="lg"
              variant="outline"
              className="backdrop-blur-sm bg-white/10 dark:bg-slate-800/50 border-white/20 hover:bg-white/20 dark:hover:bg-slate-700/50 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
            >
              <Link href={`/blog?category=${selectedCategory}`}>
                ดูบล็อกใน{categories.find(c => c.id === selectedCategory)?.name}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              ฟีเจอร์เด่น
            </span>
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="backdrop-blur-sm bg-white/50 dark:bg-slate-800/50 p-8 hover:scale-105 hover:shadow-xl transition-all duration-300 border border-slate-200 dark:border-slate-700">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center mb-4 shadow-lg">
                <Edit3 className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-4 text-slate-800 dark:text-slate-200">Dual Editor</h3>
              <p className="text-slate-600 dark:text-slate-400">
                เขียนด้วย Markdown หรือ Rich Text Editor ตามความถนัด
              </p>
            </Card>

            <Card className="backdrop-blur-sm bg-white/50 dark:bg-slate-800/50 p-8 hover:scale-105 hover:shadow-xl transition-all duration-300 border border-slate-200 dark:border-slate-700">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center mb-4 shadow-lg">
                <Globe className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-4 text-slate-800 dark:text-slate-200">SEO Friendly</h3>
              <p className="text-slate-600 dark:text-slate-400">
                URL สวย, Meta tags ครบ, และ Performance ที่เร็ว
              </p>
            </Card>

            <Card className="backdrop-blur-sm bg-white/50 dark:bg-slate-800/50 p-8 hover:scale-105 hover:shadow-xl transition-all duration-300 border border-slate-200 dark:border-slate-700">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center mb-4 shadow-lg">
                <Zap className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-4 text-slate-800 dark:text-slate-200">Real-time</h3>
              <p className="text-slate-600 dark:text-slate-400">
                Comment และ Like แบบ Real-time ด้วย WebSocket
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Custom Styles */}
      <style jsx>{`
        .scrollbar-hide {
          -webkit-scrollbar: none;
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}