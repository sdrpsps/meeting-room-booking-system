import { LockOutlined, UserOutlined } from "@ant-design/icons";
import { useLocalStorageState, useRequest } from "ahooks";
import { Button, Checkbox, Form, Input, message } from "antd";
import { useNavigate } from "react-router-dom";
import { login, type LoginUser } from "../api/login";

interface FormLoginUser extends LoginUser {
  remember: boolean;
}

export function Login() {
  const [, setJwt] = useLocalStorageState("jwtAuth");
  const navigate = useNavigate();

  const { run, loading } = useRequest(login, {
    manual: true,
    onSuccess: (result) => {
      message.success("登录成功");
      const { accessToken, refreshToken } = result.data;
      setJwt({ accessToken, refreshToken });
      navigate("/");
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
    <div className="max-w-sm mx-auto">
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
            <a>创建帐号</a>
            <a>忘记密码</a>
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
