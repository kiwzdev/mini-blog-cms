import Link from "next/link"
import { Skeleton } from "../ui/skeleton"

export function AdminLink({ isLoading, isAdmin }: { isLoading: boolean, isAdmin: boolean }) {
  if (isLoading) {
    return <Skeleton className="h-5 w-20" />
  }
  
  if (!isAdmin) return null
  
  return (
    <Link href="/admin/dashboard" className="text-gray-700 dark:text-gray-100 hover:text-blue-500">
      Dashboard
    </Link>
  )
}