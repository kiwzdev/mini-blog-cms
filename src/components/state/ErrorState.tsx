import { AlertCircle } from "lucide-react";
import { AlertDialog, AlertDialogDescription } from "../ui/alert-dialog";
import { Button } from "../ui/button";
import { SmartNavigation } from "../Navbar/SmartNavbar";

export const ErrorState = ({
  error,
  onRetry,
}: {
  error: any;
  onRetry: () => void;
}) => (
  <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
    <SmartNavigation />
    <div className="max-w-6xl mx-auto px-4 py-8">
      <AlertDialog>
        <AlertCircle className="h-4 w-4" />
        <AlertDialogDescription className="ml-2">
          {error?.message || "เกิดข้อผิดพลาดในการโหลดข้อมูล"}
        </AlertDialogDescription>
        <Button onClick={onRetry} size="sm" className="mt-3">
          ลองใหม่
        </Button>
      </AlertDialog>
    </div>
  </div>
);
