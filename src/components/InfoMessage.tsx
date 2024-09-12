import React from "react";
import { FileSpreadsheet } from "lucide-react";

// helpers
import { cn } from "@/lib/utils";

interface IInfoMessage extends React.HTMLAttributes<HTMLDivElement> {
  icon?: React.ReactNode;
  message?: React.ReactNode;
  iconWrapperClassName?: string;
}

function InfoMessage({ icon, message, className, iconWrapperClassName, ...rest }: IInfoMessage) {
  return (
    <div
      className={cn("flex p-8 flex-col items-center justify-center gap-4 text-base", className)}
      {...rest}
    >
      <span
        className={cn(
          "flex items-center justify-center w-14 h-14 bg-slate-200 border-slate-50 border-8 rounded-full",
          iconWrapperClassName
        )}
      >
        {icon || <FileSpreadsheet />}
      </span>
      {message || "No data"}
    </div>
  );
}

export default InfoMessage;
