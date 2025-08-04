import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

// Skeleton Components
export const ProfileSkeleton = () => (
  <Card className="glass-card mb-8 border-0 shadow-xl">
    <CardContent className="p-6 md:p-8">
      <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
        <div className="flex flex-col justify-evenly lg:items-start gap-4">
          <Skeleton className="w-32 h-32 md:w-40 md:h-40 rounded-full mx-auto" />
          <Skeleton className="w-24 h-8 mx-auto" />
        </div>

        <div className="flex-1 space-y-4">
          <div className="text-center lg:text-left">
            <Skeleton className="h-8 w-48 mb-2 mx-auto lg:mx-0" />
            <Skeleton className="h-6 w-32 mb-2 mx-auto lg:mx-0" />
            <Skeleton className="h-5 w-64 mb-2 mx-auto lg:mx-0" />
          </div>
          <Skeleton className="h-16 w-full" />
          <div className="flex flex-wrap justify-center lg:justify-start gap-4">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-28" />
          </div>
        </div>

        <div className="flex lg:flex-col gap-6 lg:gap-4 justify-center lg:justify-start lg:min-w-[120px]">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="text-center">
              <Skeleton className="h-8 w-12 mb-1 mx-auto" />
              <Skeleton className="h-4 w-16 mx-auto" />
            </div>
          ))}
        </div>
      </div>
    </CardContent>
  </Card>
);
