// types
import { ISingleUser } from "@/types/swr/IUsersList";
import { IDialog } from "@/common/dialog";

export interface IAddUserDialog extends IDialog {
  value?: ISingleUser;
  onSuccess: (user: ISingleUser) => void;
}
