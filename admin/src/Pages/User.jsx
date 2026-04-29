import React, { useEffect, useState } from "react";
import {
  getUsers,
  addUser,
  updateUser,
  changeStatus
} from "../services/userService";
import { UserPlus, Search, Filter, Edit3, Lock, Unlock, Trash2, X } from "lucide-react";
import "../Style/User.css";

const User = () => {
  const [users, setUsers] = useState([]);
  const [filter, setFilter] = useState("");
  const [roleFilter, setRoleFilter] = useState("Tất cả");
  const [selectedUser, setSelectedUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    const data = await getUsers();
    setUsers(data);
    setLoading(false);
  };

  const filteredUsers = users.filter((u) => {
    const name = u.name?.toLowerCase() || "";
    const role = u.role?.toLowerCase();
    const nameMatch = name.includes(filter.toLowerCase());
    const roleMatch =
      roleFilter === "Tất cả" ||
      (roleFilter === "Khách hàng" && role === "user") ||
      (roleFilter === "Quản trị viên" && role === "admin");
    return nameMatch && roleMatch;
  });

  const handleSave = async () => {
    if (!selectedUser.name || !selectedUser.email) {
      alert("Vui lòng nhập đầy đủ thông tin");
      return;
    }
    if (selectedUser.id) {
      await updateUser(selectedUser.id, selectedUser);
    } else {
      await addUser(selectedUser);
    }
    setSelectedUser(null);
    fetchUsers();
  };

  const handleDelete = async (id) => {
    if (window.confirm("Xóa user?")) {
      await changeStatus(id, "banned");
      fetchUsers();
    }
  };

  const handleBan = async (id) => {
    await changeStatus(id, "suspended");
    fetchUsers();
  };

  const handleUnban = async (id) => {
    await changeStatus(id, "active");
    fetchUsers();
  };

  if (loading) return <div className="loading-state">Đang tải dữ liệu...</div>;

  return (
    <div className="admin-content">
      <div className="header-section">
        <div className="title-group">
          <h1>Quản lý người dùng</h1>
          <p>Xem, thêm và quản lý quyền hạn của thành viên hệ thống</p>
        </div>
        <button className="add-btn" onClick={() => setSelectedUser({})}>
          <UserPlus size={18} />
          <span>Thêm User mới</span>
        </button>
      </div>

      <div className="toolbar">
        <div className="search-wrapper">
          <Search size={18} className="search-icon" />
          <input
            placeholder="Tìm kiếm theo tên..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          />
        </div>

        <div className="filter-wrapper">
          <Filter size={18} className="filter-icon" />
          <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
            <option>Tất cả</option>
            <option>Khách hàng</option>
            <option>Quản trị viên</option>
          </select>
        </div>
      </div>

      <div className="table-container">
        <table className="modern-table">
          <thead>
            <tr>
              <th>Thông tin User</th>
              <th>Vai trò</th>
              <th>Trạng thái</th>
              <th className="text-center">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((u) => (
              <tr key={u.id}>
                <td>
                  <div className="user-profile">
                    <div className="avatar">{u.name?.charAt(0).toUpperCase()}</div>
                    <div className="info">
                      <span className="name">{u.name}</span>
                      <span className="email">{u.email}</span>
                    </div>
                  </div>
                </td>
                <td>
                  <span className={`role-tag ${u.role === 'admin' ? 'admin' : 'user'}`}>
                    {u.role === 'admin' ? 'Quản trị viên' : 'Khách hàng'}
                  </span>
                </td>
                <td>
                  <span className={`status-pill ${u.status}`}>
                    {u.status === "active" && "Đang hoạt động"}
                    {u.status === "suspended" && "Bị tạm dừng"}
                    {u.status === "banned" && "Đã cấm"}
                  </span>
                </td>
                <td>
                  <div className="action-group">
                    <button className="icon-btn edit" onClick={() => setSelectedUser(u)} title="Sửa">
                      <Edit3 size={18} />
                    </button>
                    {u.status === "active" ? (
                      <button className="icon-btn ban" onClick={() => handleBan(u.id)} title="Chặn">
                        <Lock size={18} />
                      </button>
                    ) : (
                      <button className="icon-btn unban" onClick={() => handleUnban(u.id)} title="Mở">
                        <Unlock size={18} />
                      </button>
                    )}
                    <button className="icon-btn delete" onClick={() => handleDelete(u.id)} title="Xóa">
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedUser && (
        <div className="modal-overlay">
          <div className="modern-modal">
            <div className="modal-header">
              <h3>{selectedUser.id ? "Cập nhật thông tin" : "Thêm người dùng"}</h3>
              <button className="close-btn" onClick={() => setSelectedUser(null)}>
                <X size={24} />
              </button>
            </div>
            
            <div className="modal-body">
              <div className="input-field">
                <label>Họ và tên</label>
                <input
                  placeholder="Nhập tên người dùng..."
                  value={selectedUser.name || ""}
                  onChange={(e) => setSelectedUser({ ...selectedUser, name: e.target.value })}
                />
              </div>

              <div className="input-field">
                <label>Địa chỉ Email</label>
                <input
                  placeholder="name@company.com"
                  value={selectedUser.email || ""}
                  onChange={(e) => setSelectedUser({ ...selectedUser, email: e.target.value })}
                />
              </div>

              <div className="input-field">
                <label>Phân quyền</label>
                <select
                  value={selectedUser.role || "user"}
                  onChange={(e) => setSelectedUser({ ...selectedUser, role: e.target.value })}
                >
                  <option value="user">Khách hàng (User)</option>
                  <option value="admin">Quản trị viên (Admin)</option>
                </select>
              </div>
            </div>

            <div className="modal-footer">
              <button className="cancel-link" onClick={() => setSelectedUser(null)}>Hủy bỏ</button>
              <button className="save-btn" onClick={handleSave}>Lưu thông tin</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default User;