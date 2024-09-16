import { useEffect } from "react";
import { Outlet, useNavigate, NavLink, useLocation } from "react-router-dom";
import useSWR from "swr";

// components
import { Button } from "@/common/button";
import { ToastAction } from "@/common/toast";
import { Toaster } from "@/common/toaster";
// helpers
import { ROUTES } from "@/constants/routes.constants";
import { SWR_KEYS } from "@/swr/swrKeys.constants";
import { prepareUsersData } from "@/lib/prepareUsersData";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

// assets
import logo from "@/assets/images/logo.png";

const NAV_ITEMS = [
  {
    label: "Підготовка",
    path: ROUTES.DASHBOARD.ROOT,
  },
  {
    label: "Звіт",
    path: ROUTES.DASHBOARD.REPORT,
  },
];

function BaseLayout() {
  const navigate = useNavigate();
  const { mutate } = useSWR(SWR_KEYS.USERS_LIST);

  const location = useLocation();

  const { toast } = useToast();

  // effects
  useEffect(() => {
    window.electronAPI.clearData(() => {
      localStorage.clear();

      navigate(ROUTES.ONBOARDING.ROOT);
    });

    window.electronAPI.readXlsxCallback((_, payload) => {
      prepareUsersData(payload.sheets);

      mutate();
    });

    window.electronAPI.saveFileCallback((_, filePath) => {
      toast({
        title: "Файл збережено",
        description: (
          <span className="block max-w-[320px]">Файл збережено за шляхом: {filePath}</span>
        ),
        variant: "success",
        action: (
          <ToastAction
            altText="Open file"
            className="flex flex-col items-center justify-center gap-2 ml-8"
          >
            <Button
              size="sm"
              variant="outline"
              onClick={() => window.electronAPI.openFile({ path: filePath })}
            >
              Відкрити Файл
            </Button>
            <Button size="sm" onClick={() => window.electronAPI.openPath({ path: filePath })}>
              Відкрити Папку
            </Button>
          </ToastAction>
        )
      });
    });
  }, []);

  // renders
  return (
    <main className="flex flex-col min-h-screen w-full">
      <Toaster />
      <div className="p-2 flex items-center gap-4 border-b border-slate-200">
        <div className="flex items-center justify-center w-10 h-10 rounded-full overflow-hidden">
          <img src={logo} alt="logo" className="object-cover" />
        </div>
        <h1 className="text-2xl font-bold">
          AIE Plus
        </h1>
        <ul className="flex items-center justify-start">
          {
            NAV_ITEMS.map((item) => (
              <li key={item.path} >
                <NavLink
                  to={item.path}
                  className={cn(
                    "px-4 py-2 hover:bg-slate-100 rounded-md transition-colors duration-300",
                    item.path === location.pathname ? "bg-orange-50 text-orange-500" : "bg-transparent"
                  )}
                >
                  {item.label}
                </NavLink>
              </li>
            ))
          }
        </ul>
      </div>
      <Outlet />
    </main>
  );
}

export default BaseLayout;
