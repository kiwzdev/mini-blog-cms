"use client";

import { signIn, useSession } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import Loading from "@/components/Loading";
import Link from "next/link";
import EmailVerifyToast from "@/components/toast/EmailVerificationToast";

export default function SignInPage() {
  const router = useRouter();

  const [formData, setFormData] = useState({ email: "", password: "" });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await signIn("credentials", {
        redirect: false,
        email: formData.email.toLowerCase(),
        password: formData.password,
      });

      if (res?.error === "EMAIL_NOT_VERIFIED") {
        toast.custom((t) => <EmailVerifyToast t={t} email={formData.email} />);
      } else if (res?.error === "INVALID_PASSWORD") {
        toast.error("Invalid password");
      } else if (res?.error === "USER_NOT_FOUND") {
        toast.error("User not found");
      }
      toast.success("Sign in successful");
      router.push("/todos");
    } catch (err) {
      setError("Something went wrong");
      toast.error("Something went wrong, " + err);
    }
  };

  // Authentication
  const { status } = useSession();
  if (status === "loading") return <Loading />;
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-lg shadow-md p-8">
        <h2 className="text-2xl font-bold text-center text-gray-800 dark:text-white mb-6">
          Sign in
        </h2>

        {error && (
          <div className="mb-4 text-sm text-red-500 text-center">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-100">
              Email address
            </label>
            <input
              name="email"
              type="email"
              required
              value={formData.email}
              onChange={handleChange}
              className="mt-1 w-full px-4 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-100">
              Password
            </label>
            <input
              name="password"
              type="password"
              required
              value={formData.password}
              onChange={handleChange}
              className="mt-1 w-full px-4 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>

          <div className="mt-2 text-right">
            <Link
              href="/forgot-password"
              className="text-sm text-blue-600 hover:underline"
            >
              Forgot password?
            </Link>
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition"
          >
            Sign in
          </button>
        </form>

        <p className="mt-4 text-sm text-center text-gray-600 dark:text-gray-300">
          Don&apos;t have an account?{" "}
          <a href="/sign-up" className="text-blue-600 hover:underline">
            Sign up
          </a>
        </p>
      </div>
    </div>
  );
}
