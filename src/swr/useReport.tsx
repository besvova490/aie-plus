import useSWR from "swr";
import dayjs from "dayjs";
import isBetween from "dayjs/plugin/isBetween";
import "dayjs/locale/uk";

// helpers
import { SWR_KEYS } from "@/swr/swrKeys.constants";

// types
import { ITableColumn } from "@/common/table";
import { ISingleUser } from "@/types/swr/IUsersList";
import { TReportData, mapUsersToReport } from "@/lib/generateReport";

dayjs.extend(isBetween);


export const TABLE_COLUMNS: ITableColumn<TReportData>[] = [
  { title: "№ зп", dataIndex: "orderNumber" },
  { title: "Спеціальність", dataIndex: "speciality", headerClassName: "whitespace-normal" },
  { title: "Номер ВОС", dataIndex: "vos" },
  { title: "Стан на сьогодні", dataIndex: "today" },
  { title: (<p className="text-center">І квартал<br />січень - березень<br />пройшли підготовку</p>), dataIndex: "firstQuarter", textAlignment: "center" },
  { title: (<p className="text-center">ІІ квартал<br />квітень - червень<br />пройшли підготовку</p>), dataIndex: "secondQuarter", textAlignment: "center" },
  { title: (<p className="text-center">ІІІ квартал<br />липень - вересень<br />пройшли підготовку</p>), dataIndex: "thirdQuarter", textAlignment: "center" },
  { title: (<p className="text-center">ІV квартал<br />жовтень - грудень<br />пройшли підготовку</p>), dataIndex: "fourthQuarter", textAlignment: "center" },
  { title: (<p className="text-center">Всього за I - IV квартал<br />пройшли підготовку</p>), dataIndex: "total", textAlignment: "center" }
];

export const YEARS_OPTIONS = new Array(10).fill(0).map((_, index) => ({
  label: dayjs()
    .subtract(index - 4, "year")
    .format("YYYY"),
  value: dayjs()
    .subtract(index - 4, "year")
    .format("YYYY")
}));

export const useReport = ({ year }: { year: number }) => {
  const { data } = useSWR<ISingleUser[]>(SWR_KEYS.USERS_LIST);

  const dataSource = mapUsersToReport(data || [], year);

  dataSource.push({
    orderNumber: "Всього",
    speciality: "",
    vos: "",
    today: dataSource.reduce((acc, item) => acc + item.today, 0),
    firstQuarter: dataSource.reduce((acc, item) => acc + item.firstQuarter, 0),
    secondQuarter: dataSource.reduce((acc, item) => acc + item.secondQuarter, 0),
    thirdQuarter: dataSource.reduce((acc, item) => acc + item.thirdQuarter, 0),
    fourthQuarter: dataSource.reduce((acc, item) => acc + item.fourthQuarter, 0),
    total: dataSource.reduce((acc, item) => acc + item.total, 0)
  });


  return { data: dataSource as TReportData[] };
}
