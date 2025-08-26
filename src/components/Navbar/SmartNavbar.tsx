import { useNavigationState } from "@/hooks/useNavigationStore";
import Link from "next/link";
import { useState } from "react";
import { ThemeToggle } from "./ThemeToggle";
import { AdminLink } from "./AdminLink";
import { UserMenu } from "./UserMenu";
import { Menu, X } from "lucide-react";
import { MobileMenu } from "./MobileMenu";

export function SmartNavigation() {
  const { session, isLoading, isAuthenticated, isAdmin } = useNavigationState();
  const [open, setOpen] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Navigation Container with Glassmorphism */}
      <nav className="sticky top-0 z-50 backdrop-blur-xl bg-white/80 dark:bg-slate-900/80 border-b border-blue-100/20 dark:border-blue-800/20 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            {/* Logo */}
            <Link
              href="/"
              className="group flex items-center space-x-3 text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 dark:from-blue-400 dark:to-blue-600 bg-clip-text text-transparent hover:from-blue-700 hover:to-blue-900 dark:hover:from-blue-300 dark:hover:to-blue-500 transition-all duration-300"
            >
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-500 to-blue-700 dark:from-blue-400 dark:to-blue-600 rounded-xl shadow-lg group-hover:shadow-blue-500/25 group-hover:scale-105 transition-all duration-300 flex items-center justify-center">
                <span className="text-white text-sm sm:text-base font-bold">
                  M
                </span>
              </div>
              <span className="hidden sm:block">Mini Blog</span>
              <span className="block sm:hidden">MB</span>
            </Link>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center space-x-6">
              {/* Theme Toggle */}
              <ThemeToggle />

              {/* Admin Link */}
              <AdminLink isLoading={isLoading} isAdmin={isAdmin} />

              {/* User Menu */}
              <UserMenu
                isLoading={isLoading}
                session={session}
                isAuthenticated={isAuthenticated}
                open={open}
                setOpen={setOpen}
              />
            </div>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden relative p-2 rounded-xl bg-blue-50 dark:bg-slate-800 hover:bg-blue-100 dark:hover:bg-slate-700 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-slate-600 shadow-sm hover:shadow-md hover:scale-105 transition-all duration-200 active:scale-95"
              onClick={() => setIsOpen(!isOpen)}
              aria-label="Toggle mobile menu"
            >
              <div className="w-6 h-6 flex items-center justify-center">
                {isOpen ? (
                  <X className="w-5 h-5 transform transition-transform duration-200" />
                ) : (
                  <Menu className="w-5 h-5 transform transition-transform duration-200" />
                )}
              </div>

              {/* Animated background */}
              <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500/10 to-blue-600/10 dark:from-blue-400/10 dark:to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
            </button>
          </div>
        </div>

        {/* Mobile Menu Overlay */}
        {isOpen && (
          <div
            className="fixed inset-0 bg-black/20 dark:bg-black/40 backdrop-blur-sm z-40 md:hidden"
            onClick={() => setIsOpen(false)}
          />
        )}
      </nav>

      {/* Mobile Menu */}
      <MobileMenu
        isOpen={isOpen}
        setIsOpen={setIsOpen}
        isLoading={isLoading}
        session={session}
        isAuthenticated={isAuthenticated}
        isAdmin={isAdmin}
      />

      {/* Additional CSS for smooth animations */}
      <style jsx>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-slide-down {
          animation: slideDown 0.2s ease-out;
        }
      `}</style>
    </>
  );
}
