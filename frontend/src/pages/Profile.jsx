import React, { useState, useEffect } from "react";
import { Container, Card, Form, Button, Row, Col, Spinner } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { doc, updateDoc, getDoc } from "firebase/firestore";

import { 
  getAuth, 
  updatePassword,
  EmailAuthProvider,
  reauthenticateWithCredential
} from "firebase/auth";
import { db } from "../firebase";
import { useUser } from "../context/UserContext";
import { getProvinces, getCommunes } from "../API/Vietnam";
import "../style/Profile.css";
import Swal from "sweetalert2";

export default function Profile() {

const { user, loading } = useUser();
const navigate = useNavigate();

const [form, setForm] = useState({
  fullname: "",
  email: "",
  phone: "",
  address: "",
  province: "",
  commune: "",
});

const [passwordData, setPasswordData] = useState({
  currentPassword: "",
  newPassword: "",
  confirmPassword: "",
});

const [provinces, setProvinces] = useState([]);
const [communes, setCommunes] = useState([]);
const [selectedProvince, setSelectedProvince] = useState("");
const [updating, setUpdating] = useState(false);


/* LOAD PROVINCES */
useEffect(() => {
  const fetchProvinces = async () => {
    const data = await getProvinces();
    setProvinces(data);
  };
  fetchProvinces();
}, []);


/* LOAD USER */
/* LOAD USER */
useEffect(() => {

  const loadUserData = async () => {

    if (loading) return;

    if (!user) {
      navigate("/login");
      return;
    }

    const userRef = doc(db, "users", user.uid);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {

      const data = userSnap.data();

      setForm({
        fullname: data.fullname || "",
        email: user.email,
        phone: data.phone || "",
        address: data.address || "",
        province: data.province || "",
        commune: data.commune || "",
      });

      if (data.province && provinces.length) {

        const province = provinces.find(
          (p) => p.name === data.province
        );

        if (province) {
          setSelectedProvince(province.code);
          getCommunes(province.code).then(setCommunes);
        }

      }

    }

  };

  loadUserData();

}, [user, loading, provinces, navigate]);


/* CHANGE INPUT */
const handleChange = (e) => {

  setForm({
    ...form,
    [e.target.name]: e.target.value,
  });

};



/* CHANGE PROVINCE */
const handleProvinceChange = async (e) => {

  const provinceCode = e.target.value;
  setSelectedProvince(provinceCode);

  const province = provinces.find(
    (p) => p.code.toString() === provinceCode
  );

  setForm({
    ...form,
    province: province?.name || "",
    commune: "",
  });

  const data = await getCommunes(provinceCode);
  setCommunes(data);

};



/* CHANGE COMMUNE */
const handleCommuneChange = (e) => {

  setForm({
    ...form,
    commune: e.target.value,
  });

};



/* UPDATE PROFILE */
const handleUpdate = async (e) => {

  e.preventDefault();

  if (!user || !user.uid) {

    Swal.fire({
      icon: "error",
      title: "Bạn chưa đăng nhập!",
      text: "Vui lòng đăng nhập lại.",
    });

    return;
  }

  if (!form.fullname.trim()) {

    Swal.fire({
      icon: "warning",
      title: "Thiếu thông tin",
      text: "Vui lòng nhập họ tên!",
    });

    return;
  }

  setUpdating(true);

  try {

    const userRef = doc(db, "users", user.uid);

    await updateDoc(userRef, {
      fullname: form.fullname,
      phone: form.phone,
      address: form.address,
      province: form.province,
      commune: form.commune,
    });

    Swal.fire({
      icon: "success",
      title: "Cập nhật thành công!",
      timer: 1500,
      showConfirmButton: false,
    });

  } catch (error) {

    Swal.fire({
      icon: "error",
      title: "Lỗi!",
      text: "Không thể cập nhật thông tin.",
    });

  }

  setUpdating(false);

};



/* CHANGE PASSWORD */
const handleChangePassword = async (e) => {

  e.preventDefault();

  if (
    !passwordData.currentPassword ||
    !passwordData.newPassword ||
    !passwordData.confirmPassword
  ) {

    Swal.fire({
      icon: "warning",
      title: "Thiếu thông tin",
      text: "Vui lòng nhập đầy đủ mật khẩu.",
    });

    return;
  }

  if (passwordData.newPassword !== passwordData.confirmPassword) {

    Swal.fire({
      icon: "error",
      title: "Mật khẩu không khớp",
    });

    return;
  }

  if (passwordData.newPassword.length < 6) {

    Swal.fire({
      icon: "warning",
      title: "Mật khẩu phải ít nhất 6 ký tự",
    });

    return;
  }

  try {

    const auth = getAuth();
    const currentUser = auth.currentUser;

    const credential = EmailAuthProvider.credential(
      currentUser.email,
      passwordData.currentPassword
    );

    await reauthenticateWithCredential(currentUser, credential);

    await updatePassword(currentUser, passwordData.newPassword);

    Swal.fire({
      icon: "success",
      title: "Đổi mật khẩu thành công!",
      timer: 1500,
      showConfirmButton: false,
    });

    setPasswordData({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });

  } catch (error) {

    Swal.fire({
      icon: "error",
      title: "Mật khẩu hiện tại sai hoặc cần đăng nhập lại",
    });

  }

};



/* LOADING */
if (loading) {

  return (
    <div className="d-flex justify-content-center align-items-center vh-100">
      <Spinner animation="border" variant="danger" />
    </div>
  );

}



return (

<div className="profile-page py-5">

  <Container>

    {/* PROFILE */}
    <Card className="shadow-sm p-4 border-0">

      <h4 className="fw-bold text-danger mb-4">
        Hồ sơ người dùng
      </h4>

      <Form onSubmit={handleUpdate}>

        <Row>

          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>Họ và tên</Form.Label>
              <Form.Control
                type="text"
                name="fullname"
                value={form.fullname}
                onChange={handleChange}
                required
              />
            </Form.Group>
          </Col>

          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                value={form.email}
                disabled
              />
            </Form.Group>
          </Col>

        </Row>

        <Row>

          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>Số điện thoại</Form.Label>
              <Form.Control
                type="tel"
                name="phone"
                value={form.phone}
                onChange={handleChange}
              />
            </Form.Group>
          </Col>

          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>Địa chỉ cụ thể</Form.Label>
              <Form.Control
                type="text"
                name="address"
                value={form.address}
                onChange={handleChange}
              />
            </Form.Group>
          </Col>

        </Row>

        <Row>

          <Col md={6}>

            <Form.Group className="mb-3">

              <Form.Label>Tỉnh / Thành phố</Form.Label>

              <Form.Select
                value={selectedProvince}
                onChange={handleProvinceChange}
              >

                <option value="">
                  -- Chọn Tỉnh / Thành phố --
                </option>

                {provinces.map((p) => (
                  <option key={p.code} value={p.code}>
                    {p.name}
                  </option>
                ))}

              </Form.Select>

            </Form.Group>

          </Col>

          <Col md={6}>

            <Form.Group className="mb-3">

              <Form.Label>Phường / Xã</Form.Label>

              <Form.Select
                value={form.commune}
                onChange={handleCommuneChange}
                disabled={!communes.length}
              >

                <option value="">
                  {communes.length
                    ? "-- Chọn Phường / Xã --"
                    : "Chọn Tỉnh trước"}
                </option>

                {communes.map((c) => (
                  <option key={c.code} value={c.name}>
                    {c.name}
                  </option>
                ))}

              </Form.Select>

            </Form.Group>

          </Col>

        </Row>

        <div className="text-end mt-3">

          <Button
            type="submit"
            variant="danger"
            disabled={updating}
          >

            {updating ? "Đang cập nhật..." : "Cập nhật"}

          </Button>

        </div>

      </Form>

    </Card>



    {/* CHANGE PASSWORD */}
    <Card className="shadow-sm p-4 border-0 mt-4">

      <h5 className="fw-bold text-danger mb-3">
        Đổi mật khẩu
      </h5>

      <Form onSubmit={handleChangePassword}>

        <Form.Group className="mb-3">
          <Form.Label>Mật khẩu hiện tại</Form.Label>
          <Form.Control
            type="password"
            value={passwordData.currentPassword}
            onChange={(e) =>
              setPasswordData({
                ...passwordData,
                currentPassword: e.target.value,
              })
            }
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Mật khẩu mới</Form.Label>
          <Form.Control
            type="password"
            value={passwordData.newPassword}
            onChange={(e) =>
              setPasswordData({
                ...passwordData,
                newPassword: e.target.value,
              })
            }
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Xác nhận mật khẩu</Form.Label>
          <Form.Control
            type="password"
            value={passwordData.confirmPassword}
            onChange={(e) =>
              setPasswordData({
                ...passwordData,
                confirmPassword: e.target.value,
              })
            }
          />
        </Form.Group>

        <div className="text-end">
          <Button variant="danger" type="submit">
            Đổi mật khẩu
          </Button>
        </div>

      </Form>

    </Card>

  </Container>

</div>

);

}