import { useState, useEffect } from "react";
import get from "lodash.get";
import dayjs from "dayjs";
import { Plus, FileSpreadsheet, PenSquare, Trash2, FileDown } from "lucide-react";

// components
import { Toaster } from "@/common/toaster";
import { ToastAction } from "@/common/toast";
import { Table } from "@/common/table";
import { Select } from "@/common/select";
import { Search } from "@/components/Search";
import { Button } from "@/common/button";
import { Accordion } from "@/common/accordion";
import AddUserDialog from "@/components/dialogs/AddUserDialog";
import { DatePickerWithRange } from "@/common/date-range-picker";
import DangerConfirm from "@/components/dialogs/DangerConfirm";

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
}
const INIT_MODALS_CONFIG: TModalsConfig = {
  addUser: {
    open: false,
    value: null,
  },
  deleteUser: {
    open: false,
    userId: null,
  }
}

function Dashboard() {
  const [params, setParams, clearQueryParams] = useQueryParams();
  const [modalsConfig, setModalsConfig] = useState<TModalsConfig>(INIT_MODALS_CONFIG);

  const { dataSource, columns, options, mutate, total } = useUsersList({ params });
  const { toast } = useToast();

  // methods
  const handleDeleteUser = (userId: string) => {
    const usersList = localStorage.getItem(SWR_KEYS.USERS_LIST);
    const usersListData = usersList ? JSON.parse(usersList) : [];
    const newUsersList = usersListData.filter((user: ISingleUser) => user.id !== userId);

    localStorage.setItem(SWR_KEYS.USERS_LIST, JSON.stringify(newUsersList));
    setModalsConfig(INIT_MODALS_CONFIG);
    mutate();
  }

  const handleGenerateReport = () => {
    const users = localStorage.getItem(SWR_KEYS.USERS_LIST);
    const usersData = users ? JSON.parse(users) : [];
    
    generateReport(usersData).then(arrayBuffer => {
      window.electronAPI.saveFile({ file: arrayBuffer, title: `Звіт про підготовку ${dayjs().format("DD-MM-YYYY HH:mm:ss")}`, type: "xlsx" });
    });
  }

  const handleExportTable = () => {
    const users = localStorage.getItem(SWR_KEYS.USERS_LIST);
    const usersData = users ? JSON.parse(users) : [];

    exportTable(filterDataSource(usersData, params.search || "", params)).then(arrayBuffer => {
      window.electronAPI.saveFile({ file: arrayBuffer, title: `Підготовка_${dayjs().format("DD-MM-YYYY HH:mm:ss")}`, type: "xlsx" });
    });
  }

  // effects
  useEffect(() => {
    window.electronAPI.saveFileCallback((_, filePath) => {
      toast({
        description: "Файл збережено",
        variant: "success",
        action: (
          <ToastAction altText="Open file" className="flex items-center justify-center gap-2 ml-8">
            <Button size="sm" variant="outline" onClick={() => window.electronAPI.openFile({ path: filePath })}>Відкрити Файл</Button>
            <Button size="sm" onClick={() => window.electronAPI.openPath({ path: filePath })}>Відкрити Папку</Button>
          </ToastAction>
        )
      });
    });
  }, []);


  const renderActiveFilters = () => {
    const activeFilters = TABLE_COLUMNS.filter(column => column.isSelectable).map((filter) => {
      const value = get(params, filter.dataIndex, "");

      if (!value) {
        return "";
      }

      return `${filter.title}: ${value}`;
    }).filter(Boolean);
    
    return activeFilters.join("; ");
  }

  const activeFilters = renderActiveFilters();

  // renders
  return (
    <div className="px-4 py-8 flex flex-col gap-4">
      <Toaster />
      <div className="grid grid-cols-[320px_320px] gap-4">
        <Search
          label="Пошук за П.І.Б"
          placeholder="Миколенко Микола Миколайович"
          fullWidth
          value={get(params, "search", "")}
          onChange={e => setParams({ search: e.target.value, page: null })}
        />
        <DatePickerWithRange
          label="Період з/по"
          fullWidth
          value={{
            from: (params.from && new Date(params.from)) as Date,
            to: (params.to && new Date(params.to)) as Date,
          }}
          onChange={e => setParams({ from: e?.from ? dayjs(e.from).format("YYYY-MM-DD") : null, to: e?.to ? dayjs(e.to).format("YYYY-MM-DD") : null })}
        />
      </div>
      <Accordion
        items={[
          {
            label: <span className="text-left">{ activeFilters ? `Активні фільтри: ${activeFilters}` : "Фільтри" }</span>,
            value: "filters",
            children: (
              <div className="grid grid-cols-4 gap-4">
                {
                  TABLE_COLUMNS.filter(column => column.isSelectable).map((filter) => (
                    <Select
                      key={filter.dataIndex}
                      label={filter.title}
                      placeholder={filter.title}
                      options={get(options, filter.dataIndex, [])}
                      fullWidth
                      isSearchable
                      value={get(params, filter.dataIndex, "")}
                      onChange={e => setParams({ [filter.dataIndex]: e || null })}
                    />
                  ))
                }
              </div>
            )
          }
        ]}
      />
      <div className="flex items-start justify-start gap-4">
        <Button onClick={() => setModalsConfig({ ...modalsConfig, addUser: { open: true, value: null } })}>
          <Plus size={18} />
          Додати Запис
        </Button>
        <Button
          onClick={() => clearQueryParams()}
          variant="outline"
        >
          Скинути фільтри
        </Button>
        <Button variant="outline" className="ml-auto" onClick={handleExportTable}>
          <FileDown size={18} />
          Експорт
        </Button>
        <Button onClick={handleGenerateReport}>
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
                  onClick={() => setModalsConfig({ ...modalsConfig, addUser: { open: true, value: record } })}
                />
                <Trash2
                  size={22}
                  className="text-red-400 hover:text-red-600 cursor-pointer"
                  onClick={() => setModalsConfig({ ...modalsConfig, deleteUser: { open: true, userId: record.id } })}
                />
              </div>
            )
          }
        ]}
        pagination={{
          total: total || 0,
          current: +get(params, "page", 1),
          pageSize: +get(params, "pageSize", 10),
          onPageChange: (page) => setParams({ page }),
        }}
      />
      <AddUserDialog
        open={modalsConfig.addUser.open}
        value={modalsConfig.addUser.value as ISingleUser}
        onOpenChange={() => setModalsConfig({ ...modalsConfig, addUser: INIT_MODALS_CONFIG.addUser })}
        onSuccess={() => setModalsConfig({ ...modalsConfig, addUser: INIT_MODALS_CONFIG.addUser })}
      />
      <DangerConfirm
        confirmText="Видалити"
        description="Ви впевнені, що хочете видалити запис?"
        open={modalsConfig.deleteUser.open}
        onSuccess={() => handleDeleteUser(modalsConfig.deleteUser.userId as string)}
        onOpenChange={() => setModalsConfig({ ...modalsConfig, deleteUser: INIT_MODALS_CONFIG.deleteUser })}
      />
    </div>
  )
}

export default Dashboard;
