// src/pages/OrderPage.jsx
import { useState } from "react";
import { useLocation } from "react-router-dom";
import HeaderNav from "../components/HeaderNav.jsx";

export default function OrderPage() {
  const location = useLocation();

  // 🔹 AI 발주 추천 페이지에서 넘어온 데이터
  //   각 item에 나중에 price(또는 unitPrice)를 붙여서 넘겨주면 됨
  const initialItems = location.state?.orderItems || [];

  // 주문 페이지에서 수정 가능하게 state로 유지
  const [items, setItems] = useState(
    initialItems.map((item, idx) => ({
      id: item.id ?? idx + 1,
      name: item.name ?? "",
      orderQty: item.orderQty ?? 0,
      // 🔸 나중에 백엔드에서 넘겨줄 단가/금액
      // orderItems에 unitPrice 또는 price가 있으면 그걸 기본값으로 사용
      unitPrice: item.unitPrice ?? item.price ?? 0,
    }))
  );

  // 수량 변경
  const handleChange = (index, value) => {
    setItems((prev) => {
      const copy = [...prev];
      copy[index] = {
        ...copy[index],
        orderQty: value === "" ? "" : Number(value),
      };
      return copy;
    });
  };

  // 상품 추가 버튼 (일단 빈 행 추가하는 용도)
  const handleAddItem = () => {
    setItems((prev) => [
      ...prev,
      {
        id: Date.now(),
        name: "",
        orderQty: 0,
        unitPrice: 0,
      },
    ]);
  };

  // 가격 포맷 (1,000원 이런 식으로)
  const formatPrice = (value) =>
    (value || 0).toLocaleString("ko-KR");

  // 각 행의 금액 = 수량 * 단가
  const getLinePrice = (item) =>
    (item.orderQty || 0) * (item.unitPrice || 0);

  // 총합
  const totalPrice = items.reduce(
    (sum, item) => sum + getLinePrice(item),
    0
  );

  return (
    <div
      style={{
        padding: "40px 16px",
        paddingTop: "80px",
        position: "relative",
        height: "100%",
      }}
    >
      <HeaderNav />
      <h1
        style={{
          textAlign: "center",
          marginBottom: "24px",
          fontSize: "26px",
        }}
      >
        주문
      </h1>

      {items.length === 0 ? (
        <p style={{ textAlign: "center" }}>
          AI 발주 추천에서 넘어온 품목이 없습니다.
        </p>
      ) : (
        <div
          style={{
            maxWidth: "380px",
            margin: "0 auto",
          }}
        >
          {/* 헤더 행 */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: "12px",
              fontWeight: "600",
            }}
          >
            <span style={{ flex: 2 }}>품목명</span>
            <span style={{ flex: 1, textAlign: "center" }}>수량</span>
            <span style={{ flex: 1, textAlign: "right" }}>
              가격(원)
            </span>
          </div>

          {/* 품목 리스트 */}
          {items.map((item, index) => (
            <div
              key={item.id}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "12px",
              }}
            >
              {/* 품목명 */}
              <span style={{ flex: 2 }}>{item.name || "-"}</span>

              {/* 수량 입력 */}
              <div
                style={{
                  flex: 1,
                  display: "flex",
                  justifyContent: "center",
                }}
              >
                <input
                  type="number"
                  value={item.orderQty}
                  onChange={(e) => handleChange(index, e.target.value)}
                  style={{
                    width: "60px",
                    height: "28px",
                    borderRadius: "4px",
                    border: "1px solid #aaa",
                    textAlign: "center",
                  }}
                />
              </div>

              {/* 금액 (수량 * 단가) */}
              <span
                style={{
                  flex: 1,
                  textAlign: "right",
                }}
              >
                {formatPrice(getLinePrice(item))}
              </span>
            </div>
          ))}

          {/* + 상품 추가 버튼 */}
          <button
            type="button"
            onClick={handleAddItem}
            style={{
              marginTop: "8px",
              padding: "8px 18px",
              borderRadius: "16px",
              border: "1px dashed #aaa",
              backgroundColor: "#CDEFFF",
              cursor: "pointer",
              fontSize: "14px",
              fontWeight: "bold",
            }}
          >
            + 상품 추가
          </button>

          {/* 구분선 */}
          <hr style={{ margin: "16px 0" }} />

          {/* 총합 */}
          <div
            style={{
              textAlign: "right",
              marginBottom: "16px",
              fontSize: "15px",
              fontWeight: "600",
            }}
          >
            총합 {formatPrice(totalPrice)}원
          </div>

          {/* 주문하기 버튼 */}
          <div style={{ textAlign: "center" }}>
            <button
              type="button"
              // onClick={handleSubmit} // 나중에 백엔드 연결
              style={{
                padding: "10px 24px",
                borderRadius: "18px",
                border: "none",
                backgroundColor: "#9BD8FF",
                cursor: "pointer",
                fontSize: "15px",
                fontWeight: "bold",
              }}
            >
              주문하기
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
