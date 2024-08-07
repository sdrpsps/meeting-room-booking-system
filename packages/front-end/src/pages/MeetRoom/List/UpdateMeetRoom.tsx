import { useRequest } from "ahooks";
import {
  Form,
  Input,
  InputNumber,
  message,
  Modal,
  Select,
  type SelectProps,
} from "antd";
import { useForm } from "antd/es/form/Form";
import { useCallback, useEffect } from "react";
import { getMeetRoom, updateMeetRoom } from "../../../api/request";

interface UpdateMeetRoomProps {
  id: number;
  isModalOpen: boolean;
  setIsModalOpen: (isModalOpen: boolean) => void;
  fetchData: () => void;
}

const selectOptions: SelectProps["options"] = [
  { label: "电视", value: "电视" },
  { label: "白板", value: "白板" },
  { label: "投影仪", value: "投影仪" },
];

export default function UpdateMeetRoom({
  id,
  isModalOpen,
  setIsModalOpen,
  fetchData,
}: UpdateMeetRoomProps) {
  const [form] = useForm();

  const { run: runGetMeetRoom, loading: loadingGetMeetRoom } = useRequest(
    getMeetRoom,
    {
      manual: true,
      onSuccess(result) {
        form.setFieldsValue({
          ...result,
          equipment: result.equipment.split(","),
        });
      },
      onError(error) {
        message.error(error.message);
      },
    }
  );

  const { run, loading } = useRequest(updateMeetRoom, {
    manual: true,
    onSuccess(result) {
      message.success(result);
      setIsModalOpen(false);
      fetchData();
      form.resetFields();
    },
    onError(error) {
      message.error(error.message);
    },
  });

  const onOk = useCallback(() => {
    form
      .validateFields()
      .then(() => {
        const values = form.getFieldsValue();
        run({ ...values, equipment: values.equipment.join(), id });
      })
      .catch(() => {
        message.error("请检查表单内容");
      });
  }, [form, id, run]);

  const onCancel = useCallback(() => {
    setIsModalOpen(false);
    form.resetFields();
  }, [setIsModalOpen, form]);

  useEffect(() => {
    if (!id) return;
    runGetMeetRoom(id);
  }, [id, runGetMeetRoom]);

  return (
    <Modal
      title="修改会议室"
      open={isModalOpen}
      onOk={onOk}
      onCancel={onCancel}
      confirmLoading={loading}
      loading={loadingGetMeetRoom}
    >
      <Form form={form} name="update-meeting-room">
        <Form.Item
          label="名称"
          name="name"
          rules={[{ required: true, message: "请输入名称!" }]}
        >
          <Input placeholder="名称" />
        </Form.Item>
        <Form.Item
          label="容量"
          name="capacity"
          rules={[{ required: true, message: "请输入容量!" }]}
        >
          <InputNumber className="w-full" min={1} placeholder="容量" />
        </Form.Item>
        <Form.Item
          label="位置"
          name="location"
          rules={[{ required: true, message: "请输入位置!" }]}
        >
          <Input placeholder="位置" />
        </Form.Item>
        <Form.Item
          label="设备"
          name="equipment"
          rules={[{ required: true, message: "请输入设备!" }]}
        >
          <Select mode="tags" placeholder="设备" options={selectOptions} />
        </Form.Item>
        <Form.Item
          label="描述"
          name="description"
          rules={[{ required: true, message: "请输入描述!" }]}
        >
          <Input placeholder="描述" />
        </Form.Item>
      </Form>
    </Modal>
  );
}
