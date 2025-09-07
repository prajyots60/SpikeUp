"use client";

import PageHeader from "@/components/ReusableComponents/PageHeader";
import { ListTree, Users2, Webcam } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { startTransition } from "react";

export default function LeadHeaderClient({
  defaultQuery,
}: {
  defaultQuery: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const updateQuery = (value: string) => {
    const params = new URLSearchParams(searchParams?.toString());
    const current = params.get("q") || "";
    if (!value) params.delete("q");
    else params.set("q", value);
    // reset page when searching
    params.set("page", "1");
    startTransition(() => {
      const qs = params.toString();
      // Avoid redundant replaces that can cause repeated RSC fetches
      if (value !== current) {
        router.replace(qs ? `${pathname}?${qs}` : pathname);
      }
    });
  };

  return (
    <PageHeader
      heading="The home to all your customers"
      leftIcon={<Webcam className="w-3 h-3" />}
      mainIcon={<Users2 className="w-8 h-8" />}
      rightIcon={<ListTree className="w-3 h-3" />}
      placeholder="Search for a customer, lead, or opportunity..."
      defaultSearchValue={defaultQuery}
      onSearchChange={updateQuery}
      debounceMs={400}
    />
  );
}
