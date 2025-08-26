import { Github, Twitter, Linkedin, Facebook } from "lucide-react";
import Link from "next/link";

export default function Footer() {
  return (
    <footer
      className="mt-12 border-t border-gray-200 dark:border-gray-700 
                       bg-white/80 dark:bg-slate-900/70 backdrop-blur"
    >
      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">
              Mini Blog
            </h2>
            <p className="mt-3 text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
              พื้นที่แบ่งปันบทความ ความรู้ และประสบการณ์ในสายเทคโนโลยีและชีวิต
            </p>
          </div>

          {/* Navigation */}
          <div className="flex flex-col md:items-center">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-3">
              เมนู
            </h3>
            <ul className="space-y-2 text-gray-600 dark:text-gray-400 text-sm">
              <li>
                <Link href="/" className="hover:text-blue-500 transition">
                  หน้าแรก
                </Link>
              </li>
              <li>
                <Link href="/blog" className="hover:text-blue-500 transition">
                  บทความ
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-blue-500 transition">
                  เกี่ยวกับเรา
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="hover:text-blue-500 transition"
                >
                  ติดต่อ
                </Link>
              </li>
            </ul>
          </div>

          {/* Social */}
          <div className="md:justify-self-end">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-3">
              ติดตามเรา
            </h3>
            <div className="flex space-x-4">
              <Link
                href="#"
                className="text-gray-500 hover:text-blue-500 transition"
              >
                <Facebook className="w-5 h-5" />
              </Link>
              <Link
                href="#"
                className="text-gray-500 hover:text-blue-500 transition"
              >
                <Twitter className="w-5 h-5" />
              </Link>
              <Link
                href="#"
                className="text-gray-500 hover:text-blue-500 transition"
              >
                <Github className="w-5 h-5" />
              </Link>
              <Link
                href="#"
                className="text-gray-500 hover:text-blue-500 transition"
              >
                <Linkedin className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-10 pt-6 border-t border-gray-200 dark:border-gray-700 flex flex-col md:flex-row items-center justify-between text-sm text-gray-500 dark:text-gray-400">
          <p>© {new Date().getFullYear()} Mini Blog. All rights reserved.</p>
          <p className="mt-2 md:mt-0">
            Made with ❤️ by <span className="text-blue-500">kiwzdev</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
