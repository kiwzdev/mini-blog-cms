import { useNavigationState } from "@/hooks/useNavigationStore"
import Link from "next/link"
import { useState } from "react"
import { ThemeToggle } from "../ThemeToggle"
import { AdminLink } from "./AdminLink"
import { UserMenu } from "./UserMenu"
import { Menu, X } from "lucide-react"
import { MobileMenu } from "./MobileMenu"

export function SmartNavigation() {
  const { session, isLoading, isAuthenticated, isAdmin } = useNavigationState()
  const [open, setOpen] = useState(false)
  const [isOpen, setIsOpen] = useState(false)

  return (
    <nav className="bg-transparent px-4 py-3">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <Link href="/" className="text-3xl md:text-2xl font-bold text-gray-800 dark:text-gray-100">
          Mini Blog
        </Link>

        <div className="hidden md:flex items-center space-x-4">
          <ThemeToggle />
          
          {/* Admin Link with Loading */}
          <AdminLink isLoading={isLoading} isAdmin={isAdmin} />
          
          {/* User Menu with Loading */}
          <UserMenu 
            isLoading={isLoading} 
            session={session} 
            isAuthenticated={isAuthenticated}
            open={open}
            setOpen={setOpen}
          />
        </div>

        <button className="md:hidden" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X className="w-12 h-12" /> : <Menu className="w-12 h-12" />}
        </button>
      </div>

      {/* Mobile Menu */}
      <MobileMenu 
        isOpen={isOpen} 
        setIsOpen={setIsOpen}
        isLoading={isLoading}
        session={session}
        isAuthenticated={isAuthenticated}
        isAdmin={isAdmin}
      />
    </nav>
  )
}