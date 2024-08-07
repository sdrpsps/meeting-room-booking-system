import { lazy } from "react";
import {
  createBrowserRouter,
  Navigate,
  Outlet,
  RouterProvider,
  type RouteObject,
} from "react-router-dom";
import { LayoutProvider } from "../contexts/LayoutContext";

const AppLayout = lazy(() => import("../components/AppLayout"));
const NotFound = lazy(() => import("../components/NotFound"));
const DashBoard = lazy(() => import("../pages/DashBoard"));
const Login = lazy(() => import("../pages/Login"));
const Register = lazy(() => import("../pages/Register"));
const ForgotPassword = lazy(() => import("../pages/ForgotPassword"));
const UserProfile = lazy(() => import("../pages/User/Profile"));
const UserList = lazy(() => import("../pages/User/List"));
const MeetRoomList = lazy(() => import("../pages/MeetRoom/List"));

function isAuthenticated() {
  return (
    localStorage.getItem("accessToken") && localStorage.getItem("refreshToken")
  );
}

function ProtectedRoute() {
  return isAuthenticated() ? (
    <LayoutProvider>
      <AppLayout />
    </LayoutProvider>
  ) : (
    <Navigate to="/auth/login" replace />
  );
}

const routes: RouteObject[] = [
  {
    path: "/",
    element: <Navigate to="app" replace />,
  },
  {
    path: "/auth",
    element: isAuthenticated() ? <Navigate to="/app" replace /> : <Outlet />,
    children: [
      { path: "", element: <Navigate to="login" replace /> },
      { path: "login", element: <Login /> },
      { path: "register", element: <Register /> },
      { path: "forgot-password", element: <ForgotPassword /> },
    ],
  },
  {
    path: "/app",
    element: <ProtectedRoute />,
    children: [
      { path: "", element: <Navigate to="dashboard" replace /> },
      { path: "dashboard", element: <DashBoard /> },
      {
        path: "user",
        element: <Outlet />,
        children: [
          { path: "profile", element: <UserProfile /> },
          { path: "list", element: <UserList /> },
        ],
      },
      {
        path: "meeting-room",
        element: <Outlet />,
        children: [{ path: "list", element: <MeetRoomList /> }],
      },
    ],
  },
  { path: "*", element: <NotFound /> },
];

const router = createBrowserRouter(routes);

export function Routes() {
  return <RouterProvider router={router} />;
}
