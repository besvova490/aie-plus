import React, { lazy, Suspense } from "react";
import { createBrowserRouter, RouterProvider, redirect } from "react-router-dom";

// layouts
const BaseLayout = lazy(() => import("../../layouts/BaseLayout"));

// pages
const Dashboard = lazy(() => import("../Dashboard"));
const Onboarding = lazy(() => import("../Onboarding"));

// constants
import { SWR_KEYS } from "@/swr/swrKeys.constants";
import { ROUTES } from "../../constants/routes.constants";


const renderWithSuspense = (Component: React.LazyExoticComponent<() => React.JSX.Element>) => (
  <Suspense fallback="...">
    <Component />
  </Suspense>
);

const ROOT_ROUTER = [
  {
    path: "/",
    element: renderWithSuspense(BaseLayout),
    children: [
      {
        path: "/",
        loader: async () => {
          return redirect(ROUTES.DASHBOARD.ROOT);
        },
      },
      {
        path: ROUTES.DASHBOARD.ROOT,
        element: renderWithSuspense(Dashboard),
        loader: async () => {
          const dataSource = localStorage.getItem(SWR_KEYS.USERS_LIST);
    
          if (!dataSource) {
            return redirect(ROUTES.ONBOARDING.ROOT);
          }
    
          return null;
        }
      },
      {
        path: ROUTES.ONBOARDING.ROOT,
        element: renderWithSuspense(Onboarding)
      },
    ]
  },
];

const Router = () => <RouterProvider router={createBrowserRouter(ROOT_ROUTER)} />;

export default Router;
