import { useEffect } from "react";
import { FileUp } from "lucide-react";
import Dropzone from "react-dropzone";
import { useNavigate } from "react-router-dom";

// components
import { Button } from "@/common/button";

// helpers
import { ROUTES } from "@/constants/routes.constants";

function Onboarding() {
  const navigate = useNavigate();

  // methods
  const handleDrop = async (acceptedFiles: File[]) => {
    const data = await Promise.all(acceptedFiles.map((file) => file.arrayBuffer()));
    window.electronAPI.readXlsx({ data });
  };

  // effects
  useEffect(() => {
    window.electronAPI.readXlsxCallback(() => {
      navigate(ROUTES.DASHBOARD.ROOT);
    });
  }, []);

  // renders
  return (
    <div className="flex flex-col items-center justify-center gap-4 flex-grow">
      <Dropzone
        accept={{
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [".xlsx"],
          "application/vnd.ms-excel": [".xls"]
        }}
        onDrop={handleDrop}
      >
        {({ getRootProps, getInputProps }) => (
          <div
            {...getRootProps()}
            className="flex flex-col items-center justify-center gap-6 min-w-[420px] min-h-[320px] w-3/5 border border-dashed rounded-lg bg-slate-100"
          >
            <input {...getInputProps()} />
            <p className="text-center text-lg text-slate-900">
              Перетягніть або натисніть, щоб завантажити файл
            </p>
            <Button>
              <FileUp size={18} />
              Завантажити таблицю
            </Button>
          </div>
        )}
      </Dropzone>
    </div>
  );
}

export default Onboarding;
