import { useState } from "react";
import { Share2, Copy, Facebook, Twitter, Link } from "lucide-react";
import { Button } from "@/components/ui/button";

type ShareButtonProps = {
  url: string;
  title: string;
  description?: string;
  size?: "sm" | "md" | "lg";
};

export function ShareButton({
  url,
  title,
  description = "",
  size = "md",
}: ShareButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const shareData = {
    title,
    text: description,
    url,
  };

  // Native Share API (สำหรับ mobile)
  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (error) {
        console.log("Share cancelled");
      }
    } else {
      setIsOpen(!isOpen);
    }
  };

  // Copy to clipboard
  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy:", error);
    }
  };

  // Social media share URLs
  const shareUrls = {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
    twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`,
    line: `https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`,
  };

  const openShareWindow = (shareUrl: string) => {
    window.open(shareUrl, 'share', 'width=600,height=400');
    setIsOpen(false);
  };

  const sizeClass = {
    sm: "w-4 h-4",
    md: "w-6 h-6", 
    lg: "w-8 h-8"
  };

  const textSizeClass = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg"
  };

  return (
    <div className="relative">
      <button 
        onClick={handleNativeShare}
        className="flex items-center gap-2 cursor-pointer transition-colors duration-200 hover:text-blue-500"
        disabled={false}
      >
        <Share2 className={`${sizeClass[size]} text-gray-500 hover:text-blue-500 transition-colors duration-200`} />
        <span className={`${textSizeClass[size]} text-gray-500 hover:text-blue-500 transition-colors duration-200`}>
          แชร์
        </span>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Menu */}
          <div className="absolute top-full left-0 mt-2 w-48 bg-white rounded-lg shadow-lg border z-50 py-2">
            
            {/* Copy Link */}
            <button
              onClick={copyToClipboard}
              className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-3 text-sm"
            >
              <Copy className="w-4 h-4 text-gray-500" />
              <span>{copied ? "คัดลอกแล้ว!" : "คัดลอกลิงก์"}</span>
            </button>

            <div className="border-t my-2" />

            {/* Facebook */}
            <button
              onClick={() => openShareWindow(shareUrls.facebook)}
              className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-3 text-sm"
            >
              <div className="w-4 h-4 bg-blue-600 rounded-sm flex items-center justify-center">
                <span className="text-white text-xs font-bold">f</span>
              </div>
              <span>แชร์ใน Facebook</span>
            </button>

            {/* Twitter */}
            <button
              onClick={() => openShareWindow(shareUrls.twitter)}
              className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-3 text-sm"
            >
              <div className="w-4 h-4 bg-black rounded-sm flex items-center justify-center">
                <span className="text-white text-xs font-bold">𝕏</span>
              </div>
              <span>แชร์ใน X (Twitter)</span>
            </button>

            {/* LINE */}
            <button
              onClick={() => openShareWindow(shareUrls.line)}
              className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-3 text-sm"
            >
              <div className="w-4 h-4 bg-green-500 rounded-sm flex items-center justify-center">
                <span className="text-white text-xs font-bold">L</span>
              </div>
              <span>แชร์ใน LINE</span>
            </button>
          </div>
        </>
      )}
    </div>
  );
}