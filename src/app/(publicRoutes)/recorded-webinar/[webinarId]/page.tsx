import { notFound, redirect } from "next/navigation";
import { getRecordedWebinarById } from "@/actions/webinar";
import RecordedWebinarPlayer from "./_components/RecordedWebinarPlayer";

interface RecordedWebinarPageProps {
  params: Promise<{
    webinarId: string;
  }>;
}

const RecordedWebinarPage = async ({ params }: RecordedWebinarPageProps) => {
  const { webinarId } = await params;

  const result = await getRecordedWebinarById(webinarId);

  // Handle different response cases
  if (result.status === 404) {
    notFound();
  }

  if (result.status === 400 && result.redirectTo) {
    redirect(result.redirectTo);
  }

  if (result.status !== 200 || !result.webinar) {
    notFound();
  }

  return (
    <div className="min-h-screen w-full ">
      <RecordedWebinarPlayer webinar={result.webinar} />
    </div>
  );
};

export default RecordedWebinarPage;
