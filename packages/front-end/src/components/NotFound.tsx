import { Button, Result } from "antd";
import { useNavigate } from "react-router-dom";

export default function NotFound() {
  const navigate = useNavigate();

  const handleBackHome = () => {
    navigate("/app");
  };

  return (
    <div className="h-full w-full center">
      <Result
        status="404"
        title="404"
        subTitle="Sorry, the page you visited does not exist."
        extra={
          <Button type="primary" onClick={handleBackHome}>
            Back Home
          </Button>
        }
      />
    </div>
  );
}