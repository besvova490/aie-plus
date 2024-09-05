import { Outlet } from "react-router-dom";

// assets
import logo from "../assets/images/logo.png";


function OnboardingLayout() {

  return (
    <main className="flex flex-col min-h-screen w-full">
      <div className="p-2 flex items-center gap-4 border-b border-slate-200">
        <div className="flex items-center justify-center w-10 h-10 rounded-full overflow-hidden">
          <img src={logo} alt="logo" className="object-cover" />
        </div>
        <h1 className="text-2xl font-bold">
          AIE Plus
        </h1>
      </div>
      <Outlet/>
    </main>
  );
}

export default OnboardingLayout;
