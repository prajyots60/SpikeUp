import PageHeader from "@/components/ReusableComponents/PageHeader";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ListTree, Users2, Webcam } from "lucide-react";
import React from "react";
import { leadData } from "./_tests_/data";

type Props = {};

const page = (props: Props) => {
  return (
    <div className="w-full flex flex-col gap-8">
      <PageHeader
        heading="The home to all your customers"
        leftIcon={<Webcam className="w-3 h-3" />}
        mainIcon={<Users2 className="w-8 h-8" />}
        rightIcon={<ListTree className="w-3 h-3" />}
        placeholder="Search for a customer, lead, or opportunity..."
      />
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
          {leadData?.map((lead, idx) => (
            <TableRow key={idx} className="border-0">
              <TableCell className="font-medium">{lead?.name}</TableCell>
              <TableCell>{lead?.email}</TableCell>
              <TableCell>{lead?.phone}</TableCell>
              <TableCell className="text-right">
                {lead?.tags?.map((tag, idx) => (
                  <Badge key={idx} variant="outline">
                    {tag}
                  </Badge>
                ))}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default page;
