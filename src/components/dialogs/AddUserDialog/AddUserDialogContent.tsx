import get from "lodash.get";
import dayjs from "dayjs";

// components
import { Input } from "@/common/input";
import { Textarea } from "@/common/textarea";
import { Button } from "@/common/button";
import { Select } from "@/common/select";
import { DatePicker } from "@/common/date-picker";

// helpers
import { useAddUser } from "@/hooks/useAddUser";
import { TABLE_COLUMNS, useUsersList } from "@/swr/useUsersList";

// types
import { IAddUserDialog } from "./AddUserDialog.interface";

function AddUserDialogContent(props: IAddUserDialog) {
  const { value, onSuccess, onOpenChange } = props;
  const { options } = useUsersList();

  const {
    setValue,
    watch,
    onSubmit,
    formState: { errors }
  } = useAddUser({
    onSubmit: (data) => {
      onSuccess && onSuccess(data);
    },
    value
  });
  const values = watch();

  // renders
  return (
    <form onSubmit={onSubmit} className="w-[720px] flex flex-col gap-8">
      <div className="grid grid-cols-2 gap-4">
        <Input
          label="ПІБ"
          name="fullName"
          value={values.fullName}
          onChange={(e) => setValue("fullName", e.target.value)}
          error={get(errors, "fullName.message", "") as string}
          fullWidth
        />
        {TABLE_COLUMNS.filter((column) => column.isSelectable).map((column) => (
          <Select
            key={column.dataIndex}
            label={column.title}
            options={(
              get(options, column.dataIndex, []) as { value: string; label: string }[]
            ).filter((option) => !!option.value)}
            value={values[column.dataIndex]}
            error={get(errors, `${column.dataIndex}.message`, "") as string}
            onChange={(e) => setValue(column.dataIndex, e)}
            isSearchable
            isCreatable
            fullWidth
          />
        ))}
        <DatePicker
          label="Початок підготовки"
          value={values.period.from ? dayjs(values.period.from) : null}
          onChange={(e) => setValue("period.from", e)}
          error={get(errors, "period.from.message", "") as string}
          fullWidth
        />
        <DatePicker
          label="Кінець підготовки"
          value={values.period.to ? dayjs(values.period.to) : null}
          onChange={(e) => setValue("period.to", e)}
          error={get(errors, "period.to.message", "") as string}
          fullWidth
        />
        <Textarea
          label="Згідно якого розпорядження ,наказу здійснюється підготовка"
          value={values.order}
          onChange={(e) => setValue("order", e.target.value)}
          error={get(errors, "order.message", "") as string}
          fullWidth
        />
      </div>
      <div className="flex items-center justify-between gap-4 border-t border-gray-200 pt-4">
        <Button onClick={() => onOpenChange?.(false)} variant="outline">
          Скасувати
        </Button>
        <Button type="submit">{value?.id ? "Редагувати" : "Додати"}</Button>
      </div>
    </form>
  );
}

export default AddUserDialogContent;
