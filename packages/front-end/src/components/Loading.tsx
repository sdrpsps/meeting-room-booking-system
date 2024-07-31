import { Spin } from "antd";

export default function Loading() {
  return (
    <div className="h-full w-full center">
      <Spin size="large" />
    </div>
  );
}
