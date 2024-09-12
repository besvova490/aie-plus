/* eslint-disable no-undefined */
import React, { useState, useEffect } from "react";
import dayjs from "dayjs";
import { Calendar as CalendarIcon } from "lucide-react";
import { DateRange } from "react-day-picker";

// components
import { LabelErrorProvider } from "./labelErrorProvider";
import { Button } from "@/common/button";
import { Calendar } from "@/common/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/common/popover";

// helpers
import { cn } from "@/lib/utils";

const DATE_PRESETS = [
  {
    label: "За цей тиждень",
    value: { from: dayjs().startOf("week").toDate(), to: dayjs().toDate() }
  },
  {
    label: "За минулий тиждент",
    value: { from: dayjs().subtract(1, "week").toDate(), to: dayjs().toDate() }
  },
  {
    label: "За цей місяць",
    value: { from: dayjs().startOf("month").toDate(), to: dayjs().endOf("month").toDate() }
  },
  {
    label: "За минулий місяць",
    value: {
      from: dayjs().subtract(1, "month").startOf("month").toDate(),
      to: dayjs().subtract(1, "month").endOf("month").toDate()
    }
  }
];

const PRESETS_QUARTERS = [
  {
    label: "І квартал",
    value: {
      from: dayjs().set("month", 0).startOf("month").toDate(),
      to: dayjs().set("month", 3).endOf("month").toDate()
    }
  },
  {
    label: "ІІ квартал",
    value: {
      from: dayjs().set("month", 3).startOf("month").toDate(),
      to: dayjs().set("month", 6).endOf("month").toDate()
    }
  },
  {
    label: "ІІІ квартал",
    value: {
      from: dayjs().set("month", 6).startOf("month").toDate(),
      to: dayjs().set("month", 9).endOf("month").toDate()
    }
  },
  {
    label: "IV квартал",
    value: {
      from: dayjs().set("month", 9).startOf("month").toDate(),
      to: dayjs().set("month", 11).endOf("month").toDate()
    }
  }
];

interface DatePickerWithRangeProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange"> {
  label: string;
  error?: string;
  fullWidth?: boolean;
  onChange?: (date: DateRange | undefined) => void;
  value?: DateRange | null;
}

export function DatePickerWithRange({
  className,
  label,
  error,
  fullWidth,
  onChange,
  value
}: DatePickerWithRangeProps) {
  const [date, setDate] = useState<DateRange | undefined>();

  // methods
  const handleChange = (e: DateRange | undefined) => {
    setDate(e);
    onChange?.(e);
  };

  // effects
  useEffect(() => {
    setDate(value as DateRange);
  }, [value]);

  // renders
  const renderPreset = (presets: { label: string; value: DateRange }[]) => (
    <ul className="flex flex-wrap max-w-[100%] justify-start gap-2 border-t-slate-200">
      {presets.map((preset) => (
        <li key={preset.label}>
          <Button size="sm" variant={"outline"} onClick={() => handleChange(preset.value)}>
            {preset.label}
          </Button>
        </li>
      ))}
    </ul>
  );

  return (
    <div className={cn("grid gap-2", className)}>
      <Popover>
        <LabelErrorProvider
          label={label}
          error={error}
          wrapperProps={{
            className: cn("w-full", fullWidth && "w-full")
          }}
        >
          <PopoverTrigger asChild>
            <Button
              id="date"
              variant={"outline"}
              className={cn(
                "w-[300px] justify-start text-left font-normal",
                !date && "text-muted-foreground",
                fullWidth && "w-full"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {date?.from ? (
                date.to ? (
                  <>
                    {[
                      dayjs(date.from).format("DD.MM.YYYY"),
                      dayjs(date.to).format("DD.MM.YYYY")
                    ].join(" - ")}
                  </>
                ) : (
                  dayjs(date.from).format("DD.MM.YYYY")
                )
              ) : (
                <span>Виберіть Дату від/до</span>
              )}
            </Button>
          </PopoverTrigger>
        </LabelErrorProvider>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={date?.from}
            selected={date}
            onSelect={handleChange}
            numberOfMonths={2}
          />
          <div className="flex flex-col gap-2 p-4">
            {renderPreset(DATE_PRESETS)}
            {renderPreset(PRESETS_QUARTERS)}
          </div>
          <div className="flex flex-wrap justify-start gap-2 border-t border-t-slate-200 p-4">
            <Button
              size="sm"
              variant={"outline"}
              onClick={() => handleChange({ from: undefined, to: undefined })}
            >
              Очистити
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
