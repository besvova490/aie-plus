import exceljs from "exceljs";
import dayjs from "dayjs";
import get from "lodash.get";

// types
import { ISingleUser } from "@/types/swr/IUsersList";


const ROW_OFFSET = 4;

const BORDER_STYLE: exceljs.Border = { style: "medium", color: { argb: "000000" } };
const HEADER_BORDER: Partial<exceljs.Borders> = {
  top: BORDER_STYLE,
  left: BORDER_STYLE,
  bottom: BORDER_STYLE,
  right: BORDER_STYLE,
};


const TABLE_COLUMNS = [
  { header: "№ з/п", key: "index", rowSpan: 3 },
  { header: "Підрозділ", key: "subdivision", rowSpan: 3 },
  { header: "Посада", key: "position", rowSpan: 3 },
  { header: "в/звання", key: "rank", rowSpan: 3 },
  { header: "П.І.Б", key: "fullName", rowSpan: 3 },
  {
    header: "Підготовка",
    key: "preparation",
    rowSpan: 1,
    children: [
      { header: "Місце проведення підготовки", key: "place", rowSpan: 2 },
      { header: "За якою спеціальністю здійснюється підготовка", key: "speciality", rowSpan: 2 },
      { header: "За яким ВОС здійснюється підготовка", key: "vos", rowSpan: 2 },
      {
        header: "Період підготовки",
        key: "period",
        rowSpan: 1,
        children: [
          { header: "з", key: "period.from" },
          { header: "по", key: "period.to" },
          { header: "кількість днів", key: "daysCount" },
        ]
      },
      {
        header: "Згідно якого розпорядження ,наказу здійснюється підготовка",
        key: "order",
        rowSpan: 2,
      },
      {
        header: "Відмітка про завершення підготовки",
        key: "orderNote",
        rowSpan: 2,
      }
    ],
  },
]

const addChildren = (worksheet: exceljs.Worksheet, column: typeof TABLE_COLUMNS[number], rowIndex: number) => {
  column.children?.forEach((child) => {
    const lastColumnIndex = worksheet.getRow(rowIndex).cellCount;
    const childCell = worksheet.getRow(rowIndex).getCell(lastColumnIndex + 1);
    const columnIndex = lastColumnIndex + 1;

    childCell.value = child.header;
    childCell.font = { bold: true, size: 14 };
    childCell.border = HEADER_BORDER;
    childCell.alignment = { horizontal: "center", vertical: "middle", wrapText: true };
    worksheet.mergeCells(
      rowIndex,
      columnIndex,
      child.rowSpan ? rowIndex + child.rowSpan - 1 : rowIndex,
      child.children ? columnIndex + child.children.length - 1 : columnIndex
    );

    if (child.children) {
      addChildren(worksheet, child as typeof TABLE_COLUMNS[number], rowIndex + 1);
    }
  });
}

const flatArray = (array: typeof TABLE_COLUMNS): typeof TABLE_COLUMNS => {
  const newArray = array.flatMap((item) => item.children ? item.children : item);

  if (newArray.some((item) => item.children)) {
    return flatArray(newArray as typeof TABLE_COLUMNS);
  }

  return newArray as typeof TABLE_COLUMNS;
}

export const exportTable = async (data: ISingleUser[]) => {
  const workbook = new exceljs.Workbook();

  const worksheet = workbook.addWorksheet("Підготовка");
  const headerRow = worksheet.getRow(ROW_OFFSET);

  TABLE_COLUMNS.forEach((column, index) => {
    const cellIndex = index + 1;

    const cell = headerRow.getCell(cellIndex);
    cell.value = column.header;
    cell.font = { bold: true, size: 14 };
    cell.alignment = { horizontal: "center", vertical: "middle", wrapText: true }
    cell.border = HEADER_BORDER;

    worksheet.mergeCells(
      ROW_OFFSET,
      cellIndex,
      ROW_OFFSET + column.rowSpan - 1,
      column.children ? cellIndex + column.children.length + 1 : cellIndex
    );

    if (column.children) {
      addChildren(worksheet, column, ROW_OFFSET + 1);
    }
  });

  data.forEach((user, index) => {
    const rowIndex = ROW_OFFSET + index + 3;
    const row = worksheet.getRow(rowIndex);

    flatArray(TABLE_COLUMNS).forEach((column, columnIndex) => {
      const cellIndex = columnIndex + 1;
      const cell = row.getCell(cellIndex);

      cell.font = { size: 14 };
      cell.alignment = { horizontal: "center", vertical: "middle", wrapText: column.key !== "fullName" };
      cell.border = HEADER_BORDER;

      if (column.key === "index") {
        cell.value = index + 1;
      } else if (column.key === "daysCount") {
        const period = get(user, "period");
        const daysCount = dayjs(period.to).diff(period.from, "day");

        cell.value = daysCount;
      } else {
        cell.value = get(user, column.key as string, "N/A");
      }
    })
  })

  // set column width
  worksheet.columns.forEach((column) => {
    if (column.eachCell) {
      let maxLength = 0;
      column.eachCell({ includeEmpty: true }, (cell) => {
        const columnLength = cell.value ? cell.value.toString().length : 10;
        if (columnLength > maxLength) {
          maxLength = columnLength;
        }
      });
      column.width = maxLength < 10 ? 10 : maxLength + 8;
    }
  });

  const buffer = await workbook.xlsx.writeBuffer({ useStyles: true });

  return buffer;
}
