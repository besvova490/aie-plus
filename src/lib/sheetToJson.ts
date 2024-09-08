import groupBy from "lodash.groupby";
import get from "lodash.get";
import { v4 as uuidv4 } from "uuid";

// types
import { ISheet } from "@/types/utils/ISheet";

// helpers
import { TABLE_COLUMNS } from "@/swr/useUsersList";


const prepareStringTitle = (title: string) => title.toLowerCase().trim();

export const sheetToJson = (sheet: ISheet) => {
  delete sheet["!ref"];
  delete sheet["!margins"];
  delete sheet["!merges"];

  const columns = TABLE_COLUMNS.map((column) => {
    const [rowKey] = Object.entries(sheet).find(
      ([_, value]) => value.w && prepareStringTitle(value.w as string) === (column.title as string).toLowerCase()
    ) || [];

    if (!rowKey) {
      return null;
    }

    return {
      rowKey: rowKey[0],
      ...column,
    };
  }).filter(Boolean) as { rowKey: string; title: string; dataIndex: string }[];

  const sheetKeys = groupBy(Object.keys(sheet), key => key[0]);
  const dataLength = sheetKeys[Object.keys(sheetKeys)[0]].length - 1;

  const dataSource = new Array(dataLength).fill(null).map((_, index) => {
    return columns.reduce((acc, column) => {
      const key = column?.title === "Період підготовки"
        ? `${sheetKeys[column.rowKey][index + 2]}.w`
        : `${sheetKeys[column.rowKey][index + 1]}.w`;

      if (column?.title === "Період підготовки") {
        const sheetKeysList = Object.keys(sheetKeys).sort();
        const fromKeyIndex = sheetKeysList.findIndex(columnKey => columnKey === column.rowKey);
        const toKey = `${sheetKeys[sheetKeysList[fromKeyIndex + 1]][index + 1]}.w`;

        return {
          ...acc,
          [column.dataIndex]: {
            from: new Date(get(sheet, key) as unknown as string),
            to: new Date(get(sheet, toKey) as unknown as string)
          }
        }
      }

      return {
        ...acc,
        [column.dataIndex]: get(sheet, key)
      };
    }, { id: uuidv4() });
  });

  return dataSource;
}
