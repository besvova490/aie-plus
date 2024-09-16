import { useState } from "react";
import get from "lodash.get";
import dayjs from "dayjs";
import { Plus, FileSpreadsheet, PenSquare, Trash2, FileDown } from "lucide-react";

// components
import { Table } from "@/common/table";
import { Select } from "@/common/select";
import { Search } from "@/components/Search";
import { Button } from "@/common/button";
import { Accordion } from "@/common/accordion";
import AddUserDialog from "@/components/dialogs/AddUserDialog";
import { DatePickerWithRange } from "@/common/date-range-picker";
import DangerConfirm from "@/components/dialogs/DangerConfirm";
import GenerateReportDialog from "@/components/dialogs/GenerateReportDialog";

// helpers
import { useToast } from "@/hooks/use-toast";
import { SWR_KEYS } from "@/swr/swrKeys.constants";
import { ISingleUser } from "@/types/swr/IUsersList";
import { useUsersList, TABLE_COLUMNS, filterDataSource } from "@/swr/useUsersList";
import { useQueryParams } from "@/hooks/useQueryParams";
import { generateReport } from "@/lib/generateReport";
import { exportTable } from "@/lib/exportTable";

type TModalsConfig = {
  addUser: {
    open: boolean;
    value: ISingleUser | null;
  };
  deleteUser: {
    open: boolean;
    userId: string | null;
  };
  generateReport: {
    open: boolean;
  };
};
const INIT_MODALS_CONFIG: TModalsConfig = {
  addUser: {
    open: false,
    value: null
  },
  deleteUser: {
    open: false,
    userId: null
  },
  generateReport: {
    open: false
  }
};

function Dashboard() {
  const [params, setParams, clearQueryParams] = useQueryParams();
  const [modalsConfig, setModalsConfig] = useState<TModalsConfig>(INIT_MODALS_CONFIG);

  const { dataSource, columns, options, mutate, total } = useUsersList({ params });
  const { toast } = useToast();

  // methods
  const handleDeleteUser = (userId: string) => {
    const usersList = localStorage.getItem(SWR_KEYS.USERS_LIST);
    const usersListData = usersList ? JSON.parse(usersList) : [];
    const user = usersListData.find((item: ISingleUser) => item.id === userId);
    const newUsersList = usersListData.filter((item: ISingleUser) => item.id !== userId);

    localStorage.setItem(SWR_KEYS.USERS_LIST, JSON.stringify(newUsersList));
    setModalsConfig(INIT_MODALS_CONFIG);
    mutate();

    toast({
      description: `Запис про ${user.fullName} видалено`,
      variant: "destructive"
    });
  };

  const handleEditUser = (user: ISingleUser) => {
    setModalsConfig(INIT_MODALS_CONFIG);

    toast({
      description: `Запис про ${user.fullName} змінено`,
      variant: "success"
    });
  };

  const handleGenerateReport = (year: string) => {
    const users = localStorage.getItem(SWR_KEYS.USERS_LIST);
    const usersData = users ? JSON.parse(users) : [];

    generateReport(usersData, year).then(() => setModalsConfig(INIT_MODALS_CONFIG));
  };

  const handleExportTable = () => {
    const users = localStorage.getItem(SWR_KEYS.USERS_LIST);
    const usersData = users ? JSON.parse(users) : [];

    exportTable(filterDataSource(usersData, params.search || "", params)).then((arrayBuffer) => {
      window.electronAPI.saveFile({
        file: arrayBuffer,
        title: `Підготовка_${dayjs().format("DD-MM-YYYY_HH")}`,
        type: "xlsx"
      });
    });
  };

  const renderActiveFilters = () => {
    const activeFilters = TABLE_COLUMNS.filter((column) => column.isSelectable)
      .map((filter) => {
        const value = get(params, filter.dataIndex, "");

        if (!value) {
          return "";
        }

        return `${filter.title}: ${value}`;
      })
      .filter(Boolean);

    return activeFilters.join("; ");
  };

  const activeFilters = renderActiveFilters();

  // renders
  return (
    <div className="px-4 py-8 flex flex-col gap-4">
      <div className="grid grid-cols-[320px_320px] gap-4">
        <Search
          label="Пошук за П.І.Б"
          placeholder="Миколенко Микола Миколайович"
          fullWidth
          value={get(params, "search", "")}
          onChange={(e) => setParams({ search: e.target.value, page: null })}
        />
        <DatePickerWithRange
          label="Період з/по"
          fullWidth
          value={{
            from: (params.from && new Date(params.from)) as Date,
            to: (params.to && new Date(params.to)) as Date
          }}
          onChange={(e) => setParams({
            from: e?.from ? dayjs(e.from).format("YYYY-MM-DD") : null,
            to: e?.to ? dayjs(e.to).format("YYYY-MM-DD") : null
          })
          }
        />
      </div>
      <Accordion
        items={[
          {
            label: (
              <span className="text-left">
                {activeFilters ? `Активні фільтри: ${activeFilters}` : "Фільтри"}
              </span>
            ),
            value: "filters",
            children: (
              <div className="grid grid-cols-4 gap-4">
                {TABLE_COLUMNS.filter((column) => column.isSelectable).map((filter) => (
                  <Select
                    key={filter.dataIndex}
                    label={filter.title}
                    placeholder={filter.title}
                    options={get(options, filter.dataIndex, [])}
                    fullWidth
                    isSearchable
                    value={get(params, filter.dataIndex, "")}
                    onChange={(e) => setParams({ [filter.dataIndex]: e || null })}
                  />
                ))}
              </div>
            )
          }
        ]}
      />
      <div className="flex items-start justify-start gap-4">
        <Button
          onClick={() => setModalsConfig({ ...modalsConfig, addUser: { open: true, value: null } })}
        >
          <Plus size={18} />
          Додати Запис
        </Button>
        <Button onClick={() => clearQueryParams()} variant="outline">
          Скинути фільтри
        </Button>
        <Button variant="outline" className="ml-auto" onClick={handleExportTable}>
          <FileDown size={18} />
          Експорт
        </Button>
        <Button
          onClick={() => setModalsConfig((state) => ({ ...state, generateReport: { open: true } }))}
        >
          <FileSpreadsheet size={18} />
          Згенерувати Звіт
        </Button>
      </div>
      <Table
        dataSource={dataSource}
        columns={[
          ...columns,
          {
            title: "Дії",
            fixed: "right",
            render: (_, record) => (
              <div className="flex items-center justify-center gap-2">
                <PenSquare
                  size={22}
                  className="text-blue-400 hover:text-blue-600 cursor-pointer"
                  onClick={() => setModalsConfig({ ...modalsConfig, addUser: { open: true, value: record } })
                  }
                />
                <Trash2
                  size={22}
                  className="text-red-400 hover:text-red-600 cursor-pointer"
                  onClick={() => setModalsConfig({
                    ...modalsConfig,
                    deleteUser: { open: true, userId: record.id }
                  })
                  }
                />
              </div>
            )
          }
        ]}
        pagination={{
          total: total || 0,
          current: +get(params, "page", 1),
          pageSize: +get(params, "pageSize", 100),
          onPageChange: (page) => setParams({ page })
        }}
      />
      <AddUserDialog
        open={modalsConfig.addUser.open}
        value={modalsConfig.addUser.value as ISingleUser}
        onOpenChange={() => setModalsConfig(INIT_MODALS_CONFIG)}
        onSuccess={(e) => handleEditUser(e)}
      />
      <DangerConfirm
        confirmText="Видалити"
        description="Ви впевнені, що хочете видалити запис?"
        open={modalsConfig.deleteUser.open}
        onSuccess={() => handleDeleteUser(modalsConfig.deleteUser.userId as string)}
        onOpenChange={() => setModalsConfig(INIT_MODALS_CONFIG)}
      />
      <GenerateReportDialog
        open={modalsConfig.generateReport.open}
        onOpenChange={() => setModalsConfig(INIT_MODALS_CONFIG)}
        onSuccess={handleGenerateReport}
      />
    </div>
  );
}

export default Dashboard;
