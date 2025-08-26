import { SmartNavigation } from "../Navbar/SmartNavbar";
import { ProfileSkeleton } from "./ProfileSkeleton";

// Separate skeleton component for better organization
export function ProfilePageSkeleton() {
  return (
    <>
      <SmartNavigation />
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <ProfileSkeleton />
        </div>
      </div>
    </>
  );
}