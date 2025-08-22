import { Info } from "lucide-react";
import React from "react";

type Props = {
  label: string;
  showInfo?: boolean;
  children: React.ReactNode;
};

const ConfigField = ({ label, showInfo, children }: Props) => {
  return (
    <div>
      <div className="flex items-center mb-2">
        <label className="font-medium">{label}</label>
        {showInfo && <Info className="h-4 w-4 text-neutral-400 ml-2" />}
      </div>
      {children}
    </div>
  );
};

export default ConfigField;
