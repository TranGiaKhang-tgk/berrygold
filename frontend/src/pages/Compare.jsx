import { useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";

function Compare() {
  const navigate = useNavigate();
  const location = useLocation();

  const [selected, setSelected] = useState(() => {
    const saved = localStorage.getItem("compare");
    return saved ? JSON.parse(saved) : [null, null, null];
  });

  const [ranking, setRanking] = useState([]);

  // 🔥 NHẬN DATA
  useEffect(() => {
    if (location.state?.selectedProduct !== undefined) {
      const { selectedProduct, index } = location.state;

      if (index === undefined) return;

      setSelected((prev) => {
        const newArr = [...prev];
        newArr[index] = selectedProduct;
        return newArr;
      });
    }
  }, [location.state]);

  // 🔥 SAVE LOCAL
  useEffect(() => {
    localStorage.setItem("compare", JSON.stringify(selected));
  }, [selected]);

  // 🔥 FORMAT GIÁ
  const formatPrice = (price) => {
    return price
      ? new Intl.NumberFormat("vi-VN").format(price) + " đ"
      : "-";
  };

  // 🔥 PARSE SỐ
  const parseNumber = (str) => {
    if (!str) return 0;
    return parseInt(str.replace(/\D/g, "")) || 0;
  };

  // 🔥 SO SÁNH + XẾP HẠNG
  const handleCompare = () => {
    const valid = selected.filter(Boolean);

    if (valid.length < 2) {
      alert("Chọn ít nhất 2 sản phẩm");
      return;
    }

    const result = valid.map((p) => ({
      ...p,
      score: 0,
    }));

    // 👉 so sánh từng cặp
    for (let i = 0; i < result.length; i++) {
      for (let j = 0; j < result.length; j++) {
        if (i === j) continue;

        // 🔥 GIÁ (thấp hơn tốt hơn)
        if (result[i].price < result[j].price) {
          result[i].score += 1;
        }

        // 🔥 RAM (cao hơn tốt hơn)
        if (parseNumber(result[i].ram) > parseNumber(result[j].ram)) {
          result[i].score += 1;
        }

        // 🔥 STORAGE
        if (parseNumber(result[i].storage) > parseNumber(result[j].storage)) {
          result[i].score += 1;
        }
      }
    }

    // 🔥 SORT
    result.sort((a, b) => b.score - a.score);

    setRanking(result);
  };

  return (
    <div style={{ padding: "20px" }}>
      <h3>So sánh sản phẩm</h3>

      {/* 🔥 3 KHUNG */}
      <div style={{ display: "flex", gap: "15px", marginTop: "20px" }}>
        {selected.map((p, i) => (
          <div
            key={i}
            style={{
              flex: 1,
              border: "1px dashed #ccc",
              height: "180px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              background: "#fff",
              borderRadius: "10px",
              padding: "10px",
            }}
            onClick={() =>
              navigate("/compare/select", {
                state: {
                  index: i,
                  firstProduct: selected[0],
                },
              })
            }
          >
            {p ? (
              <div style={{ textAlign: "center" }}>
                <img
                  src={
                    p.image ||
                    p.images?.[0] ||
                    "/images/noimage.jpg"
                  }
                  alt={p.name}
                  style={{
                    width: "80px",
                    height: "80px",
                    objectFit: "contain",
                  }}
                />

                <p style={{ fontSize: "13px" }}>{p.name}</p>

                <p
                  style={{ color: "red", cursor: "pointer" }}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelected((prev) => {
                      const newArr = [...prev];
                      newArr[i] = null;
                      return newArr;
                    });
                  }}
                >
                  Xóa
                </p>
              </div>
            ) : (
              <span>➕ Chọn sản phẩm</span>
            )}
          </div>
        ))}
      </div>

      {/* 🔥 BUTTON */}
      <div style={{ textAlign: "center", marginTop: "20px" }}>
        <button
          onClick={handleCompare}
          style={{
            padding: "10px 20px",
            background: "#dc3545",
            color: "#fff",
            border: "none",
            borderRadius: "6px",
          }}
        >
          So sánh
        </button>
      </div>

      {/* 🔥 TABLE */}
      {selected.filter(Boolean).length >= 2 && (
        <div style={{ marginTop: "30px" }}>
          <h4>Bảng so sánh</h4>

          <table border="1" cellPadding="10" style={{ width: "100%" }}>
            <thead>
              <tr>
                <th>Thông số</th>
                {selected.filter(Boolean).map((p) => (
                  <th key={p.id}>{p.name}</th>
                ))}
              </tr>
            </thead>

            <tbody>
              <tr>
                <td>Giá</td>
                {selected.filter(Boolean).map((p) => (
                  <td key={p.id}>{formatPrice(p.price)}</td>
                ))}
              </tr>

              <tr>
                <td>RAM</td>
                {selected.filter(Boolean).map((p) => (
                  <td key={p.id}>{p.ram || "-"}</td>
                ))}
              </tr>

              <tr>
                <td>Bộ nhớ</td>
                {selected.filter(Boolean).map((p) => (
                  <td key={p.id}>{p.storage || "-"}</td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {/* 🔥 XẾP HẠNG */}
      {ranking.length > 0 && (
        <div style={{ marginTop: "30px" }}>
          <h4>🏆 Xếp hạng</h4>

          {ranking.map((p, i) => (
            <div
              key={p.id}
              style={{
                padding: "10px",
                border: "1px solid #ddd",
                marginBottom: "10px",
                borderRadius: "8px",
                background: i === 0 ? "#d4edda" : "#fff",
              }}
            >
              #{i + 1} - {p.name} ({p.score} điểm)
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Compare;
