"use client";

import PageHeader from "@/components/ReusableComponents/PageHeader";
import { TabsList, TabsTrigger } from "@/components/ui/tabs";
import { HomeIcon, Users2, Webcam } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import React from "react";

const WebinarsHeaderClient = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const q = searchParams.get("q") || "";

  const updateSearch = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set("q", value);
    else params.delete("q");
    router.replace(`${pathname}?${params.toString()}`);
  };

  return (
    <PageHeader
      leftIcon={<HomeIcon className="w-3 h-3" />}
      mainIcon={<Webcam className="w-8 h-8" />}
      rightIcon={<Users2 className="w-3 h-3" />}
      heading="The home to all your webinars"
      placeholder="Search webinars..."
      onSearchChange={updateSearch}
      defaultSearchValue={q}
    >
      <TabsList className="bg-transparent space-x-3">
        <TabsTrigger
          value="all"
          className="bg-secondary opacity-70 data-[state=active]:opacity-100 px-8 py-4"
        >
          <Link href={`/webinars?webinarStatus=all&q=${encodeURIComponent(q)}`}>
            All
          </Link>
        </TabsTrigger>
        <TabsTrigger
          value="upcoming"
          className="bg-secondary opacity-70 data-[state=active]:opacity-100 px-8 py-4"
        >
          <Link
            href={`/webinars?webinarStatus=upcoming&q=${encodeURIComponent(q)}`}
          >
            Upcoming
          </Link>
        </TabsTrigger>
        <TabsTrigger
          value="ended"
          className="bg-secondary opacity-70 data-[state=active]:opacity-100 px-8 py-4"
        >
          <Link
            href={`/webinars?webinarStatus=ended&q=${encodeURIComponent(q)}`}
          >
            Ended
          </Link>
        </TabsTrigger>
        <TabsTrigger
          value="live"
          className="bg-secondary opacity-70 data-[state=active]:opacity-100 px-8 py-4"
        >
          <Link
            href={`/webinars?webinarStatus=live&q=${encodeURIComponent(q)}`}
          >
            Live
          </Link>
        </TabsTrigger>
      </TabsList>
    </PageHeader>
  );
};

export default WebinarsHeaderClient;
