import { LockOutlined, MailOutlined, NumberOutlined } from "@ant-design/icons";
import { useCountDown, useRequest } from "ahooks";
import { Button, Col, Form, Input, message, Row } from "antd";
import { useForm } from "antd/es/form/Form";
import { useCallback, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  getUpdatePasswordCaptcha,
  updatePassword
} from "../api/request";
import type { UpdatePasswordUser } from "../api/types";

interface FormUpdatePasswordUser extends UpdatePasswordUser {
  confirmPassword: boolean;
}

export function ForgotPassword() {
  const navigate = useNavigate();
  const [form] = useForm();
  const [targetDate, setTargetDate] = useState<number>();
  const [countdown] = useCountDown({
    targetDate,
  });
  const { run: getCaptcha, loading: captchaLoading } = useRequest(
    getUpdatePasswordCaptcha,
    {
      manual: true,
      onSuccess: () => {
        message.success("验证码已发送");
        setTargetDate(Date.now() + 60000);
      },
      onError: (error) => {
        message.error(error.message);
      },
    }
  );

  const { run: runUpdatePassword, loading: updatePasswordLoading } = useRequest(updatePassword, {
    manual: true,
    onSuccess: () => {
      message.success("修改成功");

      setTimeout(() => {
        navigate("/login");
      }, 1500);
    },
    onError: (error) => {
      message.error(error.message);
    },
  });

  const onSendCaptcha = useCallback(() => {
    const address = form.getFieldValue("email");

    if (!address) {
      message.error("请输入邮箱");
      return;
    }

    form
      .validateFields(["email"])
      .then(() => {
        getCaptcha(address);
      })
      .catch(() => {
        message.error("请输入正确的邮箱");
      });
  }, [form, getCaptcha]);

  const onFinish = (values: FormUpdatePasswordUser) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { confirmPassword, ...rest } = values;
    runUpdatePassword(rest);
  };

  return (
    <div className="max-w-sm mx-auto">
      <h1 className="text-2xl font-bold py-6 text-center">会议室预订系统</h1>
      <Form form={form} onFinish={onFinish}>
        <Form.Item
          name="email"
          rules={[
            { required: true, message: "请输入邮箱!" },
            { type: "email", message: "邮箱格式不正确" },
          ]}
          hasFeedback
        >
          <Input prefix={<MailOutlined />} placeholder="邮箱" />
        </Form.Item>
        <Form.Item>
          <Row gutter={8}>
            <Col span={16}>
              <Form.Item
                name="captcha"
                rules={[{ required: true, message: "请输入验证码!" }]}
                hasFeedback
                noStyle
              >
                <Input prefix={<NumberOutlined />} placeholder="验证码" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Button
                type="primary"
                disabled={countdown !== 0}
                className="w-full"
                loading={captchaLoading}
                onClick={onSendCaptcha}
              >
                {countdown === 0
                  ? "发送验证码"
                  : `${Math.round(countdown / 1000)}s`}
              </Button>
            </Col>
          </Row>
        </Form.Item>
        <Form.Item
          name="password"
          rules={[{ required: true, message: "请输入密码!" }]}
          hasFeedback
        >
          <Input.Password prefix={<LockOutlined />} placeholder="密码" />
        </Form.Item>
        <Form.Item
          name="confirmPassword"
          dependencies={["password"]}
          rules={[
            { required: true, message: "请输入确认密码!" },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue("password") === value) {
                  return Promise.resolve();
                }
                return Promise.reject(new Error("两次密码不一致!"));
              },
            }),
          ]}
          hasFeedback
        >
          <Input.Password
            prefix={<LockOutlined />}
            type="password"
            placeholder="确认密码"
          />
        </Form.Item>
        <Form.Item>
          <div className="flex justify-end">
            已有账号？去
            <Link to="/login" className="text-blue">
              登录
            </Link>
          </div>
        </Form.Item>
        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            className="w-full"
            loading={updatePasswordLoading}
          >
            修改密码
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
}
