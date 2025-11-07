import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import HeaderNav from "../components/HeaderNav.jsx";

// ✅ AI 쪽에서 요구한 API 함수
async function requestPredict({
  todaySales,
  stockIngredient,
  recipes,
  packageMeta,
  leadDays = 1,
  safetyStock = {},
}) {
  const res = await fetch("https://<YOUR-FUNCTION-URL>/predict", {
    method: "POST",
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify({
      target_date: new Date(Date.now() + 24 * 3600 * 1000)
        .toISOString()
        .slice(0, 10),
      today_sales: todaySales,
      stock_ingredient: stockIngredient,
      recipes,
      package_meta: packageMeta,
      lead_days: leadDays,
      safety_stock: safetyStock,
    }),
  });
  if (!res.ok) throw new Error("API error");
  return res.json();
}

// 🔸 지금은 더미값 — 나중에 백엔드/DB에서 가져와서 넣으면 됨
const DUMMY_STOCK_INGREDIENT = {
  밥: 5200,
  김: 20,
  단무지: 18,
  면: 40,
  육수: 12,
};

const DUMMY_RECIPES = {
  "원조김밥(줄)": { 밥: 120, 김: 1, 단무지: 1 },
  "라면(그릇)": { 면: 1, 육수: 0.5 },
};

const DUMMY_PACKAGE_META = {
  밥: 1000,
  김: 10,
  단무지: 10,
  면: 5,
  육수: 5,
};

const DUMMY_SAFETY_STOCK = {
  밥: 1000,
};

export default function AIOrderRecommend() {
  const location = useLocation();
  const navigate = useNavigate();

  // 재고 입력에서 넘어온 rows (품목명, 오늘 판매량, 남은 재고)
  const inventoryRows = location.state?.rows || [];

  // 표에 보여줄 재료별 발주 추천 행들
  const [rows, setRows] = useState([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // 컴포넌트가 마운트될 때 AI 발주 추천 호출
  useEffect(() => {
    if (!inventoryRows.length) return; // 재고 입력 없이 바로 들어온 경우 방어

    // 1) 재고 입력 rows → todaySales 변환
    const todaySales = inventoryRows.reduce((acc, row) => {
      if (!row.product) return acc;
      acc[row.product] = row.sold || 0;
      return acc;
    }, {});

    async function fetchRecommend() {
      try {
        setLoading(true);
        setError("");

        // 2) AI API 호출
        const data = await requestPredict({
          todaySales,
          stockIngredient: DUMMY_STOCK_INGREDIENT,
          recipes: DUMMY_RECIPES,
          packageMeta: DUMMY_PACKAGE_META,
          leadDays: 1,
          safetyStock: DUMMY_SAFETY_STOCK,
        });

        // 3) 응답에서 ingredient_recommend를 꺼내서 표용 데이터로 변환
        const list = (data.ingredient_recommend || []).map((item, idx) => ({
          id: idx + 1,
          name: item.item,           // 재료명
          remain: item.have,         // 남은 수량
          expected: item.need,       // 필요 수량(예상 소비)
          recommended: item.order,   // 추천 발주량
          orderQty: item.order,      // 발주 (수정 가능)
        }));

        setRows(list);
      } catch (e) {
        console.error(e);
        setError("AI 발주 추천을 불러오는 데 실패했습니다.");
      } finally {
        setLoading(false);
      }
    }

    fetchRecommend();
  }, [inventoryRows]);

  // 발주 칸 수정
  const handleOrderChange = (index, value) => {
    setRows((prev) => {
      const copy = [...prev];
      copy[index] = {
        ...copy[index],
        orderQty: value === "" ? "" : Number(value),
      };
      return copy;
    });
  };

  // 주문 페이지로 이동 (발주 데이터 넘기기)
  const goToOrderPage = () => {
    navigate("/order", {
      state: {
        orderItems: rows, // { name, orderQty, ... } 포함
      },
    });
  };

  return (
    <div
      style={{
        padding: "40px 16px",
        paddingTop: "80px",
        textAlign: "center",
        position: "relative",
        height: "100%",
      }}
    >
      <HeaderNav />

      <h1 style={{ marginBottom: "16px", fontSize: "26px" }}>AI 발주 추천</h1>

      <p style={{ fontSize: "14px", lineHeight: 1.4, marginBottom: "24px" }}>
        발주의 수량을 수정할 수 있습니다.
        <br />
        입력된 수량은 자동으로 장바구니에 추가됩니다.
      </p>

      {loading && <p>AI 발주 추천을 불러오는 중입니다...</p>}
      {error && <p style={{ color: "red", fontSize: "13px" }}>{error}</p>}

      {!loading && !rows.length && !error && (
        <p style={{ fontSize: "13px", color: "#666" }}>
          재고 입력에서 먼저 데이터를 입력한 후
          <br />
          AI 발주 추천으로 이동해주세요.
        </p>
      )}

      {rows.length > 0 && (
        <>
          <div style={{ width: "100%", overflowX: "auto" }}>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                tableLayout: "fixed",
                fontSize: "13px",
              }}
            >
              <thead>
                <tr>
                  {["재료명", "남은 수량", "예상 소비", "추천 발주량", "발주"].map(
                    (head) => (
                      <th
                        key={head}
                        style={{
                          padding: "10px 4px",
                          borderBottom: "1px solid #ccc",
                          textAlign: head === "재료명" ? "left" : "center",
                          width: "20%",
                          fontWeight: "600",
                        }}
                      >
                        {head}
                      </th>
                    )
                  )}
                </tr>
              </thead>
              <tbody>
                {rows.map((row, index) => (
                  <tr key={row.id}>
                    <td
                      style={{
                        padding: "10px 4px",
                        borderBottom: "1px solid #eee",
                        textAlign: "left",
                      }}
                    >
                      {row.name}
                    </td>
                    <td
                      style={{
                        padding: "10px 4px",
                        borderBottom: "1px solid #eee",
                        textAlign: "center",
                      }}
                    >
                      {row.remain}
                    </td>
                    <td
                      style={{
                        padding: "10px 4px",
                        borderBottom: "1px solid #eee",
                        textAlign: "center",
                      }}
                    >
                      {row.expected}
                    </td>
                    <td
                      style={{
                        padding: "10px 4px",
                        borderBottom: "1px solid #eee",
                        textAlign: "center",
                      }}
                    >
                      {row.recommended}
                    </td>
                    <td
                      style={{
                        padding: "10px 4px",
                        borderBottom: "1px solid #eee",
                        textAlign: "center",
                      }}
                    >
                      <input
                        type="number"
                        value={row.orderQty}
                        onChange={(e) =>
                          handleOrderChange(index, e.target.value)
                        }
                        style={{
                          width: "60px",
                          height: "26px",
                          padding: "2px 4px",
                          borderRadius: "4px",
                          border: "1px solid #aaa",
                          textAlign: "center",
                        }}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* 발주하기 버튼 */}
          <button
            type="button"
            onClick={goToOrderPage}
            style={{
              marginTop: "24px",
              padding: "10px 20px",
              borderRadius: "18px",
              border: "none",
              backgroundColor: "#9BD8FF",
              cursor: "pointer",
              fontSize: "14px",
              fontWeight: "bold",
            }}
          >
            발주하기
          </button>
        </>
      )}
    </div>
  );
}
