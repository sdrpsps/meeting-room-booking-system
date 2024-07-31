// import type { BreadcrumbItemType } from "antd/es/breadcrumb/Breadcrumb";
import { createContext, useCallback, useState, type ReactNode } from "react";
// import type { MenuItem } from "../api/types";
import type { MenuProps } from "antd";
import type { MenuItem as ResMenuItem } from "../api/types";
import iconMapping from "../utils/iconMapping";

type MenuItem = Required<MenuProps>["items"][number];

export interface BreadcrumbItemType {
  key: string;
  title: string;
}

export interface LayoutContextType {
  menuItems: MenuItem[];
  setMenu: (menu: ResMenuItem[]) => void;
  breadcrumbItems: BreadcrumbItemType[];
  setBreadcrumb: (breadcrumb: BreadcrumbItemType[]) => void;
}

// 转换接口返回的菜单数据为 antd Menu 组件的数据格式（主要是渲染 icon）
const convertToMenuItems = (backendItems: ResMenuItem[]): MenuItem[] => {
  return backendItems.map((item) => {
    const menuItem: MenuItem = {
      key: item.key,
      label: item.label,
      icon: item.icon ? iconMapping[item.icon] : undefined,
      children: item.children ? convertToMenuItems(item.children) : undefined,
    };
    return menuItem;
  });
};

export const LayoutContext = createContext<LayoutContextType | null>(null);

export const LayoutProvider = ({ children }: { children: ReactNode }) => {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [breadcrumbItems, setBreadcrumbItems] = useState<BreadcrumbItemType[]>(
    []
  );

  const setMenu = useCallback((menu: ResMenuItem[]) => {
    const menuItems = convertToMenuItems(menu);
    setMenuItems(menuItems);
  }, []);

  const setBreadcrumb = useCallback((breadcrumb: BreadcrumbItemType[]) => {
    setBreadcrumbItems(breadcrumb);
  }, []);

  return (
    <LayoutContext.Provider
      value={{ menuItems, setMenu, breadcrumbItems, setBreadcrumb }}
    >
      {children}
    </LayoutContext.Provider>
  );
};
