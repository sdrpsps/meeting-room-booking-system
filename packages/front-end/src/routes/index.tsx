import { createBrowserRouter, type RouteObject } from "react-router-dom";
import { Error } from "../pages/Error";
import { ForgotPassword } from "../pages/ForgotPassword";
import { Home } from "../pages/Home";
import { Login } from "../pages/Login";
import { Register } from "../pages/Register";

const routes: RouteObject[] = [
  {
    path: "/",
    element: <Home />,
    errorElement: <Error />,
  },
  {
    path: "login",
    element: <Login />,
  },
  {
    path: "register",
    element: <Register />,
  },
  {
    path:'forgot-password',
    element: <ForgotPassword />
  }
];

// https://github.com/remix-run/react-router/issues/10787
export const router: ReturnType<typeof createBrowserRouter> = createBrowserRouter(routes);
