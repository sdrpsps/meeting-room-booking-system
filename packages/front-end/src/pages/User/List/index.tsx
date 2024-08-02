import { useRequest } from "ahooks";
import {
  Button,
  Col,
  Form,
  Image,
  Input,
  message,
  Row,
  Table,
  Tag,
  type PaginationProps,
  type TableProps,
} from "antd";
import { useForm } from "antd/es/form/Form";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { getUserList } from "../../../api/request";
import type { GetUserListParams, User } from "../../../api/types";
import { getTableScroll } from "../../../utils/getTableScroll";

export default function List() {
  const [pageNum, setPageNum] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(20);
  const [total, setTotal] = useState<number>(0);
  const [userResult, setUserResult] = useState<User[]>();
  const [form] = useForm();
  const tableRef = useRef(null);
  const [scrollY, setScrollY] = useState("");

  const columns: TableProps<User>["columns"] = useMemo(
    () => [
      { title: "操作", align: "center", width: 100 },
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
        render: (value) => (value ? <Tag color="red">已冻结</Tag> : null),
      },
      {
        title: "管理员",
        dataIndex: "isAdmin",
        align: "center",
        width: 100,
        render: (value) => (value ? <Tag color="green">是</Tag> : null),
      },
    ],
    []
  );

  const { run, loading: tableLoading } = useRequest(getUserList, {
    manual: true,
    onSuccess(data) {
      setUserResult(data.data.users);
      setTotal(data.data.total);
    },
    onError(error) {
      message.error(error.message);
    },
  });

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

  useEffect(() => {
    setScrollY(getTableScroll({ ref: tableRef }));
  }, []);

  return (
    <div ref={tableRef}>
      <Form
        className="mb-6"
        form={form}
        name="search"
        layout="inline"
        onFinish={onFinish}
      >
        <Row className="w-full">
          <Col span={7}>
            <Form.Item label="用户名" name="name">
              <Input />
            </Form.Item>
          </Col>
          <Col span={7}>
            <Form.Item label="昵称" name="nickName">
              <Input />
            </Form.Item>
          </Col>
          <Col span={7}>
            <Form.Item label="邮箱" name="email">
              <Input />
            </Form.Item>
          </Col>
          <Col span={3}>
            <Form.Item>
              <Button type="primary" htmlType="submit">
                搜索
              </Button>
            </Form.Item>
          </Col>
        </Row>
      </Form>
      <Table
        dataSource={userResult}
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
        scroll={{ y: scrollY }}
      />
    </div>
  );
}
