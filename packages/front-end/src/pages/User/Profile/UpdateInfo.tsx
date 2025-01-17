import {
  MailOutlined,
  NumberOutlined,
  PhoneOutlined,
  PlusOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { useCountDown, useRequest } from "ahooks";
import {
  Button,
  Col,
  Form,
  Image,
  Input,
  message,
  Row,
  Upload,
  type UploadFile,
} from "antd";
import { useForm } from "antd/es/form/Form";
import type { RcFile, UploadChangeParam, UploadProps } from "antd/es/upload";
import { useCallback, useEffect, useState } from "react";
import {
  getUpdateUserInfoCaptcha,
  updateUserInfo,
  upload,
} from "../../../api/request";
import type { UpdateUserInfo, UserInfo } from "../../../api/types";

interface UpdateInfoProps {
  data: UserInfo | undefined;
  onUpdateSuccess: () => void;
}

export default function UpdateInfo({ data, onUpdateSuccess }: UpdateInfoProps) {
  const [form] = useForm();
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState("");

  const onFileChange = ({ fileList }: UploadChangeParam) => {
    setFileList(fileList);
  };

  const [targetDate, setTargetDate] = useState<number>();
  const [countdown] = useCountDown({
    targetDate,
  });

  const { runAsync: runUpload } = useRequest(upload, {
    manual: true,
    onSuccess: (result, params: RcFile[]) => {
      setFileList((prevFileList) =>
        prevFileList.map((file) =>
          file.uid === params[0].uid
            ? { ...file, status: "done", response: result, url: result }
            : file
        )
      );

      message.success("上传成功");
    },
    onError: (_, params: RcFile[]) => {
      setFileList((prevFileList) =>
        prevFileList.map((file) =>
          file.uid === params[0].uid ? { ...file, status: "error" } : file
        )
      );

      message.error("上传错误");
    },
  });

  const onUpload: UploadProps["customRequest"] = ({
    file,
    onSuccess,
    onError,
  }) => {
    runUpload(file as RcFile)
      .then(onSuccess)
      .catch(onError);
  };

  const onPreview: UploadProps["onPreview"] = (file) => {
    setPreviewImage(file.url || (file.preview as string));
    setPreviewOpen(true);
  };

  const { run: getCaptcha, loading: captchaLoading } = useRequest(
    getUpdateUserInfoCaptcha,
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
    updateUserInfo,
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

  const onFinish = (values: UpdateUserInfo) => {
    form
      .validateFields()
      .then(() => {
        const avatar = fileList[0].url;
        runUpdate({ ...values, avatar });
      })
      .catch(() => {
        message.error("请完成必填项");
      });
  };

  useEffect(() => {
    if (data) {
      form.setFieldsValue(data);
      if (data.avatar) {
        setFileList([
          {
            uid: "-1",
            name: "avatar.png",
            status: "done",
            url: data.avatar,
          },
        ]);
      }
    }
  }, [data, form]);

  return (
    <Form
      name="update-info"
      form={form}
      labelCol={{ span: 4 }}
      wrapperCol={{ span: 16 }}
      initialValues={data}
      onFinish={onFinish}
    >
      <Form.Item label="头像" name="avatar">
        <Upload
          name="avatar"
          fileList={fileList}
          customRequest={onUpload}
          maxCount={1}
          listType="picture-card"
          onChange={onFileChange}
          onPreview={onPreview}
        >
          {fileList.length >= 1 ? null : (
            <button className="bg-transparent" type="button">
              <PlusOutlined />
            </button>
          )}
        </Upload>
      </Form.Item>
      <Form.Item label="用户名" name="name" hasFeedback>
        <Input prefix={<UserOutlined />} disabled placeholder="用户名" />
      </Form.Item>
      <Form.Item
        label="昵称"
        name="nickName"
        rules={[{ required: true, message: "请输入昵称!" }]}
        hasFeedback
      >
        <Input prefix={<UserOutlined />} placeholder="昵称" />
      </Form.Item>
      <Form.Item label="邮箱" name="email" hasFeedback>
        <Input prefix={<MailOutlined />} disabled placeholder="邮箱" />
      </Form.Item>
      <Form.Item
        label="手机号"
        name="phoneNumber"
        rules={[
          {
            pattern: /^(?:(?:\+|00)86)?1[3-9]\d{9}$/,
            message: "手机号格式不正确",
          },
        ]}
        hasFeedback
      >
        <Input prefix={<PhoneOutlined />} placeholder="手机号" />
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
          修改信息
        </Button>
      </Form.Item>
      {previewImage && (
        <Image
          wrapperStyle={{ display: "none" }}
          preview={{
            visible: previewOpen,
            onVisibleChange: (visible) => setPreviewOpen(visible),
            afterOpenChange: (visible) => !visible && setPreviewImage(""),
          }}
          src={previewImage}
        />
      )}
    </Form>
  );
}
