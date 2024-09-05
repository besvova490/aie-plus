import { useState, useEffect } from "react";
import get from "lodash.get";
import dayjs from "dayjs";
import { Plus, FileSpreadsheet, PenSquare, Trash2 } from "lucide-react";

// components
import { Table } from "@/common/table";
import { Select } from "@/common/select";
import { Search } from "@/components/Search";
import { Button } from "@/common/button";
import AddUserDialog from "@/components/dialogs/AddUserDialog";
import { DatePickerWithRange } from "@/common/date-range-picker";
import DangerConfirm from "@/components/dialogs/DangerConfirm";

// helpers
import { SWR_KEYS } from "@/swr/swrKeys.constants";
import { ISingleUser } from "@/types/swr/IUsersList";
import { useUsersList, TABLE_COLUMNS } from "@/swr/useUsersList";
import { useQueryParams } from "@/hooks/useQueryParams";
import { generateReport } from "@/lib/generateReport";


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

  const { dataSource, columns, options, mutate } = useUsersList({ params });

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
      window.electronAPI.saveFile({ file: arrayBuffer, title: "report", type: "xlsx" });
    });
  }

  // effects
  useEffect(() => {
    window.electronAPI.saveFileCallback((_, filePath) => {
      console.log(filePath);
    });
  }, []);


  // renders
  return (
    <div className="px-4 py-8 flex flex-col gap-4">
      <div className="grid grid-cols-4 gap-4 border-b border-gray-200 pb-4">
        <Search
          label="Пошук за П.І.Б"
          placeholder="Миколенко Микола Миколайович"
          fullWidth
          value={get(params, "search", "")}
          onChange={e => setParams({ search: e.target.value, page: null })}
        />
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
        <DatePickerWithRange
          label="Період з/по"
          fullWidth
          onChange={e => setParams({ from: e ? dayjs(e.from).format("YYYY-MM-DD") : null, to: e ? dayjs(e.to).format("YYYY-MM-DD") : null })}
        />
      </div>
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
        <Button variant="outline" className="ml-auto" onClick={handleGenerateReport}>
          <FileSpreadsheet size={18} />
          Експорт
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
