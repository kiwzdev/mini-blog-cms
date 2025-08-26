"use client"

import { useTheme } from "next-themes"
import { FaSun, FaMoon } from "react-icons/fa"

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  return (
    <button
      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
      className="relative w-9 h-9 rounded-full border border-gray-300 shadow 
                 flex items-center justify-center
                 hover:ring-2 hover:ring-blue-400 transition
                 bg-white dark:bg-gray-800"
    >
      <FaSun className="absolute h-5 w-5 text-yellow-500 rotate-0 scale-100 dark:-rotate-90 dark:scale-0 transition-transform duration-300" />
      <FaMoon className="absolute h-5 w-5 text-blue-500 rotate-90 scale-0 dark:rotate-0 dark:scale-100 transition-transform duration-300" />
    </button>
  )
}
