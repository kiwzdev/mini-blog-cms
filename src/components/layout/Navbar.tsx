"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import Image from "next/image";
import { getCloudinaryUrl } from "@/lib/image/cloudinary";
import { ThemeToggle } from "../ThemeToggle";

export default function MainNavbar() {
  const { data: session } = useSession();
  const [isOpen, setIsOpen] = useState(false);

  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <nav className="bg-transparent  px-4 py-3">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        {/* Logo / Web Name */}
        <Link
          href="/"
          className="text-3xl md:text-2xl font-bold text-gray-800 dark:text-gray-100"
        >
          Mini Blog
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center space-x-4">
          <ThemeToggle />
          {session?.user.role === "admin" && (
            <Link
              href="/admin/dashboard"
              className="text-gray-700 dark:text-gray-100 hover:text-blue-500"
            >
              Dashboard
            </Link>
          )}

          {session && (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setOpen((prev) => !prev)}
                className="focus:outline-none align-middle"
              >
                <Image
                  src={
                    session.user.profileImage
                      ? getCloudinaryUrl(session.user.profileImage)
                      : process.env.NEXT_PUBLIC_DEFAULT_POST_IMAGE!
                  }
                  alt="Profile"
                  width={30}
                  height={30}
                  className="rounded-full border w-9 h-9 object-none border-gray-300 dark:border-gray-600 shadow hover:ring-2 hover:ring-blue-400 transition"
                />
              </button>

              {open && (
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50">
                  <ul className="py-2 text-sm text-gray-700 dark:text-gray-100">
                    <li>
                      <Link
                        href={`/profile/${session.user.username}`}
                        className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        My Profile
                      </Link>
                    </li>
                    {session ? (
                      <li>
                        <button
                          className="block px-4 py-2 w-full text-left hover:bg-gray-100 dark:hover:bg-gray-70 cursor-pointer"
                          onClick={() => signOut()}
                        >
                          Log out
                        </button>
                      </li>
                    ) : (
                      <></>
                    )}
                  </ul>
                </div>
              )}
            </div>
          )}

          {!session && (
            <>
              <Link
                href="/auth/sign-in"
                className="text-gray-700 dark:text-gray-100 hover:text-blue-500"
              >
                Log in
              </Link>
              <Link
                href="/auth/sign-up"
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                Sign up
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <button className="md:hidden" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? (
            <X className="w-12 h-12 text-gray-800 dark:text-white" />
          ) : (
            <Menu className="w-12 h-12 text-gray-800 dark:text-white" />
          )}
        </button>
      </div>

      {/* Mobile Dropdown */}
      {isOpen && (
        <div className="md:hidden mt-4 space-y-2 text-center">
          {session && (
            <Link
              href={`/profile/${session.user.username}`}
              className="block text-gray-700 dark:text-gray-100 hover:text-blue-500 text-2xl py-4"
            >
              My Profile
            </Link>
          )}
          {session?.user.role === "admin" && (
            <Link
              href="/admin/dashboard"
              className="block text-gray-700 dark:text-gray-100 hover:text-blue-500 text-2xl py-4"
            >
              Dashboard
            </Link>
          )}
          {!session ? (
            <>
              <Link
                href="/sign-in"
                className="block text-gray-700 dark:text-gray-100 hover:text-blue-500 text-2xl py-4"
              >
                Log in
              </Link>
              <Link
                href="/sign-up"
                className="block bg-blue-500 text-white px-4 rounded hover:bg-blue-600 py-4 text-2xl"
              >
                Sign up
              </Link>
            </>
          ) : (
            <p
              className="block text-gray-700 dark:text-gray-100 hover:text-blue-500 cursor-pointer py-4 text-2xl"
              onClick={() => signOut()}
            >
              Log out
            </p>
          )}
        </div>
      )}
    </nav>
  );
}
