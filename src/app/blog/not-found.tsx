import Link from "next/link";

// app/blog/not-found.tsx (Blog specific 404)
export default function BlogNotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">ไม่พบบทความ</h1>
        <p className="text-xl mb-6">บทความที่คุณต้องการไม่มีอยู่</p>
        <Link href="/blog" className="btn-primary">
          กลับไปหน้าบล็อก
        </Link>
      </div>
    </div>
  );
}
