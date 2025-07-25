"use client";

import toast, { Toast } from "react-hot-toast";

interface EmailVerifyToastProps {
  t: Toast;
  email: string;
}

export default function EmailVerifyToast({ t, email }: EmailVerifyToastProps) {
  const resendVerification = async () => {
    try {
      const res = await fetch("/api/auth/send-verification-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.toLowerCase() }),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success("📩 ส่งอีเมลใหม่แล้ว");
        setTimeout(() => toast.dismiss(t.id), 3000); // ลบ toast ภายใน 3 วิ
      } else {
        toast.error(data.message || "ส่งอีเมลไม่สำเร็จ");
      }
    } catch {
      toast.error("เกิดข้อผิดพลาดในการส่งอีเมล");
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-md flex flex-col text-sm max-w-sm w-full">
      <span className="font-medium text-gray-900 mb-2">
        ⚠️ กรุณายืนยันอีเมลก่อนเข้าสู่ระบบ
      </span>
      <button
        onClick={resendVerification}
        className="self-start text-blue-600 hover:underline text-xs"
      >
        📩 ส่งอีเมลยืนยันใหม่
      </button>
    </div>
  );
}
