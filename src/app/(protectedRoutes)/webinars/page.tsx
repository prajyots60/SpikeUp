import { OnAuthenticateUser } from "@/actions/auth";
import { getWebinarsByPresenterId } from "@/actions/webinar";
import WebinarsHeaderClient from "./WebinarsHeaderClient";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { Webinar, WebinarStatusEnum } from "@prisma/client";

import { redirect } from "next/navigation";
import React from "react";
import WebianrCard from "./_components/WebianrCard";

type Props = {
  searchParams: Promise<{
    webinarStatus?: string;
    q?: string;
  }>;
};

const Page = async ({ searchParams }: Props) => {
  const { webinarStatus, q } = await searchParams;
  const checkUser = await OnAuthenticateUser();
  if (!checkUser || !checkUser.isAuthenticated || !checkUser.user) {
    redirect("/sign-in");
  }
  const webinars = await getWebinarsByPresenterId(
    checkUser.user.id,
    (webinarStatus as WebinarStatusEnum) || "all",
    q || ""
  );
  return (
    <Tabs
      value={webinarStatus || "all"}
      className="w-full flex flex-col  gap-8"
    >
      <WebinarsHeaderClient />

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
