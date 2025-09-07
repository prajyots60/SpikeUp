import React from "react";
import { getLeadsForCurrentUser } from "@/actions/leads";
import LeadClient from "./LeadClient";
import LeadHeaderClient from "./LeadHeaderClient";

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

export default async function Page(props: { searchParams: SearchParams }) {
  const searchParams = await props.searchParams;
  const cat = (searchParams?.["category"] as string) || "ALL";
  const category = ["ALL", "COLD", "WARM", "HOT"].includes(cat)
    ? (cat as any)
    : "ALL";
  const includeConverted =
    (searchParams?.["includeConverted"] as string) === "true";
  const q = (searchParams?.["q"] as string) || "";
  const page = Number(searchParams?.["page"] || 1) || 1;
  const pageSize = Number(searchParams?.["pageSize"] || 50) || 50;

  const res = await getLeadsForCurrentUser({
    category,
    includeConverted,
    query: q,
    page,
    pageSize,
  });
  const leadData = res.success ? res.data : [];
  return (
    <div className="w-full flex flex-col gap-8">
      <LeadHeaderClient defaultQuery={q} />

      <LeadClient
        initialData={leadData}
        initialCategory={category}
        initialIncludeConverted={includeConverted}
        initialQuery={q}
        initialPage={res.success ? res.page : 1}
        initialPageSize={res.success ? res.pageSize : 20}
        total={res.success ? res.total : 0}
        totalPages={res.success ? res.totalPages : 1}
      />
    </div>
  );
}
