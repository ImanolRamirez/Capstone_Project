import { createBrowserRouter, RouterProvider } from "react-router-dom";

import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";

import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import Accounts from "./pages/Accounts";
import Transactions from "./pages/Transactions";
import Debts from "./pages/Debts";
import Transfer from "./pages/Transfer";

import Profile from "./pages/Profile";
import PersonalDetails from "./pages/PersonalDetails";
import LoginPreferences from "./pages/LoginPreferences";
import AlertsNotifications from "./pages/AlertsNotifications";
import LanguageSettings from "./pages/LanguageSettings";

import Layout from "./Components/Layout";
import ProtectedRoute from "./Components/ProtectedRoute";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Landing />
  },
  {
    path: "/login",
    element: <Login />
  },
  {
    path: "/register",
    element: <Register />
  },
  {
    element: (
      <ProtectedRoute>
        <Layout />
      </ProtectedRoute>
    ),
    children: [
      { path: "/home", element: <Home /> },
      { path: "/dashboard", element: <Dashboard /> },
      { path: "/accounts", element: <Accounts /> },
      { path: "/transactions", element: <Transactions /> },
      { path: "/debts", element: <Debts /> },
      { path: "/transfer", element: <Transfer /> },
      { path: "/profile", element: <Profile /> },
      { path: "/profile/personal", element: <PersonalDetails /> },
      { path: "/profile/login", element: <LoginPreferences /> },
      { path: "/profile/alerts", element: <AlertsNotifications /> },
      { path: "/profile/language", element: <LanguageSettings /> }
    ]
  }
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;