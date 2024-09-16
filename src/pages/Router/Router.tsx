import React, { lazy, Suspense } from "react";
import { createMemoryRouter, RouterProvider, redirect } from "react-router-dom";

// layouts
const BaseLayout = lazy(() => import("../../layouts/BaseLayout"));

// pages
const Dashboard = lazy(() => import("../Dashboard"));
const Onboarding = lazy(() => import("../Onboarding"));
const Report = lazy(() => import("../Report"));
// constants
import { SWR_KEYS } from "@/swr/swrKeys.constants";
import { ROUTES } from "../../constants/routes.constants";

const renderWithSuspense = (Component: React.LazyExoticComponent<() => React.JSX.Element>) => (
  <Suspense fallback="...">
    <Component />
  </Suspense>
);

const PRIVATE_ROUTES = [
  {
    path: ROUTES.DASHBOARD.ROOT,
    loader: async () => {
      const dataSource = localStorage.getItem(SWR_KEYS.USERS_LIST);

      if (!dataSource) {
        return redirect(ROUTES.ONBOARDING.ROOT);
      }

      return null;
    },
    children: [
      {
        path: ROUTES.DASHBOARD.ROOT,
        element: renderWithSuspense(Dashboard),
      },
      {
        path: ROUTES.DASHBOARD.REPORT,
        element: renderWithSuspense(Report),
      }
    ],
  },
]

const ROOT_ROUTER = [
  {
    path: "/",
    element: renderWithSuspense(BaseLayout),
    children: [
      {
        path: "/",
        loader: async () => {
          return redirect(ROUTES.DASHBOARD.ROOT);
        }
      },
      {
        path: ROUTES.ONBOARDING.ROOT,
        element: renderWithSuspense(Onboarding)
      },
      ...PRIVATE_ROUTES,
    ]
  }
];

const Router = () => <RouterProvider router={createMemoryRouter(ROOT_ROUTER)} />;

export default Router;
