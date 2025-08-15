import UserInfoCard from "@/components/ReusableComponents/UserInfoCard";
import { Badge } from "@/components/ui/badge";
import { Attendee } from "@prisma/client";
import React from "react";

type Props = {
  title: string;
  count: number;
  users: Attendee[];
  tags: string[];
};

const PipelineLayout = ({ title, count, users, tags }: Props) => {
  return (
    <div className="group flex-shrink-0 w-[380px] h-[600px]">
      {/* Main Container */}
      <div className="relative h-full p-6 border border-border/50 bg-gradient-to-b from-background/80 to-background/40 rounded-2xl backdrop-blur-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:border-border/80 flex flex-col">
        {/* Primary gradient overlay - always visible */}
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/5 to-primary/2 transition-opacity duration-300" />

        {/* Header Section */}
        <div className="relative flex items-center justify-between mb-6 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-2 h-8 bg-gradient-to-b from-primary to-primary/60 rounded-full" />
            <h2 className="font-semibold text-lg text-foreground">{title}</h2>
          </div>
          <Badge
            variant="secondary"
            className="bg-primary/10 text-primary border-primary/20 hover:bg-primary/15 transition-colors duration-200 px-3 py-1 text-sm font-medium"
          >
            {count}
          </Badge>
        </div>

        {/* Content Section */}
        <div className="relative flex-1 flex flex-col min-h-0">
          {users.length > 0 ? (
            <div className="flex-1 overflow-hidden">
              <div className="h-full overflow-y-auto pr-2 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-border/30 hover:scrollbar-thumb-border/50">
                <div className="space-y-4 pb-4">
                  {users.map((user, index) => (
                    <div
                      key={user.id || index}
                      className="transform transition-all duration-200 hover:scale-[1.02]"
                    >
                      <UserInfoCard
                        customer={user}
                        tags={tags}
                        className="w-full"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 rounded-full bg-muted/30 flex items-center justify-center mb-4">
                <svg
                  className="w-8 h-8 text-muted-foreground/50"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
              </div>
              <p className="text-muted-foreground font-medium mb-1">
                No attendees yet
              </p>
              <p className="text-sm text-muted-foreground/60">
                Users will appear here as they join
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PipelineLayout;
