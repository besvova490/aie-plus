import React, { useState, useEffect } from "react";
import dayjs from "dayjs";
import { Calendar as CalendarIcon } from "lucide-react";
import "dayjs/locale/uk";

// components
import { LabelErrorProvider } from "./labelErrorProvider";
import { Button } from "@/common/button";
import { Calendar } from "@/common/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/common/popover";

// helpers
import { cn } from "@/lib/utils";

dayjs.locale("uk");


interface IDatePicker {
  value: Date;
  onChange: (value?: Date) => void;
  label: string;
  error?: string;
  fullWidth?: boolean;
}

export function DatePicker(props: IDatePicker) {
  const { value, onChange, label, error, fullWidth } = props;

  const [date, setDate] = useState<Date | undefined>(value);

  // handlers
  const handleOnChange = (e?: Date) => {
    setDate(e);
    onChange(e);
  }

  // effects
  useEffect(() => {
    setDate(value);
  }, [value]);

  // renders
  return (
    <Popover>
      <LabelErrorProvider
        label={label}
        error={error}
        wrapperProps={{
          className: fullWidth ? "w-full" : ""
        }}
      >
        <PopoverTrigger asChild>
          <Button
            variant={"outline"}
            className={cn(
              "w-[280px] justify-start text-left font-normal",
              !date && "text-muted-foreground",
              fullWidth && "w-full"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date ? dayjs(date).format("DD MMMM YYYY") : <span>Виберіть Дату від/до</span>}
          </Button>
        </PopoverTrigger>
      </LabelErrorProvider>
      <PopoverContent className="w-auto p-0" side="top" sideOffset={4}>
        <Calendar
          mode="single"
          selected={date}
          onSelect={handleOnChange}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  )
}
