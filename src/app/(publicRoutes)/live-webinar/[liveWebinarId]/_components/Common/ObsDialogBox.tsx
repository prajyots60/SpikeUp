import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Copy } from "lucide-react";
import React from "react";
import { toast } from "sonner";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  rtmpURL: string;
  streamKey: string;
};

const ObsDialogBox = ({ open, onOpenChange, rtmpURL, streamKey }: Props) => {
  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(`${label} copied to clipboard!`);
    } catch (error) {
      console.error(`Failed to copy ${label}:`, error);
      toast.error(`Failed to copy ${label}. Please try again.`);
    }
  };
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>OBS Streaming Credentials</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              RTMP URL
            </label>
            <div className="flex">
              <Input
                type="text"
                value={rtmpURL}
                readOnly
                className="border border-border rounded-md p-2 w-full"
              />
              <Button
                variant={"outline"}
                size={"icon"}
                className="ml-2"
                onClick={() => copyToClipboard(rtmpURL, "RTMP URL")}
              >
                <Copy size={16} />
              </Button>
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              Stream Key
            </label>
            <div className="flex">
              <Input
                type="password"
                value={streamKey}
                readOnly
                className="border border-border rounded-md p-2 w-full"
              />
              <Button
                variant={"outline"}
                size={"icon"}
                className="ml-2"
                onClick={() => copyToClipboard(streamKey, "Stream Key")}
              >
                <Copy size={16} />
              </Button>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              This is your unique stream key. Keep it safe and don&#39;t share
              it with anyone.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ObsDialogBox;
