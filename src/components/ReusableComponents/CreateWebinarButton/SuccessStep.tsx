import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Check, Copy, ExternalLink, PlusCircle } from "lucide-react";
import Link from "next/link";
import React, { useState } from "react";

type Props = {
  webinarLink: string;
  onCreateNew?: () => void;
  onClose?: () => void;
};

const SuccessStep = ({ webinarLink, onCreateNew, onClose }: Props) => {
  const [copied, setCopied] = useState(false);
  const handleCopyLink = () => {
    navigator.clipboard.writeText(webinarLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000); // Reset copied state after 2 seconds
  };
  return (
    <div className="relative text-center space-y-6 py-8 px-6">
      <div className="flex items-center justify-center">
        <div className="bg-green-500 rounded-full p-2">
          <Check className="h-6 w-6 text-primary" />
        </div>
      </div>
      <h2 className="text-2xl font-bold">Your webinar has been created.</h2>
      <p className="text-foreground">
        You can share the below link with your audience to join them.
      </p>

      <div className="flex mt-4 max-w-md mx-auto">
        <Input
          value={webinarLink}
          readOnly
          className="rounded-r-none bg-muted border-input"
        />

        <Button
          onClick={handleCopyLink}
          variant="outline"
          className="rounded-l-none border-l-0 border-gray-800"
        >
          {copied ? (
            <Check className="h-4 w-4" />
          ) : (
            <Copy className="h-4 w-4" />
          )}
        </Button>
      </div>

      <div className="mt-4 flex justify-center ">
        <Link href={webinarLink} target="_blank">
          <Button
            variant="outline"
            className="border-muted text-primary hover:bg-input"
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            Preview Webinar
          </Button>
        </Link>
      </div>
      {onCreateNew && (
        <div className="mt-8">
          <Button
            variant="outline"
            onClick={onCreateNew}
            className="border-gray-700 text-white hover:bg-gray-800"
          >
            <PlusCircle className="h-4 w-4 mr-2" />
            Create Another Webinar
          </Button>
        </div>
      )}
    </div>
  );
};

export default SuccessStep;
