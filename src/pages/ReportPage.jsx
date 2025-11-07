// src/pages/ReportPage.jsx
import { useState } from "react";
import HeaderNav from "../components/HeaderNav.jsx";

// 나중에 백엔드에서 가져올 메뉴 리스트 (지금은 더미)
const MENU_OPTIONS = [
  { id: "tteokbokki", label: "떡볶이" },
  { id: "ramen", label: "라면" },
  { id: "kimbap", label: "김밥" },
];

// 달 선택 옵션
const MONTH_OPTIONS = [
  { id: "1", label: "1월" },
  { id: "2", label: "2월" },
  { id: "3", label: "3월" },
  { id: "10", label: "10월" },
];

// 🔹 나중에 백엔드/AI에서 교체할 주차별 판매량 더미 데이터
//   구조: { [menuId]: { [monthId]: [1주, 2주, 3주, 4주] } }
const DUMMY_WEEKLY_SALES = {
  tteokbokki: { "10": [40, 30, 60, 45] },
  ramen: { "10": [20, 25, 30, 35] },
  kimbap: { "10": [15, 18, 22, 28] },
};

// 🔹 전달/이번달 비교용 더미 데이터
//   실제로는 백엔드에서 current_avg / previous_avg / change_percent / message 내려줄 예정
const DUMMY_COMPARISON = {
  tteokbokki: {
    "10": {
      current_avg: 48.3,
      previous_avg: 43.1,
      change_percent: 12.1,
      message: "전달 대비 평균 판매량이 12.1% 늘었어요",
    },
  },
  ramen: {
    "10": {
      current_avg: 30.5,
      previous_avg: 32.0,
      change_percent: -4.7,
      message: "전달 대비 평균 판매량이 4.7% 줄었어요",
    },
  },
  kimbap: {
    "10": {
      current_avg: 22.1,
      previous_avg: 20.0,
      change_percent: 10.5,
      message: "전달 대비 평균 판매량이 10.5% 늘었어요",
    },
  },
};

export default function ReportPage() {
  const [selectedMenu, setSelectedMenu] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("");

  // 메뉴 + 달 선택 시에만 데이터 찾기
  const weeklyData =
    selectedMenu && selectedMonth
      ? DUMMY_WEEKLY_SALES[selectedMenu]?.[selectedMonth] || null
      : null;

  // 전달/이번달 비교 데이터
  const comparison =
    selectedMenu && selectedMonth
      ? DUMMY_COMPARISON[selectedMenu]?.[selectedMonth] || null
      : null;

  // 막대 높이 스케일 (최대값 기준으로 140px에 맞춤)
  const maxValue = weeklyData ? Math.max(...weeklyData, 1) : 1;
  const heightScale = 140 / maxValue;

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
        {/* 제목 */}
        <h1
          style={{
            textAlign: "center",
            fontSize: "24px",
            marginBottom: "24px",
          }}
        >
          리포트
        </h1>

        {/* 섹션 제목 */}
        <h2
          style={{
            fontSize: "16px",
            marginBottom: "8px",
          }}
        >
          판매량 변화
        </h2>

        {/* 드롭다운 영역 */}
        <div
          style={{
            display: "flex",
            gap: "8px",
            marginBottom: "16px",
          }}
        >
          {/* 메뉴 선택 */}
          <select
            value={selectedMenu}
            onChange={(e) => setSelectedMenu(e.target.value)}
            style={{
              width: "90px", // 달 박스와 동일 크기
              height: "32px",
              padding: "4px 8px",
              borderRadius: "4px",
              border: "1px solid #ccc",
            }}
          >
            <option value="">메뉴</option>
            {MENU_OPTIONS.map((m) => (
              <option key={m.id} value={m.id}>
                {m.label}
              </option>
            ))}
          </select>

          {/* 달 선택 */}
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            style={{
              width: "90px",
              height: "32px",
              padding: "4px 8px",
              borderRadius: "4px",
              border: "1px solid #ccc",
            }}
          >
            <option value="">달</option>
            {MONTH_OPTIONS.map((m) => (
              <option key={m.id} value={m.id}>
                {m.label}
              </option>
            ))}
          </select>
        </div>

        {/* 그래프 영역 */}
        <div
          style={{
            border: "1px solid #ddd",
            borderRadius: "8px",
            padding: "16px 12px 12px",
            height: "220px",
            boxSizing: "border-box",
          }}
        >
          {weeklyData ? (
            <>
              {/* 막대 그래프 */}
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-end",
                  justifyContent: "space-between",
                  height: "160px",
                  marginBottom: "8px",
                }}
              >
                {weeklyData.map((value, idx) => (
                  <div
                    key={idx}
                    style={{
                      flex: 1,
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                    }}
                  >
                    {/* 값 표시 */}
                    <div
                      style={{
                        fontSize: "11px",
                        marginBottom: "4px",
                        color: "#555",
                      }}
                    >
                      {value}
                    </div>
                    {/* 막대 */}
                    <div
                      style={{
                        width: "22px",
                        height: `${value * heightScale}px`,
                        backgroundColor: "#CDEFFF",
                        borderRadius: "4px 4px 0 0",
                      }}
                    />
                  </div>
                ))}
              </div>

              {/* 주차 라벨 */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: "12px",
                }}
              >
                <span>첫째주</span>
                <span>둘째주</span>
                <span>셋째주</span>
                <span>넷째주</span>
              </div>
            </>
          ) : (
            <div
              style={{
                height: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "13px",
                color: "#666",
                textAlign: "center",
              }}
            >
              메뉴와 달을 선택하면
              <br />
              주차별 판매량이 표시됩니다.
            </div>
          )}
        </div>

        {/* 🔻 그래프 아래 전달 대비 판매량 비교 박스 */}
        {comparison && (
          <div
            style={{
              marginTop: "16px",
              padding: "12px",
              borderRadius: "8px",
              backgroundColor:
                comparison.change_percent > 0 ? "#E6FFEB" : "#FFECEC", // 증가: 연두, 감소: 연분홍
            }}
          >
            {/* AI에서 내려주는 메인 문구 */}
            <p
              style={{
                fontSize: "14px",
                marginBottom: "4px",
              }}
            >
              {comparison.message}
            </p>

            {/* 평균 값 표시 */}
            <p
              style={{
                fontSize: "12px",
                color: "#555",
              }}
            >
              평균: {comparison.previous_avg}개/일 →{" "}
              {comparison.current_avg}개/일
            </p>

            {/* “전달 대비 판매량 ~었어요” 문구 */}
            <p
              style={{
                fontSize: "12px",
                color: "#555",
                marginTop: "4px",
              }}
            >
              전달 대비 판매량이{" "}
              {Math.abs(comparison.change_percent).toFixed(1)}%
              {comparison.change_percent > 0 ? " 늘었어요." : " 줄었어요."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
