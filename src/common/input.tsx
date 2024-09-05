import React, { useState } from "react"
import { Eye, EyeOff } from "lucide-react";

// components
import { LabelErrorProvider } from "./labelErrorProvider";

// helpers
import { cn } from "@/lib/utils"

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "value"> {
  label?: string;
  error?: string;
  wrapperProps?: React.HTMLProps<HTMLDivElement>;
  value?: string | null;
  readonly?: boolean;
  fullWidth?: boolean;
  addonBefore?: React.ReactNode;
}


const Input = React.forwardRef<HTMLInputElement, InputProps>((props, ref) => {
  const { className, type, label, error, wrapperProps, value, readonly, fullWidth, addonBefore, ...rest } = props;

  const [showPassword, setShowPassword] = useState(false);

  return (
    <LabelErrorProvider
      error={error}
      label={label}
      wrapperProps={wrapperProps}
    >
      <div className={cn("relative", fullWidth ? "w-full" : "w-[320px]")}>
        {
          addonBefore && (
            <div className="absolute left-3 top-0 h-full flex items-center text-slate-400">
              {addonBefore}
            </div>
          )
        }
        <input
          type={showPassword ? "text" : type}
          className={cn(
            "flex h-10 w-full rounded-md border border-solid border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring  disabled:cursor-not-allowed disabled:opacity-50 placeholder:text-slate-400",
            className,
            addonBefore ? "pl-10" : "pl-3",
            { "border-none hover:border-none px-0": readonly, }
          )}
          value={typeof value === "undefined" ? value : value || ""}
          ref={ref}
          disabled={readonly || rest.disabled}
          {...rest}
        />
        {
          type === "password" && (
            <span
              onClick={() => setShowPassword(state => !state)}
              className="h-full absolute cursor-pointer flex items-center justify-center right-3 top-0 text-slate-400"
            >
              { showPassword ? <Eye className="w-6 h-6"/> : <EyeOff className="w-6 h-6"/> }
            </span>
          )
        }
      </div>
    </LabelErrorProvider>
  )
})
Input.displayName = "Input"

export { Input }
