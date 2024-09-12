import React from "react";

// components
import { Dialog, IDialog } from "@/common/dialog";
import { Button } from "@/common/button";

interface IDangerConfirm extends IDialog {
  onSuccess: () => void;
  confirmText?: string;
}

function DangerConfirm({
  onSuccess,
  description,
  confirmText = "Confirm",
  ...props
}: IDangerConfirm) {
  return (
    <Dialog {...props}>
      <p className="text-slate-500 text-sm">{description}</p>
      <div className="flex items-center justify-between mt-4">
        <Button variant="outline" onClick={() => props.onOpenChange && props.onOpenChange(false)}>
          Скасувати
        </Button>
        <Button variant="destructive" onClick={() => onSuccess && onSuccess()}>
          {confirmText}
        </Button>
      </div>
    </Dialog>
  );
}

export default DangerConfirm;
