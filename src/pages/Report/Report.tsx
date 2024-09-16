import dayjs from "dayjs";
import { FileSpreadsheet } from "lucide-react";

// components
import { Select } from "@/common/select";
import { Table } from "@/common/table";
import { Button } from "@/common/button";

// helpers
import { useQueryParams } from "@/hooks/useQueryParams";
import { useReport, YEARS_OPTIONS, TABLE_COLUMNS } from "@/swr/useReport";
import { SWR_KEYS } from "@/swr/swrKeys.constants";
import { generateReport } from "@/lib/generateReport";


function Report() {
  const [{ year = dayjs().format("YYYY") }, setQueryParams] = useQueryParams();

  const { data } = useReport({ year: +year });

  // methods
  const handleGenerateReport = () => {
    const users = localStorage.getItem(SWR_KEYS.USERS_LIST);
    const usersData = users ? JSON.parse(users) : [];

    generateReport(usersData, year);
  };

  // renders
  return (
    <div className="px-4 py-8 flex flex-col gap-4">
      <div className="flex items-end justify-start gap-4 w-full">
        <Select
          label="За який рік згенерувати звіт?"
          placeholder="Оберіть рік"
          fullWidth
          options={YEARS_OPTIONS}
          value={year}
          onChange={(e) => setQueryParams({ year: e as string })}
        />
        <Button
          onClick={handleGenerateReport}
          className="ml-auto"
        >
          <FileSpreadsheet size={18} />
          Згенерувати Звіт
        </Button>
      </div>
      <Table columns={TABLE_COLUMNS} dataSource={data} />
    </div>
  );
}

export default Report;
