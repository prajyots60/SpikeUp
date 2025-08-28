import React from "react";
import { Button } from "@/components/ui/button";
import { Share2 } from "lucide-react";
import { toast } from "sonner";

interface WebinarHeaderProps {
  onShare?: () => void;
}

const WebinarHeader: React.FC<WebinarHeaderProps> = ({ onShare }) => {
  const handleShare = async () => {
    try {
      await navigator.share({
        title: "Recorded Webinar",
        text: "Check out this recorded webinar",
        url: window.location.href,
      });
    } catch (error) {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied to clipboard!");
      console.log("Error sharing:", error);
    }

    onShare?.();
  };

  return (
    <div className="sticky top-0 z-40 bg-black/20 backdrop-blur-xl border-b border-white/10">
      <div className="w-full px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium text-gray-300">
              RECORDED WEBINAR
            </span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleShare}
            className="text-gray-300 hover:text-white hover:bg-white/10 transition-colors"
          >
            <Share2 className="h-4 w-4 mr-2" />
            Share
          </Button>
        </div>
      </div>
    </div>
  );
};

export default WebinarHeader;
