import { useRequest } from "ahooks";
import {
  Button,
  Col,
  Form,
  Image,
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
import { freezeUser, getUserList } from "../../../api/request";
import type { GetUserListParams, User } from "../../../api/types";

export default function List() {
  const [pageNum, setPageNum] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(20);
  const [total, setTotal] = useState<number>(0);
  const [userResult, setUserResult] = useState<User[]>();
  const [form] = useForm();

  const { run, loading: tableLoading } = useRequest(getUserList, {
    manual: true,
    onSuccess(result) {
      setUserResult(result.list);
      setTotal(result.total);
    },
    onError(error) {
      message.error(error.message);
    },
  });

  const { run: runFreeze, loading: freezeLoading } = useRequest(freezeUser, {
    manual: true,
    onSuccess(result) {
      message.success(result);
      fetchData();
    },
  });

  const columns: TableProps<User>["columns"] = useMemo(
    () => [
      {
        title: "操作",
        dataIndex: "id",
        align: "center",
        width: 100,
        render: (value, record) => {
          return (
            <Button
              danger
              type="text"
              onClick={() => runFreeze(value, record.isFrozen ? 0 : 1)}
            >
              {record.isFrozen ? "解冻" : "冻结"}
            </Button>
          );
        },
      },
      { title: "用户名", dataIndex: "name", align: "center" },
      { title: "昵称", dataIndex: "nickName", align: "center" },
      {
        title: "头像",
        dataIndex: "avatar",
        align: "center",
        render: (value) => {
          return value ? <Image width={100} src={value} /> : null;
        },
      },
      { title: "邮箱", dataIndex: "email", align: "center" },
      { title: "注册时间", dataIndex: "createdAt", align: "center" },
      {
        title: "状态",
        dataIndex: "isFrozen",
        align: "center",
        width: 100,
        render: (value) =>
          value ? <Tag color="red">已冻结</Tag> : <Tag color="green">正常</Tag>,
      },
      {
        title: "管理员",
        dataIndex: "isAdmin",
        align: "center",
        width: 100,
        render: (value) => (value ? <Tag color="green">是</Tag> : null),
      },
    ],
    [runFreeze]
  );

  const fetchData = useCallback(() => {
    const formValues = form.getFieldsValue();
    run({ ...formValues, pageNum, pageSize });
  }, [form, pageNum, pageSize, run]);

  const onTableChange: PaginationProps["onChange"] = useCallback(
    (newPageNum: number, newPageSize: number) => {
      if (pageSize !== newPageSize) {
        setPageNum(1);
        setPageSize(newPageSize);
        setUserResult([]);
      } else {
        setPageNum(newPageNum);
        setPageSize(newPageSize);
      }
    },
    [pageSize]
  );

  const onReset = () => {
    form.resetFields();
  };

  const onFinish = useCallback(
    (values: Omit<GetUserListParams, "pageNum" | "pageSize">) => {
      setPageNum(1);
      run({ ...values, pageNum, pageSize });
    },
    [pageNum, pageSize, run]
  );

  useEffect(() => {
    fetchData();
  }, [fetchData, pageNum, pageSize, run]);

  return (
    <>
      <Form
        className="mb-6"
        form={form}
        name="search"
        layout="inline"
        onFinish={onFinish}
      >
        <Row className="w-full">
          <Col span={6}>
            <Form.Item label="用户名" name="name">
              <Input />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item label="昵称" name="nickName">
              <Input />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item label="邮箱" name="email">
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
      <Table
        dataSource={userResult}
        loading={tableLoading || freezeLoading}
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
    </>
  );
}
