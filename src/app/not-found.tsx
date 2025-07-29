import Link from "next/link";

// app/not-found.tsx (Global 404)
export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">404</h1>
        <p className="text-xl mb-6">ไม่พบหน้าที่คุณต้องการ</p>
        <Link href="/" className="btn-primary">
          กลับหน้าแรก
        </Link>
      </div>
    </div>
  );
}