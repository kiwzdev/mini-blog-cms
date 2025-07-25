import { Card, CardContent } from "@/components/ui/card";

function PostCardSkeleton() {
  return (
    <>
      {[...Array(6)].map((_, i) => (
        <Card key={i} className="glass-card overflow-hidden">
          <div className="h-48 bg-slate-200 dark:bg-slate-700 animate-pulse" />
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-slate-200 dark:bg-slate-700 rounded-full animate-pulse" />
              <div className="flex-1">
                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded animate-pulse mb-1" />
                <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded animate-pulse w-20" />
              </div>
            </div>
            <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded animate-pulse mb-3" />
            <div className="space-y-2 mb-4">
              <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
              <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded animate-pulse w-3/4" />
            </div>
            <div className="flex justify-between">
              <div className="flex gap-4">
                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded animate-pulse w-12" />
                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded animate-pulse w-12" />
              </div>
              <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded animate-pulse w-16" />
            </div>
          </CardContent>
        </Card>
      ))}
    </>
  );
}

export default PostCardSkeleton;
