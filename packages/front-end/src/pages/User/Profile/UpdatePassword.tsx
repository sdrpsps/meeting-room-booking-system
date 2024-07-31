import { LockOutlined, MailOutlined, NumberOutlined } from "@ant-design/icons";
import { useCountDown, useRequest } from "ahooks";
import { Button, Col, Form, Input, message, Row } from "antd";
import { useForm } from "antd/es/form/Form";
import { useCallback, useEffect, useState } from "react";
import { getUpdatePasswordCaptcha, updatePassword } from "../../../api/request";
import type { UpdatePasswordUser, UserInfo } from "../../../api/types";

interface UpdatePasswordProps {
  data: UserInfo | undefined;
  onUpdateSuccess: () => void;
}

interface FormUpdatePasswordUser extends UpdatePasswordUser {
  confirmPassword: boolean;
}

export default function UpdatePassword({
  data,
  onUpdateSuccess,
}: UpdatePasswordProps) {
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

  const onSendCaptcha = useCallback(() => {
    const address = form.getFieldValue("email");
    getCaptcha(address);
  }, [form, getCaptcha]);

  const { run: runUpdate, loading: updateLoading } = useRequest(
    updatePassword,
    {
      manual: true,
      onSuccess: () => {
        message.success("修改成功");
        form.resetFields();
        onUpdateSuccess();
      },
      onError: (error) => {
        message.error(error.message);
      },
    }
  );

  const onFinish = (values: FormUpdatePasswordUser) => {
    form
      .validateFields()
      .then(() => {
        runUpdate(values);
      })
      .catch(() => {
        message.error("请完成必填项");
      });
  };

  useEffect(() => {
    if (data) {
      form.setFieldsValue(data);
    }
  }, [data, form]);

  return (
    <Form
      form={form}
      labelCol={{ span: 4 }}
      wrapperCol={{ span: 16 }}
      initialValues={data}
      onFinish={onFinish}
    >
      <Form.Item label="邮箱" name="email" hasFeedback>
        <Input prefix={<MailOutlined />} disabled placeholder="邮箱" />
      </Form.Item>
      <Form.Item
        label="新密码"
        name="password"
        rules={[{ required: true, message: "请输入新密码!" }]}
        hasFeedback
      >
        <Input.Password prefix={<LockOutlined />} placeholder="新密码" />
      </Form.Item>
      <Form.Item
        label="确认新密码"
        name="confirmPassword"
        dependencies={["password"]}
        rules={[
          { required: true, message: "请输入确认新密码!" },
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
          placeholder="确认新密码"
        />
      </Form.Item>
      <Form.Item label="验证码" required>
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
      <Form.Item wrapperCol={{ offset: 4, span: 16 }}>
        <Button
          type="primary"
          htmlType="submit"
          className="w-full"
          loading={updateLoading}
        >
          修改密码
        </Button>
      </Form.Item>
    </Form>
  );
}
