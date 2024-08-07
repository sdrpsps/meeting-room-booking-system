import { useRequest } from "ahooks";
import {
  Button,
  Col,
  Form,
  Input,
  message,
  Row,
  Space,
  Table,
  Tag,
  type PaginationProps,
  type TableProps,
} from "antd";
import { useForm } from "antd/es/form/Form";
import { useCallback, useEffect, useMemo, useState } from "react";
import { deleteMeetRoom, getMeetRoomList } from "../../../api/request";
import type { GetMeetRoomListParams, MeetRoom } from "../../../api/types";
import CreateMeetRoom from "./CreateMeetRoom";
import UpdateMeetRoom from "./UpdateMeetRoom";

export default function List() {
  const [pageNum, setPageNum] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(20);
  const [total, setTotal] = useState<number>(0);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [updateId, setUpdateId] = useState<number | undefined>(undefined);
  const [meetRoomResult, setMeetRoomResult] = useState<MeetRoom[]>();
  const [form] = useForm();

  const { run, loading: tableLoading } = useRequest(getMeetRoomList, {
    manual: true,
    onSuccess(data) {
      setMeetRoomResult(data.data.list);
      setTotal(data.data.total);
    },
    onError(error) {
      message.error(error.message);
    },
  });

  const { run: runDelete, loading: deleteLoading } = useRequest(
    deleteMeetRoom,
    {
      manual: true,
      onSuccess(data) {
        message.success(data.data);
        fetchData();
      },
      onError(error) {
        message.error(error.message);
      },
    }
  );

  const onReset = () => {
    form.resetFields();
  };

  const onTableChange: PaginationProps["onChange"] = useCallback(
    (newPageNum: number, newPageSize: number) => {
      if (pageSize !== newPageSize) {
        setPageNum(1);
        setPageSize(newPageSize);
        setMeetRoomResult([]);
      } else {
        setPageNum(newPageNum);
        setPageSize(newPageSize);
      }
    },
    [pageSize]
  );

  const onFinish = useCallback(
    (values: Omit<GetMeetRoomListParams, "pageNum" | "pageSize">) => {
      setPageNum(1);
      run({ ...values, pageNum, pageSize });
    },
    [pageNum, pageSize, run]
  );

  const columns: TableProps<MeetRoom>["columns"] = useMemo(
    () => [
      {
        title: "操作",
        dataIndex: "id",
        align: "center",
        width: 150,
        render: (value) => {
          return (
            <Space>
              <Button
                className="text-indigo-700"
                type="text"
                onClick={() => {
                  setUpdateId(value);
                  setIsUpdateModalOpen(true);
                }}
              >
                修改
              </Button>
              <Button
                danger
                type="text"
                loading={deleteLoading}
                onClick={() => runDelete(value)}
              >
                删除
              </Button>
            </Space>
          );
        },
      },
      { title: "名称", dataIndex: "name", align: "center" },
      { title: "容纳人数", dataIndex: "capacity", align: "center" },
      { title: "位置", dataIndex: "location", align: "center" },
      {
        title: "设备",
        dataIndex: "equipment",
        align: "center",
        render: (value) => value.replaceAll(",", "/"),
      },
      { title: "描述", dataIndex: "description", align: "center" },
      { title: "添加时间", dataIndex: "createdAt", align: "center" },
      { title: "更新时间", dataIndex: "updatedAt", align: "center" },
      {
        title: "预订状态",
        dataIndex: "isBooked",
        align: "center",
        width: 100,
        render: (value) =>
          value ? (
            <Tag color="red">已预订</Tag>
          ) : (
            <Tag color="green">可预订</Tag>
          ),
      },
    ],
    [runDelete, deleteLoading]
  );

  const fetchData = useCallback(() => {
    const formValues = form.getFieldsValue();
    run({ ...formValues, pageNum, pageSize });
  }, [form, pageNum, pageSize, run]);

  useEffect(() => {
    fetchData();
  }, [fetchData, pageNum, pageSize]);

  return (
    <>
      <Form form={form} name="search" layout="inline" onFinish={onFinish}>
        <Row className="w-full">
          <Col span={6}>
            <Form.Item label="会议室名称" name="name">
              <Input />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item label="容纳人数" name="capacity">
              <Input />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item label="设备" name="equipment">
              <Input />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item>
              <Space>
                <Button type="primary" htmlType="submit">
                  搜索
                </Button>
                <Button onClick={onReset}>重置</Button>
              </Space>
            </Form.Item>
          </Col>
        </Row>
      </Form>
      <Row className="my-4">
        <Button
          className="!bg-violet"
          type="primary"
          onClick={() => setIsCreateModalOpen(true)}
        >
          新增会议室
        </Button>
      </Row>
      <Table
        dataSource={meetRoomResult}
        loading={tableLoading}
        columns={columns}
        rowKey={(record) => record.id}
        pagination={{
          defaultCurrent: 1,
          defaultPageSize: 20,
          current: pageNum,
          pageSize,
          total,
          onChange: onTableChange,
        }}
      />
      <CreateMeetRoom
        isModalOpen={isCreateModalOpen}
        setIsModalOpen={setIsCreateModalOpen}
        fetchData={fetchData}
      />
      <UpdateMeetRoom
        id={updateId!}
        isModalOpen={isUpdateModalOpen}
        setIsModalOpen={setIsUpdateModalOpen}
        fetchData={fetchData}
      />
    </>
  );
}
