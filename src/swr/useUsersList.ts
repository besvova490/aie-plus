import useSWR from "swr";
import get from "lodash.get";
import dayjs from "dayjs";
import isBetween from "dayjs/plugin/isBetween";
import "dayjs/locale/uk";

// helpers
import { SORTERS } from "@/lib/sorters";
import { SWR_KEYS } from "@/swr/swrKeys.constants";

// types
import { ITableColumn } from "@/common/table";
import { ISingleUser } from "@/types/swr/IUsersList";


dayjs.locale("uk");
dayjs.extend(isBetween);

interface IUseUsersList {
  params: Record<string, string | undefined>;
}

export const TABLE_COLUMNS = [
  {
    title: "№ з/п",
    dataIndex: "index",
    className: "whitespace-nowrap",
    sortBy: "number",
    render: (_: unknown, __: unknown, index: number) => index + 1,
  },
  {
    title: "Підрозділ",
    dataIndex: "subdivision",
    className: "whitespace-nowrap",
    sortBy: "string",
    isSelectable: true,
  },
  {
    title: "Посада",
    dataIndex: "position",
    className: "whitespace-nowrap",
    sortBy: "string",
    isSelectable: true,
  },
  {
    title: "в/звання",
    dataIndex: "rank",
    className: "whitespace-nowrap",
    sortBy: "string",
    isSelectable: true,
  },
  {
    title: "П.І.Б.",
    dataIndex: "fullName",
    className: "whitespace-nowrap",
    sortBy: "string",
  },
  {
    title: "Місце проведення підготовки",
    dataIndex: "place",
    className: "whitespace-nowrap",
    sortBy: "string",
    isSelectable: true,
  },
  {
    title: "За якою спеціальністю здійснюється підготовка",
    dataIndex: "speciality",
    sortBy: "string",
    isSelectable: true,
  },
  {
    title: "За яким ВОС здійснюється підготовка",
    dataIndex: "vos",
    sortBy: "string",
    isSelectable: true,
  },
  {
    title: "Період підготовки",
    dataIndex: "period",
    sortBy: "date",
  },
  {
    title: "Згідно якого розпорядження ,наказу здійснюється підготовка",
    dataIndex: "order",
    sortBy: "string",
  },
  {
    title: "Відмітка про завершення підготовки",
    dataIndex: "orderNote",
    sortBy: "string",
    isSelectable: true,
  }
];

const periodSorter = (recordA: unknown, recordB: unknown, column: ITableColumn<ISingleUser>) => {
  const fromDateA = get(recordA, `${column.dataIndex}.from`) as unknown as string;
  const fromDateB = get(recordB, `${column.dataIndex}.from`) as unknown as string;

  return new Date(fromDateA).getTime() - new Date(fromDateB).getTime();
}

const getOptions = (data: ISingleUser[], dataIndex: string) => {
  const optionsDraft = new Set();

  data.forEach((item) => {
    const value = get(item, dataIndex) as unknown as string;
    optionsDraft.add(value);
  });

  return [
    {
      label: "Усі",
      value: null,
    },
    ...[...optionsDraft].map(item => ({
      label: item,
      value: item,
    })),
  ];
}

export const filterDataSource = (data: ISingleUser[], search: string, params: Record<string, string | undefined>) => {
  const { from, to, ...restParams } = params || {};

  const filteredData = data
    .filter(item => !search || item.fullName?.toLowerCase().includes(search.toLowerCase()))
    .filter(
      item => Object.keys(restParams).every(key => params[key] ? item[key as keyof ISingleUser] === params[key] : true)
    )
    .filter(item => {
      return from && to ? dayjs(item.period.from).isBetween(from, to) : true;
    });

  return filteredData;
}

export function useUsersList(args?: IUseUsersList) {
  const { page = "1", pageSize = "100", search = "", ...restParams } = args?.params || {};


  const { data, ...rest } = useSWR<ISingleUser[]>(SWR_KEYS.USERS_LIST);

  const columns = TABLE_COLUMNS.map((column) => {
    if (column.dataIndex === "period") {
      return [
        {
          title: "Початок Підготовки",
          dataIndex: "fromDate",
          render: (_: unknown, record: unknown) => dayjs(get(record, `${column.dataIndex}.from`)).format("DD/MM/YYYY"),
          className: "whitespace-nowrap",
          sorter: (recordA: unknown, recordB: unknown) => periodSorter(recordA, recordB, column),
        },
        {
          title: "Завершення Підготовки",
          dataIndex: "fromDate",
          render: (_: unknown, record: unknown) => dayjs(get(record, `${column.dataIndex}.to`)).format("DD/MM/YYYY"),
          className: "whitespace-nowrap",
          sorter: (recordA: unknown, recordB: unknown) => periodSorter(recordA, recordB, column),
        }
      ];
    }

    return {
      ...column,
      sorter: get(SORTERS, column.sortBy, SORTERS.string)(column.dataIndex as string),
    };
  });

  const tableDataSource = (data || []).slice((+page - 1) * +pageSize, +page * +pageSize)

  return {
    total: data?.length,
    dataSource: filterDataSource(tableDataSource, search || "", restParams),
    options: TABLE_COLUMNS.filter(column => column.isSelectable).reduce((acc, column) => ({
      ...acc,
      [column.dataIndex as string]: getOptions(data || [], column.dataIndex as string),
    }), {}),
    columns: columns.flat() as ITableColumn<ISingleUser>[],
    ...rest,
  };
}
