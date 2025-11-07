import { useNavigate } from "react-router-dom";

export default function MainPage() {
  const navigate = useNavigate();

  return (
    <div style={{ padding: "24px" }}>
      <h1
  style={{
    textAlign: "center",
    marginTop: "20px",
    marginBottom: "24px",
    fontSize: "50px",   // ✅ 폰트 크기 크게
  }}
>
  똑똑발주
</h1>

<div
        style={{
          textAlign: "center",
          fontSize: "20px",
          color: "#01579B",
          marginBottom: "40px",
          lineHeight: "1.6",
        }}
      >
        <div>11/08</div>
        <div>오늘은 발주날이 아니에요!</div>
        <div>판매량, 재고를 입력해주세요.</div>
      </div>

<div
  style={{
    display: "grid",
    gridTemplateColumns: "1fr 1fr", // 2열
    gap: "20px",
    justifyItems: "center",
  }}
>
  <button style={buttonStyle} onClick={() => navigate("/inventory")}>
    {"재고\n입력"}
  </button>

  <button style={buttonStyle} onClick={() => navigate("/ai-order")}>
    {"AI 발주\n추천"}
  </button>

  <button style={buttonStyle} onClick={() => navigate("/report")}>
    {"리포트\n보기"}
  </button>

  <button style={buttonStyle} onClick={() => navigate("/order")}>
    {"주문"}
  </button>
</div>


    </div>
  );
}

const buttonStyle = {
  width: "160px",              // ✅ 버튼 크기 키움
  height: "160px",
  borderRadius: "10px",
  border: "none",
  backgroundColor: "#81D4FA",  // skyblue
  color: "white",
  fontSize: "30px",            // ✅ 글자 크게
  fontWeight: "bold",
  whiteSpace: "pre-line",      // ✅ \n 줄바꿈 인식
  textAlign: "center",
  lineHeight: "1.3",           // ✅ 줄 간격 조절
  display: "flex",
  alignItems: "center",        // ✅ 세로 중앙 정렬
  justifyContent: "center",    // ✅ 가로 중앙 정렬
  cursor: "pointer",
  transition: "0.2s",
};

