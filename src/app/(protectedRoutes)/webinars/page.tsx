import { OnAuthenticateUser } from "@/actions/auth";
import { getWebinarsByPresenterId } from "@/actions/webinar";
import PageHeader from "@/components/ReusableComponents/PageHeader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Webinar, WebinarStatusEnum } from "@prisma/client";
import { HomeIcon, Users2, Webcam } from "lucide-react";
import { redirect } from "next/navigation";
import React from "react";
import WebianrCard from "./_components/WebianrCard";
import Link from "next/link";

type Props = {
  searchParams: Promise<{
    webinarStatus: string;
  }>;
};

const Page = async ({ searchParams }: Props) => {
  const { webinarStatus } = await searchParams;
  const checkUser = await OnAuthenticateUser();
  if (!checkUser || !checkUser.isAuthenticated || !checkUser.user) {
    redirect("/sign-in");
  }
  const webinars = await getWebinarsByPresenterId(
    checkUser.user.id,
    webinarStatus as WebinarStatusEnum
  );
  return (
    <Tabs
      value={webinarStatus || "all"}
      className="w-full flex flex-col  gap-8"
    >
      <PageHeader
        leftIcon={<HomeIcon className="w-3 h-3" />}
        mainIcon={<Webcam className="w-8 h-8" />}
        rightIcon={<Users2 className="w-3 h-3" />}
        heading="The home to all your webinars"
        placeholder="Search options..."
      >
        <TabsList className="bg-transparent space-x-3">
          <TabsTrigger
            value="all"
            className="bg-secondary opacity-70 data-[state=active]:opacity-100 px-8 py-4"
          >
            <Link href="/webinars?webinarStatus=all">All</Link>
          </TabsTrigger>
          <TabsTrigger
            value="upcoming"
            className="bg-secondary opacity-70 data-[state=active]:opacity-100 px-8 py-4"
          >
            <Link href="/webinars?webinarStatus=upcoming">Upcoming</Link>
          </TabsTrigger>
          <TabsTrigger
            value="ended"
            className="bg-secondary opacity-70 data-[state=active]:opacity-100 px-8 py-4"
          >
            <Link href="/webinars?webinarStatus=ended">Ended</Link>
          </TabsTrigger>
          <TabsTrigger
            value="live"
            className="bg-secondary opacity-70 data-[state=active]:opacity-100 px-8 py-4"
          >
            <Link href="/webinars?webinarStatus=live">Live</Link>
          </TabsTrigger>
        </TabsList>
      </PageHeader>

      <TabsContent
        value="all"
        className="w-full grid grid-cols-1 sm:grid-cols-3 xl:grid-cols-4 place-items-start place-content-start gap-x-6 gap-y-10"
      >
        {webinars?.length > 0 ? (
          webinars.map((webinar: Webinar, index: number) => (
            <WebianrCard key={index} webinar={webinar} />
          ))
        ) : (
          <div className="w-full h-[200px] flex justify-center items-center text-primary font-semibold text-2xl col-span-12">
            No webinars found
          </div>
        )}
      </TabsContent>
      <TabsContent
        value="upcoming"
        className="w-full grid grid-cols-1 sm:grid-cols-3 xl:grid-cols-4 place-items-start place-content-start gap-x-6 gap-y-10"
      >
        {webinars?.length > 0 ? (
          webinars.map((webinar: Webinar, index: number) => (
            <WebianrCard key={index} webinar={webinar} />
          ))
        ) : (
          <div className="w-full h-[200px] flex justify-center items-center text-primary font-semibold text-2xl col-span-12">
            No upcoming webinars found
          </div>
        )}
      </TabsContent>
      <TabsContent
        value="ended"
        className="w-full grid grid-cols-1 sm:grid-cols-3 xl:grid-cols-4 place-items-start place-content-start gap-x-6 gap-y-10"
      >
        {webinars?.length > 0 ? (
          webinars.map((webinar: Webinar, index: number) => (
            <WebianrCard key={index} webinar={webinar} />
          ))
        ) : (
          <div className="w-full h-[200px] flex justify-center items-center text-primary font-semibold text-2xl col-span-12">
            No ended webinars found
          </div>
        )}
      </TabsContent>
      <TabsContent
        value="live"
        className="w-full grid grid-cols-1 sm:grid-cols-3 xl:grid-cols-4 place-items-start place-content-start gap-x-6 gap-y-10"
      >
        {webinars?.length > 0 ? (
          webinars.map((webinar: Webinar, index: number) => (
            <WebianrCard key={index} webinar={webinar} />
          ))
        ) : (
          <div className="w-full h-[200px] flex justify-center items-center text-primary font-semibold text-2xl col-span-12">
            No live webinars found
          </div>
        )}
      </TabsContent>
    </Tabs>
  );
};

export default Page;
