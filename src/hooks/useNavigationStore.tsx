import { useSession } from "next-auth/react"

export function useNavigationState() {
  const { data: session, status } = useSession()
  
  const isLoading = status === 'loading'
  const isAuthenticated = !!session
  const isAdmin = session?.user?.role === 'admin'
  
  return {
    session,
    isLoading,
    isAuthenticated,
    isAdmin,
    shouldShowSkeleton: isLoading
  }
}