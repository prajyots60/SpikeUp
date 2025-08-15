import { cn } from "@/lib/utils";
import { Attendee } from "@prisma/client";
import React from "react";

type Props = {
  customer: Attendee;
  tags: string[];
  className?: string;
};

const UserInfoCard = ({ customer, tags, className }: Props) => {
  return (
    <div
      className={cn(
        "group relative flex flex-col w-full max-w-sm text-primary p-6 gap-4 rounded-2xl border border-border/50 backdrop-blur-[20px] bg-gradient-to-br from-secondary/80 to-secondary/40 shadow-lg hover:shadow-xl transition-all duration-300 hover:border-border ",
        className
      )}
    >
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      {/* User Info Section */}
      <div className="relative space-y-2">
        <div className="flex items-center gap-3">
          {/* Avatar placeholder - you can replace with actual avatar */}
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center border border-primary/20">
            <span className="text-sm font-semibold text-primary">
              {customer.name?.charAt(0)?.toUpperCase() || "U"}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-base text-foreground truncate">
              {customer.name}
            </h3>
            <p className="text-sm text-muted-foreground truncate">
              {customer.email}
            </p>
          </div>
        </div>
      </div>

      {/* Tags Section */}
      {tags && tags.length > 0 && (
        <div className="relative">
          <div className="flex gap-2 flex-wrap">
            {tags.map((tag, index) => (
              <span
                key={index}
                className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-primary/80 bg-primary/10 border border-primary/20 rounded-full hover:bg-primary/15 hover:border-primary/30 transition-colors duration-200"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default UserInfoCard;
