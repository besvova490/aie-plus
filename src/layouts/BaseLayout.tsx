import { useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import useSWR from "swr";

// helpers
import { ROUTES } from "@/constants/routes.constants";
import { SWR_KEYS } from "@/swr/swrKeys.constants";
import { prepareUsersData } from "@/lib/prepareUsersData";

// assets
import logo from "@/assets/images/logo.png";

function BaseLayout() {
  const navigate = useNavigate();
  const { mutate } = useSWR(SWR_KEYS.USERS_LIST);

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
  }, []);

  // renders
  return (
    <main className="flex flex-col min-h-screen w-full">
      <div className="p-2 flex items-center gap-4 border-b border-slate-200">
        <div className="flex items-center justify-center w-10 h-10 rounded-full overflow-hidden">
          <img src={logo} alt="logo" className="object-cover" />
        </div>
        <h1 className="text-2xl font-bold">AIE Plus</h1>
      </div>
      <Outlet />
    </main>
  );
}

export default BaseLayout;
