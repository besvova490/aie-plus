import exceljs from "exceljs";
import groupBy from "lodash.groupby";
import dayjs from "dayjs";
import isBetween from "dayjs/plugin/isBetween";

// types
import { ISingleUser } from "@/types/swr/IUsersList";

dayjs.extend(isBetween);


const QUARTERS = {
  first: { from: dayjs().set("month", 0), to: dayjs().set("month", 3) },
  second: { from: dayjs().set("month", 3), to: dayjs().set("month", 6) },
  third: { from: dayjs().set("month", 6), to: dayjs().set("month", 9) },
  fourth: { from: dayjs().set("month", 9), to: dayjs().set("month", 12) },
};

const BORDER_STYLE: exceljs.Border = { style: "medium", color: { argb: "000000" } };
const HEADER_BORDER: Partial<exceljs.Borders> = {
  top: BORDER_STYLE,
  left: BORDER_STYLE,
  bottom: BORDER_STYLE,
  right: BORDER_STYLE,
};

const TABLE_COLUMNS = [
  { header: "№ зп", key: "orderNumber" },
  { header: "За якою спеціальністю здійснюється або здійснювалась підготовка", key: "speciality" },
  { header: "За яким ВОС здійснюється або здійснювалась підготовка", key: "vos" },
  { header: "станом на сьогодні здійснюється підготовка", key: "today" },
  { header: "І квартал", key: "firstQuarter" },
  { header: "ІІ квартал", key: "secondQuarter" },
  { header: "ІІІ квартал", key: "thirdQuarter" },
  { header: "ІV квартал", key: "fourthQuarter" },
  { header: "Всього за I - IV квартал", key: "total" }
];

const filterUsersByQuarter = (users: ISingleUser[], quarter: keyof typeof QUARTERS) => {
  return users.filter(user => dayjs(user.period.from).isBetween(QUARTERS[quarter].from, QUARTERS[quarter].to));
}

export const generateReport = async(dataSource: ISingleUser[]) => {
  const workbook = new exceljs.Workbook();
  const worksheet = workbook.addWorksheet("Підготовка");

  worksheet.getRow(3).values = TABLE_COLUMNS.map(column => column.header);
  worksheet.getRow(3).eachCell((cel, index) => {
    if (index <= TABLE_COLUMNS.length) {
      cel.border = HEADER_BORDER;
      cel.font = { bold: true, size: 14 };
      cel.alignment = { horizontal: "center", vertical: "middle", wrapText: true };
    }
  })


  const groupedUsers = groupBy(dataSource, record => `${record.speciality}-${record.vos}`);

  Object.keys(groupedUsers).forEach((key, index) => {
    const [speciality, vos] = key.split("-");
    const users = groupedUsers[key];

    worksheet.addRow([
      index + 1,
      speciality,
      vos,
      users.length,
      filterUsersByQuarter(users, "first").length,
      filterUsersByQuarter(users, "second").length,
      filterUsersByQuarter(users, "third").length,
      filterUsersByQuarter(users, "fourth").length,
      users.length,
    ])
  });

  worksheet.addRow([
    "Всього",
    "",
    "",
    { formula: `SUM(D4:D${Object.keys(groupedUsers).length + 3})` },
    { formula: `SUM(E4:E${Object.keys(groupedUsers).length + 3})` },
    { formula: `SUM(F4:F${Object.keys(groupedUsers).length + 3})` },
    { formula: `SUM(G4:G${Object.keys(groupedUsers).length + 3})` },
    { formula: `SUM(H4:H${Object.keys(groupedUsers).length + 3})` },
    { formula: `SUM(I4:I${Object.keys(groupedUsers).length + 3})` },
  ]).getCell(1).alignment = { horizontal: "center", vertical: "middle", wrapText: true };

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
}
