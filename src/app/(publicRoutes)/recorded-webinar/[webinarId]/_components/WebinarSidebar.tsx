import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DollarSignIcon, User } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { createCheckoutLink } from "@/actions/stripe";
import { RecordedWebinarData } from "@/lib/type";
import { OnAuthenticateUser } from "@/actions/auth";

interface WebinarSidebarProps {
  webinar: RecordedWebinarData;
}

const WebinarSidebar: React.FC<WebinarSidebarProps> = ({ webinar }) => {
  const checkOutLink = async () => {
    try {
      if (!webinar?.priceId || !webinar?.presenter?.stripeConnectId) {
        return toast.error("No pricing information available");
      }

      const { user } = await OnAuthenticateUser();

      if (!user) {
        return toast.error("You need to be logged in to proceed");
      }

      const session = await createCheckoutLink(
        webinar.priceId,
        webinar.presenter.stripeConnectId,
        user?.clerkId,
        webinar.id
      );

      if (!session.sessionUrl) {
        throw new Error("Session URL not found");
      }

      window.open(session.sessionUrl, "_blank");
      toast.success("Redirecting to checkout...");
    } catch (error) {
      console.error("Error creating checkout link:", error);
      toast.error("Failed to create checkout link");
    }
  };

  return (
    <div className="space-y-6">
      {/* Presenter Card */}
      <Card className="bg-gradient-to-br from-gray-900/50 to-gray-800/30 border-gray-700/50 backdrop-blur-sm">
        <div className="p-6">
          <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
            <div className="w-1 h-4 bg-blue-500 rounded-full"></div>
            Presenter
          </h3>
          <div className="flex items-center gap-4">
            <div className="relative">
              <Avatar className="h-14 w-14 ring-2 ring-indigo-500/30">
                <AvatarImage src={webinar.presenter.profileImage} />
                <AvatarFallback className="bg-gradient-to-br from-indigo-600 to-blue-600 text-white">
                  <User className="h-6 w-6" />
                </AvatarFallback>
              </Avatar>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-gray-900"></div>
            </div>
            <div>
              <p className="font-semibold text-white">
                {webinar.presenter.name}
              </p>
              <p className="text-sm text-indigo-300">Webinar Host</p>
            </div>
          </div>
        </div>
      </Card>

      {/* CTA Section */}
      {webinar.ctaLabel && webinar.ctaUrl && (
        <Card className="bg-gradient-to-br from-indigo-600 via-blue-600 to-indigo-700 border-none shadow-2xl shadow-indigo-500/25">
          <div className="p-6">
            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-white/20 flex items-center justify-center">
                <span className="text-2xl">🚀</span>
              </div>
              <h3 className="font-bold text-white mb-2">
                Ready to take action?
              </h3>
              <p className="text-indigo-100 text-sm mb-4">
                Don&apos;t let this opportunity slip away
              </p>
              <Button
                asChild
                className="w-full bg-white text-indigo-600 hover:bg-gray-100 font-semibold shadow-lg transition-all duration-200 hover:scale-105"
              >
                <a
                  href={webinar.ctaUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {webinar.ctaLabel}
                </a>
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Stats Card */}
      <Card className="bg-gray-900/30 border-gray-700/50 backdrop-blur-sm">
        <div className="p-6">
          <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
            <div className="w-1 h-4 bg-green-500 rounded-full"></div>
            Details
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between py-2 border-b border-gray-800/50">
              <span className="text-gray-400 text-sm">Duration</span>
              <span className="text-white font-medium">
                {webinar.duration}m
              </span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-gray-800/50">
              <span className="text-gray-400 text-sm">Date</span>
              <span className="text-white font-medium">
                {format(new Date(webinar.startTime), "MMM dd")}
              </span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-gray-800/50">
              <span className="text-gray-400 text-sm">Type</span>
              <span className="text-green-400 font-medium">Pre-recorded</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-gray-400 text-sm">Quality</span>
              <span className="text-blue-400 font-medium">HD</span>
            </div>
          </div>
        </div>
      </Card>

      {/* Quick Actions */}
      <Card className="bg-gray-900/30 border-gray-700/50 backdrop-blur-sm">
        <div className="p-4">
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="text-gray-300 hover:text-white hover:bg-gray-800/50 transition-colors"
            >
              <span className="mr-2">📖</span>
              Transcript
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={checkOutLink}
              className="text-gray-300 hover:text-white hover:bg-gray-800/50 transition-colors"
            >
              <span className="mr-2">
                <DollarSignIcon className="h-4 w-4" />
              </span>
              Buy Now
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default WebinarSidebar;
