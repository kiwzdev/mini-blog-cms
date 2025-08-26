import Link from "next/link"
import { Skeleton } from "../ui/skeleton"
import { signOut } from "next-auth/react"
import { Session } from "next-auth"

export function MobileMenu({ 
  isOpen, 
  setIsOpen, 
  isLoading, 
  session, 
  isAuthenticated, 
  isAdmin 
}: {
  isOpen: boolean
  setIsOpen: (open: boolean) => void
  isLoading: boolean
  session: Session | null
  isAuthenticated: boolean
  isAdmin: boolean
}) {
  if (!isOpen) return null
  
  return (
    <div className="md:hidden mt-4 space-y-2 text-center">
      {isLoading ? (
        <div className="space-y-4 py-4">
          <Skeleton className="h-8 w-32 mx-auto" />
          <Skeleton className="h-8 w-24 mx-auto" />
        </div>
      ) : isAuthenticated ? (
        <>
          <Link 
            href={`/profile/${session.user.username}`}
            className="block text-gray-700 dark:text-gray-100 hover:text-blue-500 text-2xl py-4 w-full"
            onClick={() => setIsOpen(false)}
          >
              My Profile
          </Link>
          {isAdmin && (
            <Link 
              href="/admin/dashboard"
              className="block text-gray-700 dark:text-gray-100 hover:text-blue-500 text-2xl py-4"
              onClick={() => setIsOpen(false)}
            >
              Dashboard
            </Link>
          )}
          <button 
            className="block text-gray-700 dark:text-gray-100 hover:text-blue-500 py-4 text-2xl w-full"
            onClick={() => { setIsOpen(false); signOut() }}
          >
            Log out
          </button>
        </>
      ) : (
        <>
          <Link 
            href="/auth/sign-in"
            className="block text-gray-700 dark:text-gray-100 hover:text-blue-500 text-2xl py-4"
            onClick={() => setIsOpen(false)}
          >
            Log in
          </Link>
          <Link 
            href="/auth/sign-up"
            className="block bg-blue-500 text-white px-4 rounded hover:bg-blue-600 py-4 text-2xl"
            onClick={() => setIsOpen(false)}
          >
            Sign up
          </Link>
        </>
      )}
    </div>
  )
}