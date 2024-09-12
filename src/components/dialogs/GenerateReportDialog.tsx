import React, { useState } from "react";
import dayjs from "dayjs";

// components
import { Dialog, IDialog } from "@/common/dialog";
import { Button } from "@/common/button";
import { Select } from "@/common/select";

interface IDangerConfirm extends IDialog {
  onSuccess: (year: string) => void;
  confirmText?: string;
}

const YEARS_OPTIONS = new Array(10).fill(0).map((_, index) => ({
  label: dayjs()
    .subtract(index - 4, "year")
    .format("YYYY"),
  value: dayjs()
    .subtract(index - 4, "year")
    .format("YYYY")
}));

function GenerateReportDialog({
  onSuccess,
  description,
  confirmText = "Confirm",
  ...props
}: IDangerConfirm) {
  const [year, setYear] = useState<string>(dayjs().format("YYYY"));

  return (
    <Dialog {...props} title="Згенерувати звіт про Підготовку">
      <p className="text-slate-500 text-sm">{description}</p>
      <Select
        label="За який рік згенерувати звіт?"
        placeholder="Оберіть рік"
        fullWidth
        options={YEARS_OPTIONS}
        value={year}
        onChange={(e) => setYear(e as string)}
      />
      <div className="flex items-center justify-between mt-4">
        <Button variant="outline" onClick={() => props.onOpenChange && props.onOpenChange(false)}>
          Скасувати
        </Button>
        <Button onClick={() => onSuccess && onSuccess(year)}>{confirmText}</Button>
      </div>
    </Dialog>
  );
}

export default GenerateReportDialog;
