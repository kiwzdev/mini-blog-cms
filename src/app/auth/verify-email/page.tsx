"use client";
import { verifyEmail as verifyEmailAPI } from "@/api/auth";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle, XCircle, Loader2, AlertCircle } from "lucide-react";

type VerificationStatus =
  | "loading"
  | "success"
  | "error"
  | "expired"
  | "already_verified";

export default function VerifyPage() {
  const [status, setStatus] = useState<VerificationStatus>("loading");
  const [message, setMessage] = useState<string | undefined>("กำลังตรวจสอบ...");
  const [countdown, setCountdown] = useState<number>(3);
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const token = searchParams.get("token");

    if (!token) {
      setStatus("error");
      setMessage("ไม่พบ Token สำหรับการยืนยัน");
      return;
    }

    const verifyEmail = async () => {
      try {
        const res = await verifyEmailAPI(token);

        if (res.success) {
          setStatus("success");
          setMessage(res?.message);

          // เริ่มนับถอยหลัง
          let count = 3;
          const countdownInterval = setInterval(() => {
            count--;
            setCountdown(count);

            if (count <= 0) {
              clearInterval(countdownInterval);
              router.replace("/auth/sign-in");
            }
          }, 1000);
        } else if (res.error) {
          // จัดการ error แบบละเอียด
          if (res.error.message.includes("expired")) {
            setStatus("expired");
          } else if (res.error.message.includes("already")) {
            setStatus("already_verified");
          } else {
            setStatus("error");
          }
          throw new Error(res.error.message);
        }
      } catch (err: unknown) {
        const errorMessage =
          err instanceof Error ? err.message : "Something went wrong";
        setMessage(errorMessage);
      }
    };

    verifyEmail();
  }, [searchParams, router]);

  const getStatusIcon = () => {
    switch (status) {
      case "loading":
        return <Loader2 className="w-16 h-16 text-blue-500 animate-spin" />;
      case "success":
        return <CheckCircle className="w-16 h-16 text-green-500" />;
      case "expired":
        return <AlertCircle className="w-16 h-16 text-orange-500" />;
      case "already_verified":
        return <CheckCircle className="w-16 h-16 text-blue-500" />;
      default:
        return <XCircle className="w-16 h-16 text-red-500" />;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case "loading":
        return "text-blue-600";
      case "success":
        return "text-green-600";
      case "expired":
        return "text-orange-600";
      case "already_verified":
        return "text-blue-600";
      default:
        return "text-red-600";
    }
  };

  const getActionButton = () => {
    switch (status) {
      case "success":
        return (
          <p className="text-sm text-gray-600 mt-4">
            กำลังพาท่านไปยังหน้าหลักใน {countdown} วินาที...
          </p>
        );
      case "expired":
        return (
          <div className="mt-6 space-y-3">
            <button
              onClick={() => router.push("/resend-verification")}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
            >
              ขอ Token ใหม่
            </button>
            <button
              onClick={() => router.push("/login")}
              className="w-full bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700 transition-colors"
            >
              กลับไปหน้าเข้าสู่ระบบ
            </button>
          </div>
        );
      case "already_verified":
        return (
          <div className="mt-6">
            <button
              onClick={() => router.push("/login")}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
            >
              เข้าสู่ระบบ
            </button>
          </div>
        );
      case "error":
        return (
          <div className="mt-6 space-y-3">
            <button
              onClick={() => window.location.reload()}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
            >
              ลองอีกครั้ง
            </button>
            <button
              onClick={() => router.push("/support")}
              className="w-full bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700 transition-colors"
            >
              ติดต่อสนับสนุน
            </button>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="flex justify-center mb-6">{getStatusIcon()}</div>

          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            การยืนยันอีเมล
          </h1>

          <p className={`text-lg font-medium mb-6 ${getStatusColor()}`}>
            {message}
          </p>

          {getActionButton()}

          {status === "loading" && (
            <div className="mt-6">
              <div className="animate-pulse flex space-x-1 justify-center">
                <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
