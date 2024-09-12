import exceljs from "exceljs";
import groupBy from "lodash.groupby";
import dayjs from "dayjs";
import isBetween from "dayjs/plugin/isBetween";

// types
import { ISingleUser } from "@/types/swr/IUsersList";

dayjs.extend(isBetween);

type TQuarter = {
  from: dayjs.Dayjs;
  to: dayjs.Dayjs;
};

const QUARTERS = {
  first: { from: dayjs().set("month", 0), to: dayjs().set("month", 3) },
  second: { from: dayjs().set("month", 3), to: dayjs().set("month", 6) },
  third: { from: dayjs().set("month", 6), to: dayjs().set("month", 9) },
  fourth: { from: dayjs().set("month", 9), to: dayjs().set("month", 11) }
} as Record<string, TQuarter>;

const BORDER_STYLE: exceljs.Border = { style: "medium", color: { argb: "000000" } };
const HEADER_BORDER: Partial<exceljs.Borders> = {
  top: BORDER_STYLE,
  left: BORDER_STYLE,
  bottom: BORDER_STYLE,
  right: BORDER_STYLE
};

const TABLE_COLUMNS = [
  { header: "№ зп", key: "orderNumber" },
  { header: "За якою спеціальністю здійснюється або здійснювалась підготовка", key: "speciality" },
  { header: "За яким ВОС здійснюється або здійснювалась підготовка", key: "vos" },
  { header: "станом на сьогодні здійснюється підготовка", key: "today" },
  { header: "І квартал\nсічень - березень\nпройшли підготовку", key: "firstQuarter" },
  { header: "ІІ квартал\nквітень - червень\nпройшли підготовку", key: "secondQuarter" },
  { header: "ІІІ квартал\nлипень - вересень\nпройшли підготовку", key: "thirdQuarter" },
  { header: "ІV квартал\nжовтень - грудень\nпройшли підготовку", key: "fourthQuarter" },
  { header: "Всього за I - IV квартал\nпройшли підготовку", key: "total" }
];

const filterUsersByQuarter = (users: ISingleUser[], quarter: TQuarter) => {
  return users.filter(
    (user) => dayjs(user.period.from).isAfter(quarter.from.startOf("month")) &&
      dayjs(user.period.to).isBefore(quarter.to.endOf("month"))
  );
};

const ROW_OFFSET = 4;

export const generateReport = async (dataSource: ISingleUser[], year: string) => {
  const workbook = new exceljs.Workbook();
  const worksheet = workbook.addWorksheet("Звіт про підготовку");

  worksheet.getRow(ROW_OFFSET).values = TABLE_COLUMNS.map((column) => column.header);
  worksheet.getRow(ROW_OFFSET).eachCell((cell, index) => {
    if (index <= TABLE_COLUMNS.length) {
      cell.border = HEADER_BORDER;
      cell.font = { bold: true, size: 14 };
      cell.alignment = { horizontal: "center", vertical: "middle", wrapText: true };
    }
  });

  const groupedUsers = groupBy(dataSource, (record) => `${record.speciality}-${record.vos}`);

  Object.keys(groupedUsers).forEach((key, index) => {
    const [speciality, vos] = key.split("-");
    const users = groupedUsers[key];

    worksheet
      .addRow([
        index + 1,
        speciality,
        vos,
        users.length,
        ...Object.keys(QUARTERS).reduce((acc, quarter) => {
          acc.push(
            filterUsersByQuarter(users, {
              from: QUARTERS[quarter].from.set("year", +year),
              to: QUARTERS[quarter].to.set("year", +year)
            }).length
          );

          return acc;
        }, [] as number[]),
        users.length
      ])
      .eachCell((cell, cellIndex) => {
        cell.border = { right: BORDER_STYLE };
        cell.alignment = { horizontal: "center", vertical: "middle", wrapText: true };
        cell.font = { size: 14 };

        if (cellIndex === 2) {
          cell.alignment = { horizontal: "left", vertical: "middle", wrapText: true };
        }
      });
  });

  worksheet
    .addRow([
      "Всього:",
      "",
      "",
      { formula: `SUM(D${ROW_OFFSET + 1}:D${Object.keys(groupedUsers).length + ROW_OFFSET})` },
      { formula: `SUM(E${ROW_OFFSET + 1}:E${Object.keys(groupedUsers).length + ROW_OFFSET})` },
      { formula: `SUM(F${ROW_OFFSET + 1}:F${Object.keys(groupedUsers).length + ROW_OFFSET})` },
      { formula: `SUM(G${ROW_OFFSET + 1}:G${Object.keys(groupedUsers).length + ROW_OFFSET})` },
      { formula: `SUM(H${ROW_OFFSET + 1}:H${Object.keys(groupedUsers).length + ROW_OFFSET})` },
      { formula: `SUM(I${ROW_OFFSET + 1}:I${Object.keys(groupedUsers).length + ROW_OFFSET})` }
    ])
    .eachCell((cell, index) => {
      cell.border = HEADER_BORDER;
      cell.alignment = { horizontal: "center", vertical: "middle", wrapText: true };
      cell.font = { size: 14 };

      if (index === 1) {
        cell.font = { bold: true, size: 14 };
      }
    });

  const lastRow = worksheet.lastRow?.number;
  worksheet.mergeCells(`A${lastRow}`, `C${lastRow}`);

  // styles and formatting
  worksheet.columns.forEach((column) => {
    if (column.eachCell) {
      let maxLength = 0;
      column.eachCell({ includeEmpty: true }, (cell) => {
        const columnLength = cell.value ? cell.value.toString().length : 10;
        if (columnLength > maxLength) {
          maxLength = columnLength;
        }
      });
      column.width = maxLength < 10 ? 10 : maxLength;
    }
  });
  const buffer = await workbook.xlsx.writeBuffer({ useStyles: true });

  return buffer;
};
