import get from "lodash.get";

// helpers
import { sheetToJson } from "@/lib/sheetToJson";
import { SWR_KEYS } from "@/swr/swrKeys.constants";
import { TABLE_COLUMNS } from "@/swr/useUsersList";

// types
import { ISheet } from "@/types/utils/ISheet";
import { ISingleUser } from "@/types/swr/IUsersList";

const getOptions = (
  data: ISingleUser[],
  dataIndex: string,
  currentFilters?: { label: string; value: string }[]
) => {
  const optionsDraft = new Set(currentFilters?.map((filter) => filter.value));

  data.forEach((item) => {
    const value = get(item, dataIndex) as unknown as string;
    optionsDraft.add(value);
  });

  return [
    {
      label: "Усі",
      value: null
    },
    ...[...optionsDraft].map((item) => ({
      label: item,
      value: item
    }))
  ].filter((item) => !!item.label);
};

export function prepareUsersData(users?: ISheet[]) {
  const currentUsersList = JSON.parse(localStorage.getItem(SWR_KEYS.USERS_LIST) as string) || [];
  const currentFilters = JSON.parse(localStorage.getItem(SWR_KEYS.USERS_FILTERS) as string) || {};

  const newUsers = [...(users || []).map((user) => sheetToJson(user)).flat(), ...currentUsersList];

  const filters = TABLE_COLUMNS.filter((column) => column.isSelectable).reduce(
    (acc, column) => ({
      ...acc,
      [column.dataIndex as string]: getOptions(
        newUsers || [],
        column.dataIndex as string,
        currentFilters[column.dataIndex as string]
      )
    }),
    {}
  );

  localStorage.setItem(SWR_KEYS.USERS_LIST, JSON.stringify(newUsers));
  localStorage.setItem(SWR_KEYS.USERS_FILTERS, JSON.stringify(filters));
}
