import { Button, Container } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import "../style/ThankYou.css";

export default function ThankYou() {
  const navigate = useNavigate();



  return (
    <div className="thankyou-page py-5">
      <Container className="text-center">
        <img
          src="https://cdn-icons-png.flaticon.com/512/845/845646.png"
          alt="Success"
          className="thankyou-icon mb-4"
        />
        <h2 className="fw-bold text-success mb-3">
          Đặt hàng thành công!
        </h2>
        <p className="text-muted mb-3">
          Cảm ơn bạn đã mua sắm tại <strong>BERRYGOLD</strong> 
        </p>

        <div className="d-flex justify-content-center gap-3">
          <Button
            variant="danger"
            onClick={() => navigate("/")}
            className="fw-semibold"
          >
            Quay về trang chủ
          </Button>
        </div>
      </Container>
    </div>
  );
}
