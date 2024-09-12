import React, { useEffect, useState } from "react";
import dayjs from "dayjs";
import { Calendar as CalendarIcon } from "lucide-react";

// components
import { Button } from "@/common/button";
import { Calendar, CalendarProps } from "@/common/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/common/popover";
import { LabelErrorProvider } from "./labelErrorProvider";

// helpers
import { cn } from "@/lib/utils";

export interface IDatePicker {
  value?: dayjs.Dayjs | null;
  onChange?: (date: dayjs.Dayjs | null) => void;
  label?: string;
  error?: string;
  fullWidth?: boolean;
  placeholder?: string;
  format?: string;
  readonly?: boolean;
  disablePastDates?: boolean;
}

export function DatePicker(props: IDatePicker & Omit<CalendarProps, "onSelect" | "selected">) {
  const {
    value = null,
    onChange,
    label,
    error,
    fullWidth,
    placeholder = "Pick a date",
    format = "DD.MM.YYYY",
    readonly = false,
    disablePastDates,
    ...rest
  } = props;

  const [date, setDate] = useState<Date | null>(value ? value.toDate() : null);

  // methods
  const handleSelect = (e?: Date) => {
    setDate(e || null);
    onChange && onChange(e ? dayjs(e) : null);
  };

  // effects
  useEffect(() => {
    if (typeof value !== "undefined") {
      setDate(value && value.toDate());
    }
  }, [value]);

  // renders
  return (
    <Popover>
      <LabelErrorProvider label={label} error={error}>
        <PopoverTrigger asChild>
          <Button
            variant={readonly ? "ghost" : "outline"}
            className={cn(
              "w-[320px] justify-start text-left font-normal",
              !date && "text-muted-foreground",
              fullWidth && "w-full",
              readonly && "cursor-not-allowed px-0"
            )}
            disabled={readonly}
          >
            <CalendarIcon className="h-4 w-4" />
            {date ? (
              dayjs(date).format(format)
            ) : (
              <span className="text-slate-400">{placeholder}</span>
            )}
          </Button>
        </PopoverTrigger>
      </LabelErrorProvider>
      <PopoverContent className="w-auto p-0">
        <Calendar
          {...rest}
          mode="single"
          selected={date as Date}
          onSelect={handleSelect}
          initialFocus
          disabled={disablePastDates ? (e) => dayjs(e).isBefore(dayjs().subtract(1, "day")) : false}
        />
      </PopoverContent>
    </Popover>
  );
}
