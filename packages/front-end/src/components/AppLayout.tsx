import { useRequest } from "ahooks";
import { Breadcrumb, Layout, Menu, theme, type MenuProps } from "antd";
import { Suspense, useEffect, useMemo } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { getRoutes } from "../api/request";
import type { MenuItem } from "../api/types";
import type { BreadcrumbItemType } from "../contexts/LayoutContext";
import { useLayoutContext } from "../hooks/useLayoutContext";
import Loading from "./Loading";

const { Content, Sider } = Layout;

const flattenMenu = (items: MenuItem[]): MenuItem[] =>
  items.reduce<MenuItem[]>((acc, item) => {
    acc.push(item);
    if (item.children) {
      acc.push(...flattenMenu(item.children));
    }
    return acc;
  }, []);

const findBreadcrumbPath = (
  key: string,
  flatMenuItems: MenuItem[]
): BreadcrumbItemType[] => {
  const breadcrumbPath = flatMenuItems.filter((item) => key.includes(item.key));
  return breadcrumbPath.map((item) => ({ title: item.label, key: item.key }));
};

export default function AppLayout() {
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  const { menuItems, setMenu, breadcrumbItems, setBreadcrumb } =
    useLayoutContext();

  const navigate = useNavigate();
  const { pathname } = useLocation();

  const { loading: menuLoading } = useRequest(getRoutes, {
    onSuccess: (data) => {
      setMenu(data.data);
    },
  });

  const defaultOpenKeys = useMemo(() => {
    const paths = pathname.split("/").filter((i) => i);
    return paths.map((_, index) => `/${paths.slice(0, index + 1).join("/")}`);
  }, [pathname]);

  const selectedKeys = useMemo(() => [pathname], [pathname]);

  const onNavigate: MenuProps["onClick"] = ({ key }) => {
    navigate(key);
  };

  // 缓存扁平化的路由数组
  const flatMenuItems = useMemo(
    () => flattenMenu(menuItems as MenuItem[]),
    [menuItems]
  );

  // 监听路由变化，设置面包屑
  useEffect(() => {
    setBreadcrumb(findBreadcrumbPath(pathname, flatMenuItems));
  }, [pathname, flatMenuItems, setBreadcrumb]);

  return (
    <Layout>
      <Layout>
        <Sider width={200} style={{ background: colorBgContainer }}>
          <div className="center m-1 py-1 bg-pink-100 rounded-lg">
            <img
              className="h-8"
              src="https://static.bytespark.app/test/img/avatar.png"
              alt="logo"
            />
          </div>
          {menuLoading ? (
            <Loading />
          ) : (
            <Menu
              className="h-full border-0 overflow-y-auto"
              mode="inline"
              defaultOpenKeys={defaultOpenKeys}
              selectedKeys={selectedKeys}
              items={menuItems}
              onClick={onNavigate}
            />
          )}
        </Sider>
        <Layout className="px-6 pb-6">
          <Breadcrumb className="my-4" items={breadcrumbItems}></Breadcrumb>
          <Content
            className="p-6 overflow-auto"
            style={{
              background: colorBgContainer,
              borderRadius: borderRadiusLG,
            }}
          >
            <Suspense fallback={<Loading />}>
              <Outlet />
            </Suspense>
          </Content>
        </Layout>
      </Layout>
    </Layout>
  );
}
