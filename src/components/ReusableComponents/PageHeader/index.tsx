import React from "react";
import PurpleIcon from "../PurpleIcon";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

type Props = {
  heading?: string;
  leftIcon?: React.ReactNode;
  mainIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  placeholder?: string;
  children?: React.ReactNode;
};

const PageHeader = ({
  heading,
  leftIcon,
  mainIcon,
  rightIcon,
  placeholder,
  children,
}: Props) => {
  return (
    <div className="w-full flex flex-col gap-8">
      <div className="w-full flex justify-center sm:justify-between items-center gap-8 flex-wrap">
        <p className="text-primary text-4xl font-semibold">{heading}</p>
        <div className="relative md:mr-28">
          <PurpleIcon className="absolute -left-4 -top-3 -z-10 -rotate-45 py-3">
            {leftIcon}
          </PurpleIcon>
          <PurpleIcon className="z-10 backdrop-blur">{mainIcon}</PurpleIcon>
          <PurpleIcon className="absolute -right-4 -top-3 -z-10 rotate-45 py-3">
            {rightIcon}
          </PurpleIcon>
        </div>
      </div>

      <div className="w-full flex flex-col md:flex-row gap-6 items-center">
        <div className="w-full md:w-1/2 relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
          <Input
            type="text"
            placeholder={placeholder || "Search options..."}
            className="pl-10 rounded-md w-full"
          />
        </div>
        <div className="w-full md:w-1/2 overflow-x-auto">{children}</div>
      </div>
    </div>
  );
};

export default PageHeader;
