import { LockOutlined, UserOutlined } from "@ant-design/icons";
import { useRequest } from "ahooks";
import { Button, Checkbox, Form, Input, message } from "antd";
import { Link, useNavigate } from "react-router-dom";
import { login } from "../api/request";
import type { LoginUser } from "../api/types";

interface FormLoginUser extends LoginUser {
  remember: boolean;
}

export default function Login() {
  const navigate = useNavigate();

  const { run, loading } = useRequest(login, {
    manual: true,
    onSuccess: (result) => {
      message.success("登录成功");

      const { accessToken, refreshToken, userInfo } = result;
      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("refreshToken", refreshToken);
      localStorage.setItem("userInfo", JSON.stringify(userInfo));

      setTimeout(() => {
        navigate("/");
      }, 1500);
    },
    onError: (error) => {
      message.error(error.message);
    },
  });

  const onFinish = (values: FormLoginUser) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { remember, ...data } = values;
    run(data);
  };

  return (
    <div className="w-sm h-full mx-auto flex flex-col justify-center">
      <h1 className="text-2xl font-bold py-6 text-center">会议室预订系统</h1>
      <Form initialValues={{ remember: true }} onFinish={onFinish}>
        <Form.Item
          name="userName"
          rules={[{ required: true, message: "请输入用户名!" }]}
        >
          <Input prefix={<UserOutlined />} placeholder="用户名" />
        </Form.Item>
        <Form.Item
          name="password"
          rules={[{ required: true, message: "请输入密码!" }]}
        >
          <Input prefix={<LockOutlined />} type="password" placeholder="密码" />
        </Form.Item>
        <Form.Item>
          <div className="flex justify-between text-blue">
            <Link to="/auth/register">创建帐号</Link>
            <Link to="/auth/forgot-password">忘记密码</Link>
          </div>
        </Form.Item>
        <Form.Item
          name="remember"
          valuePropName="checked"
          className="flex justify-end"
        >
          <Checkbox>记住我</Checkbox>
        </Form.Item>
        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            className="w-full"
            loading={loading}
          >
            登录
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
}
