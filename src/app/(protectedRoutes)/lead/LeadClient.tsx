"use client";

import type { LeadItem } from "@/actions/leads";
import {
  startTransition,
  useEffect,
  useMemo,
  useState,
  useTransition,
} from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

type Category = "ALL" | "COLD" | "WARM" | "HOT";

export default function LeadClient({
  initialData,
  initialCategory,
  initialIncludeConverted,
  initialQuery,
  initialPage,
  initialPageSize,
  total,
  totalPages,
}: {
  initialData: LeadItem[];
  initialCategory: Category;
  initialIncludeConverted: boolean;
  initialQuery: string;
  initialPage: number;
  initialPageSize: number;
  total: number;
  totalPages: number;
}) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const [isPending, startNav] = useTransition();

  // Optimistic local state for reliable UX
  const [localCategory, setLocalCategory] = useState<Category>(initialCategory);
  const [localInclude, setLocalInclude] = useState<boolean>(
    initialIncludeConverted
  );

  useEffect(() => setLocalCategory(initialCategory), [initialCategory]);
  useEffect(
    () => setLocalInclude(initialIncludeConverted),
    [initialIncludeConverted]
  );

  const buildAndPush = (updates: Record<string, string | null | undefined>) => {
    const before = new URLSearchParams(searchParams?.toString()).toString();
    const params = new URLSearchParams(before);
    Object.entries(updates).forEach(([k, v]) => {
      if (v === null || v === undefined || v === "") params.delete(k);
      else params.set(k, v);
    });
    startNav(() => {
      const qs = params.toString();
      // Only navigate if something actually changed
      if (qs !== before) {
        router.replace(qs ? `${pathname}?${qs}` : pathname);
        // Ensure server components re-render reliably
        router.refresh();
      }
    });
  };

  const updateUrl = (nextCategory: Category) => {
    setLocalCategory(nextCategory);
    buildAndPush({
      category: nextCategory === "ALL" ? null : nextCategory,
      page: "1",
    });
  };
  const updateSearch = (q: string) => {
    buildAndPush({ q: q || null, page: "1" });
  };
  const updateIncludeConverted = (include: boolean) => {
    setLocalInclude(!!include);
    buildAndPush({ includeConverted: include ? "true" : null, page: "1" });
  };
  const updatePage = (page: number) => {
    buildAndPush({ page: String(page) });
  };

  const onCategoryChange = (v: Category) => updateUrl(v);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="text-sm text-muted-foreground">Filter</div>
          <Select
            value={localCategory}
            onValueChange={(v) => onCategoryChange(v as Category)}
            disabled={isPending}
          >
            <SelectTrigger className="w-44">
              <SelectValue placeholder="All" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All</SelectItem>
              <SelectItem value="COLD">Cold Leads</SelectItem>
              <SelectItem value="WARM">Warm Leads</SelectItem>
              <SelectItem value="HOT">Hot Leads</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              Include Converted
            </span>
            <Switch
              checked={localInclude}
              onCheckedChange={(v) => updateIncludeConverted(!!v)}
              disabled={isPending}
            />
          </div>
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="text-sm text-muted-foreground">
              Name
            </TableHead>
            <TableHead className="text-sm text-muted-foreground">
              Email
            </TableHead>
            <TableHead className="text-sm text-muted-foreground">
              Phone
            </TableHead>
            <TableHead className="text-right text-sm text-muted-foreground">
              Tags
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {initialData.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={4}
                className="text-center text-muted-foreground"
              >
                No leads found
              </TableCell>
            </TableRow>
          ) : (
            initialData.map((lead, idx) => (
              <TableRow key={lead.id ?? idx} className="border-0">
                <TableCell className="font-medium">{lead?.name}</TableCell>
                <TableCell>{lead?.email}</TableCell>
                <TableCell>{lead?.phone || "—"}</TableCell>
                <TableCell className="text-right space-x-2">
                  {lead?.tags?.map((tag: string) => (
                    <Badge key={tag} variant="outline">
                      {tag}
                    </Badge>
                  ))}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      <Pagination className="mt-2">
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              href="#"
              onClick={(e) => {
                e.preventDefault();
                if (initialPage > 1) updatePage(initialPage - 1);
              }}
            />
          </PaginationItem>
          {/* Simple numbered pagination up to 7 buttons max */}
          {useMemo(() => {
            const items: number[] = [];
            const maxButtons = 7;
            let start = Math.max(1, initialPage - 3);
            let end = Math.min(totalPages, start + maxButtons - 1);
            start = Math.max(1, end - maxButtons + 1);
            for (let i = start; i <= end; i++) items.push(i);
            return items;
          }, [initialPage, totalPages]).map((p) => (
            <PaginationItem key={p}>
              <PaginationLink
                href="#"
                isActive={p === initialPage}
                onClick={(e) => {
                  e.preventDefault();
                  if (p !== initialPage) updatePage(p);
                }}
              >
                {p}
              </PaginationLink>
            </PaginationItem>
          ))}
          <PaginationItem>
            <PaginationNext
              href="#"
              onClick={(e) => {
                e.preventDefault();
                if (initialPage < totalPages) updatePage(initialPage + 1);
              }}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
}
