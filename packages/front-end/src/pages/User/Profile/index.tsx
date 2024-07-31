import { LockOutlined, MailOutlined, UserOutlined } from "@ant-design/icons";
import { useRequest } from "ahooks";
import { Tabs } from "antd";
import { useCallback, useMemo, useState } from "react";
import { getUserInfo } from "../../../api/request";
import type { UserInfo } from "../../../api/types";
import UpdateInfo from "./UpdateInfo";
import UpdateMail from "./UpdateMail";
import UpdatePassword from "./UpdatePassword";

export default function Profile() {
  const [activeKey, setActiveKey] = useState("info");
  const [userInfo, setUserInfo] = useState<UserInfo | undefined>(undefined);

  const onChange = (key: string) => {
    setActiveKey(key);
  };

  const { run } = useRequest(getUserInfo, {
    onSuccess: (result) => {
      setUserInfo(result.data);
    },
  });

  const onUpdateSuccess = useCallback(() => {
    run();
  }, [run]);

  const tabItems = useMemo(
    () => [
      {
        key: "info",
        label: "个人信息",
        icon: <UserOutlined />,
        children: (
          <UpdateInfo data={userInfo} onUpdateSuccess={onUpdateSuccess} />
        ),
      },
      {
        key: "mail",
        label: "修改邮箱",
        icon: <MailOutlined />,
        children: (
          <UpdateMail data={userInfo} onUpdateSuccess={onUpdateSuccess} />
        ),
      },
      {
        key: "password",
        label: "修改密码",
        icon: <LockOutlined />,
        children: (
          <UpdatePassword data={userInfo} onUpdateSuccess={onUpdateSuccess} />
        ),
      },
    ],
    [userInfo, onUpdateSuccess]
  );

  return (
    <>
      <Tabs
        defaultActiveKey="info"
        activeKey={activeKey}
        items={tabItems}
        onChange={onChange}
      />
    </>
  );
}
