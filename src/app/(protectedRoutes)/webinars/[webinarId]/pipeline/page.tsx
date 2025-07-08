// import { getWebinarAttendance } from "@/actions/attendance";
import PageHeader from "@/components/ReusableComponents/PageHeader";
import { HomeIcon, ListTree, Users2 } from "lucide-react";
import React from "react";
import { formatColumnTitle } from "./_components/utils";
import { AttendedTypeEnum } from "@prisma/client";
import PipelineLayout from "./_components/PipelineLayout";
import { getWebinarAttendance } from "./_tests_/data";

type Props = {
  params: Promise<{
    webinarId: string;
  }>;
};

const page = async ({ params }: Props) => {
  const { webinarId } = await params;
  const pipelineData = await getWebinarAttendance(webinarId);
  if (!pipelineData.data) {
    return (
      <div className="w-full h-[200px] flex justify-center items-center text-primary font-semibold text-2xl">
        {pipelineData.message}
      </div>
    );
  }
  return (
    <div className="w-full flex flex-col gap-8">
      <PageHeader
        heading="Keep track of your customers"
        leftIcon={<Users2 className="w-3 h-3" />}
        mainIcon={<ListTree className="w-8 h-8" />}
        rightIcon={<HomeIcon className="w-3 h-3" />}
        placeholder="Search Name, Tag or Email..."
      />
      <div className="flex overflow-x-auto pb-4 gap-4 md:gap-6">
        {Object.entries(pipelineData.data).map(([columnType, columnData]) => (
          <PipelineLayout
            key={columnType}
            title={formatColumnTitle(columnType as AttendedTypeEnum)}
            count={columnData.count}
            users={columnData.users}
            tags={pipelineData.webinarTags}
          />
        ))}
      </div>
    </div>
  );
};

export default page;
