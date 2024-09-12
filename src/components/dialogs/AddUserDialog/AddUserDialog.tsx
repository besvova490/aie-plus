import React from "react";

// components
import { Dialog } from "@/common/dialog";
const AddUserDialogContent = React.lazy(() => import("./AddUserDialogContent"));

// types
import { IAddUserDialog } from "./AddUserDialog.interface";

function AddUserDialog({ onSuccess, value, onOpenChange, ...props }: IAddUserDialog) {
  return (
    <Dialog
      title="Додати/редагувати користувача"
      className="min-h-[524px] max-w-max"
      onOpenChange={onOpenChange}
      {...props}
    >
      {props.open && (
        <React.Suspense fallback="...">
          <AddUserDialogContent value={value} onSuccess={onSuccess} onOpenChange={onOpenChange} />
        </React.Suspense>
      )}
    </Dialog>
  );
}

export default AddUserDialog;
