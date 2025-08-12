import Image from "next/image"
import Link from "next/link"
import { Skeleton } from "../ui/skeleton"
import { signOut } from "next-auth/react"
import { Session } from "next-auth"

export function UserMenu({ 
  isLoading, 
  session, 
  isAuthenticated, 
  open, 
  setOpen 
}: {
  isLoading: boolean
  session: Session
  isAuthenticated: boolean
  open: boolean
  setOpen: (open: boolean) => void
}) {
  if (isLoading) {
    return <Skeleton className="h-9 w-9 rounded-full" />
  }
  
  if (isAuthenticated) {
    return (
      <div className="relative">
        <button onClick={() => setOpen(!open)} className="focus:outline-none">
          <Image
            src={session.user.profileImage || process.env.NEXT_PUBLIC_DEFAULT_POST_IMAGE!}
            alt="Profile"
            width={30}
            height={30}
            className="rounded-full border w-9 h-9 object-cover border-gray-300 shadow hover:ring-2 hover:ring-blue-400 transition"
          />
        </button>
        
        {open && (
          <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 border rounded-lg shadow-lg z-50">
            <ul className="py-2 text-sm">
              <li>
                <Link 
                  href={`/profile/${session.user.username}`}
                  className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700"
                  onClick={() => setOpen(false)}
                >
                  My Profile
                </Link>
              </li>
              <li>
                <button 
                  className="block px-4 py-2 w-full text-left hover:bg-gray-100 dark:hover:bg-gray-700"
                  onClick={() => { setOpen(false); signOut() }}
                >
                  Log out
                </button>
              </li>
            </ul>
          </div>
        )}
      </div>
    )
  }
  
  return (
    <div className="flex items-center space-x-4">
      <Link href="/auth/sign-in" className="text-gray-700 dark:text-gray-100 hover:text-blue-500">
        Log in
      </Link>
      <Link href="/auth/sign-up" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
        Sign up
      </Link>
    </div>
  )
}