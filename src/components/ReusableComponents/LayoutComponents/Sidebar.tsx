"use client";

import { usePathname } from "next/navigation";
import React from "react";
import { sidebarData } from "@/lib/data";
import { Triangle } from "lucide-react";
import Link from "next/link";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { UserButton } from "@clerk/nextjs";
import PurpleIcon from "../PurpleIcon";

const Sidebar = () => {
  const pathname = usePathname();
  return (
    <div className="w-18 sm:w-28 h-screen sticky top-0 py-10 px-2 sm:px-6 border bg-background border-border flex flex-col items-center justify-start gap-10">
      <div className="group cursor-pointer relative">
        <PurpleIcon className="relative overflow-hidden group-hover:shadow-2xl group-hover:shadow-primary/25 transition-all duration-500">
          {/* Main Triangle Icon */}
          <Triangle className="w-7 h-7 animate-pulse group-hover:animate-none group-hover:scale-110 transition-all duration-300 ease-in-out fill-primary/20 stroke-2" />

          {/* Rotating ring around the icon */}
          <div
            className="absolute inset-0 border-2 border-primary/30 rounded-full animate-spin opacity-20 group-hover:opacity-60 transition-opacity duration-300"
            style={{ animationDuration: "8s" }}
          ></div>

          {/* Inner pulsing circle */}
          <div className="absolute inset-2 bg-gradient-to-br from-primary/20 via-primary/10 to-primary/5 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 animate-pulse"></div>

          {/* Brand spotlight effect */}
          {/* <div className="absolute top-0 left-0 w-2 h-2 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full animate-ping opacity-60"></div> */}

          {/* Live indicator dot */}
          {/* <div className="absolute bottom-0 right-0 w-2 h-2 bg-green-500 rounded-full animate-pulse border border-background"></div> */}

          {/* Spotlight beam effect */}
          <div className="absolute -top-1 left-1/2 w-0.5 h-3 bg-gradient-to-t from-primary/60 to-transparent transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        </PurpleIcon>
      </div>
      <div className="w-full h-full flex flex-col justify-between items-center">
        <div className="w-full h-fit flex flex-col gap-4 items-center justify-center">
          {sidebarData.map((item) => (
            <TooltipProvider key={item.id}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Link
                    href={item.link}
                    className={`flex items-center gap-2 cursor-pointer rounded-lg p-2 ${
                      pathname.includes(item.link) ? "iconBackground" : ""
                    }`}
                  >
                    <item.icon
                      className={`w-4 h-4 ${
                        pathname.includes(item.link) ? "" : "opacity-80"
                      }`}
                    />
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="right">
                  <span className="font-semibold text-sm">{item.title}</span>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ))}
        </div>
        <UserButton />
      </div>
    </div>
  );
};

export default Sidebar;
