import {
  BarChart,
  Home,
  LogOut,
  User,
  UsersRound,
  Star,
} from "lucide-react";

import { useLocation, useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import { message } from "antd";
import usersGlobalStore, { UsersStoreType } from "../../store/users-store";

function MenuItems() {
  const iconSize = 16;
  const location = useLocation();
  const navigate = useNavigate();
  const currentPath = location.pathname;

  const { currentUser }: UsersStoreType = usersGlobalStore() as UsersStoreType;

  const userMenu = [
    {
      name: "Home",
      path: "/",
      icon: <Home size={iconSize} />,
      isActive: currentPath === "/",
    },
    {
      name: "Profile",
      path: "/profile",
      icon: <User size={iconSize} />,
      isActive: currentPath === "/profile",
    },
    {
      name: "Reports",
      path: "/report",
      icon: <BarChart size={iconSize} />,
      isActive: currentPath === "/report",
    },
    {
      name: "Premium Advice",
      path: "/financial_advice",
      icon: <Star size={iconSize} />,
      isActive: currentPath === "/financial_advice",
    },
    {
      name: "Logout",
      path: "/logout",
      icon: <LogOut size={iconSize} />,
    },
  ];
  const adminMenu = [
    {
      name: "Home",
      path: "/",
      icon: <Home size={iconSize} />,
      isActive: currentPath === "/",
    },
    {
      name: "Users",
      path: "/admin/users",
      icon: <UsersRound size={iconSize} />,
      isActive: currentPath.includes("/admin/users"),
    },
    {
      name: "Logout",
      path: "/logout",
      icon: <LogOut size={iconSize} />,
    },
  ];

  const menuToRender = currentUser?.isAdmin ? adminMenu : userMenu;

  const onLogout = () => {
    Cookies.remove("token");
    navigate("/login");
    message.success("Logged out successfully");
  };

  return (
    <div className="lg:bg-gray-200 h-full p-5 w-full">
      <div className="flex flex-col gap-1 mt-5">
        <h1 className="text-2xl font-bold text-info">
        WEALTHWISE
        </h1>
        <span className="text-sm text-gray-600">{currentUser?.name}</span>
      </div>

      <div className="flex flex-col gap-10 mt-20">
        {menuToRender.map((item: any) => (
          <div
            className={`cursor-pointer px-5 py-3 rounded-3xl flex gap-5 text-sm items-center ${
              item.isActive ? "bg-info text-white" : ""
            }`}
            key={item.name}
            onClick={() => {
              if (item.name === "Logout") {
                onLogout();
              } else {
                navigate(item.path);
              }
            }}
          >
            <span>{item.icon}</span>
            <span>{item.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default MenuItems;
