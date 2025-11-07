// InventoryInput.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";  // 🔹 추가
import HeaderNav from "../components/HeaderNav.jsx";

export default function InventoryInput() {
  const [rows, setRows] = useState([
    { id: 1, product: "", sold: 0, remain: 0 },
  ]);

  const navigate = useNavigate(); // 🔹 라우터 이동 훅

  const handleChange = (index, field, value) => {
    setRows((prev) => {
      const copy = [...prev];
      const row = { ...copy[index] };

      if (field === "sold" || field === "remain") {
        row[field] = value === "" ? "" : Number(value);
      } else {
        row[field] = value;
      }

      copy[index] = row;
      return copy;
    });
  };

  const handleAddRow = () => {
    setRows((prev) => [
      ...prev,
      { id: Date.now(), product: "", sold: 0, remain: 0 },
    ]);
  };

  // 🔸 여기서 AI 발주 추천 페이지로 rows를 그대로 넘김
  const goToAIRecommend = () => {
    navigate("/ai-order", {
      state: {
        rows, // 재고 입력에서 사용자가 입력한 모든 데이터
      },
    });
  };

  return (
    <div
      style={{
        padding: "24px",
        paddingTop: "80px",
        position: "relative",
        height: "100%",
      }}
    >
      <HeaderNav />

      <div
        style={{
          maxWidth: "380px",
          margin: "0 auto",
          textAlign: "left",
        }}
      >
        <h1
          style={{
            textAlign: "center",
            marginBottom: "32px",
            fontSize: "28px",
          }}
        >
          재고 입력
        </h1>

        {rows.map((row, index) => (
          <div key={row.id} style={{ marginBottom: "24px" }}>
            {/* 품목명 */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                marginBottom: "12px",
              }}
            >
              <span
                style={{
                  whiteSpace: "nowrap",
                  marginRight: "16px",
                }}
              >
                품목명
              </span>
              <select
                value={row.product}
                onChange={(e) =>
                  handleChange(index, "product", e.target.value)
                }
                style={{
                  width: "100px",
                  height: "32px",
                  padding: "4px 8px",
                  borderRadius: "4px",
                  border: "1px solid #ccc",
                }}
              >
                <option value="">선택</option>
                <option value="품목 1">품목 1</option>
                <option value="품목 2">품목 2</option>
                <option value="품목 3">품목 3</option>
              </select>
            </div>

            {/* 오늘 판매량 */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                marginBottom: "12px",
                justifyContent: "space-between",
              }}
            >
              <span
                style={{ whiteSpace: "nowrap", marginRight: "8px" }}
              >
                오늘 판매량
              </span>
              <div
                style={{ display: "flex", alignItems: "center", flex: 1 }}
              >
                <input
                  type="number"
                  value={row.sold}
                  onChange={(e) =>
                    handleChange(index, "sold", e.target.value)
                  }
                  style={{
                    width: "80px",
                    height: "30px",
                    padding: "4px 8px",
                    borderRadius: "4px",
                    border: "1px solid #ccc",
                    margin: "0 8px",
                  }}
                />
                <span>개</span>
              </div>
            </div>

            {/* 남은 재고 입력 */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                marginBottom: "8px",
                justifyContent: "space-between",
              }}
            >
              <span
                style={{ whiteSpace: "nowrap", marginRight: "8px" }}
              >
                남은 재고 입력
              </span>
              <div
                style={{ display: "flex", alignItems: "center", flex: 1 }}
              >
                <input
                  type="number"
                  value={row.remain}
                  onChange={(e) =>
                    handleChange(index, "remain", e.target.value)
                  }
                  style={{
                    width: "80px",
                    height: "30px",
                    padding: "4px 8px",
                    borderRadius: "4px",
                    border: "1px solid #ccc",
                    margin: "0 8px",
                  }}
                />
                <span>개</span>
              </div>
            </div>

            <hr style={{ margin: "16px 0" }} />
          </div>
        ))}

        {/* + 추가 버튼 */}
        <button
          type="button"
          onClick={handleAddRow}
          style={{
            padding: "8px 18px",
            borderRadius: "16px",
            border: "none",
            backgroundColor: "#CDEFFF",
            cursor: "pointer",
            fontSize: "14px",
            fontWeight: "bold",
            marginRight: "8px",
          }}
        >
          + 추가
        </button>

        {/* 🔹 여기! AI 발주 추천 페이지로 이동하는 버튼 */}
        <button
          type="button"
          onClick={goToAIRecommend}
          style={{
            padding: "8px 18px",
            borderRadius: "16px",
            border: "none",
            backgroundColor: "#9BD8FF",
            cursor: "pointer",
            fontSize: "14px",
            fontWeight: "bold",
            marginTop: "12px",
            display: "inline-block",
          }}
        >
          AI 발주 추천 보기
        </button>
      </div>
    </div>
  );
}
