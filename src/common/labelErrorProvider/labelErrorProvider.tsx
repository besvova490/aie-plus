import React from "react";

// helpers
import { cn } from "@/lib/utils";

// assets
import "./label-error-provider.scss";

export interface ILabelErrorProvider {
  error?: string;
  children: React.ReactNode;
  label?: string;
  wrapperProps?: React.HTMLProps<HTMLDivElement>;
  labelPlacement?: "top" | "left" | "right";
}

export const LabelErrorProvider = (props: ILabelErrorProvider) => {
  const { error, children, label, labelPlacement = "top", wrapperProps = {} } = props;

  return (
    <div
      className={cn(
        "hdep-label-error-provider relative gap-1.5",
        wrapperProps?.className,
        { "hdep-label-error-provider_top": labelPlacement === "top" },
        { "hdep-label-error-provider_left": labelPlacement === "left" },
        { "hdep-label-error-provider_right": labelPlacement === "right" }
      )}
      {...wrapperProps}
    >
      {label && (
        <label className="hdep-label-error-provider__label text-sm text-slate-900">{label}</label>
      )}
      <div className="hdep-label-error-provider__field">{children}</div>
      {error && (
        <span className="hdep-label-error-provider__error text-sm text-red-500">{error}</span>
      )}
    </div>
  );
};
